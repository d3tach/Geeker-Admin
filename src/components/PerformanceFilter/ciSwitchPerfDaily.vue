<template>
  <SelectFilter :data="filterData" @change="changeFilter" :defaultValues="filterResult" />
  <div class="select-filter" style="margin-top: 0">
    <div class="select-filter-item">
      <div class="left">
        <div class="select-filter-item-title">
          <span>日期 ：</span>
          <el-date-picker
            v-model="date_value"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateChange"
          >
          </el-date-picker>
        </div>
      </div>
      <div class="middle">
        <SelectFilter :data="performanceDataType" @change="changeFilter" :defaultValues="defaultType"></SelectFilter>
      </div>
      <div class="right"><el-button type="primary" size="large" @click="getTypeData">请求数据</el-button></div>
    </div>
  </div>
</template>

<script setup lang="ts" name="ciSwitchPerfDailyFilter">
import { ref } from "vue";
import SelectFilter from "@/components/SelectFilter/index.vue";
import { CIProjectNameApi, CICaseNameApi, CIDeviceIpApi, CIPerformanceDataApi } from "@/api/modules/performance";
import cloneDeep from "lodash/cloneDeep"; // 引入lodash库中的cloneDeep方法

const emit = defineEmits(["updateDataResult", "updateFilterResult", "allDeviceInfo"]);
const filterData = ref([
  {
    title: "项目名",
    key: "project",
    multiple: true,
    options: [
      {
        label: "All",
        value: ""
      }
    ]
  },
  {
    title: "case名",
    key: "case",
    multiple: true,
    options: [
      {
        label: "All",
        value: ""
      }
    ]
  },
  {
    title: "设备ip",
    key: "ip",
    multiple: true,
    options: [
      {
        label: "All",
        value: ""
      }
    ]
  }
]);

const performanceDataType = ref([
  {
    title: "数据类型",
    key: "types",
    multiple: false,
    options: [
      {
        label: "FPS",
        value: "fps"
      },
      {
        label: "内存",
        value: "memory"
      },
      {
        label: "CPU利用率",
        value: "cpu_use"
      },
      {
        label: "CPU频率",
        value: "cpu_freq"
      },
      {
        label: "GPU使用率",
        value: "gpu"
      }
    ]
  }
]);

const filterResult: any = ref({});

const changeFilter = (val: any) => {
  // 使用对象的扩展运算符将原始数据和新数据合并
  const newFilterResult = { ...filterResult.value, ...val };
  filterResult.value = {};
  // 如果新数据中不存在某个属性，则从原始数据中获取该属性并添加到新数据中
  for (const [key, value] of Object.entries(newFilterResult)) {
    if (value) {
      filterResult.value[key] = value;
    }
  }
  emit("updateFilterResult", filterResult);
};

// Project Name
const getProjectNames = async () => {
  const projectNames: any = await CIProjectNameApi();
  const options = [{ label: "All", value: "" }];
  for (let i = 0; i < projectNames.length; i++) {
    options.push({ label: projectNames[i], value: projectNames[i] });
  }
  filterData.value[0].options = options;
  filterResult.value["project"] = [projectNames[0]];
};

// Case Name
const getCaseNames = async () => {
  const caseNames: any = await CICaseNameApi();
  const options = [{ label: "All", value: "" }];
  for (let i = 0; i < caseNames.length; i++) {
    options.push({ label: caseNames[i], value: caseNames[i] });
  }
  filterData.value[1].options = options;
  filterResult.value["case"] = [caseNames[0]];
};

// Device
const device_infos: any = [];
const getDevices = async () => {
  const device_ips: any = await CIDeviceIpApi();
  const options = [{ label: "All", value: "" }];
  for (let i = 0; i < device_ips.length; i++) {
    options.push({ label: device_ips[i], value: device_ips[i] });
  }
  filterData.value[2].options = options;
  filterResult.value["ip"] = [""];
  for (let i = 0; i < device_ips.length; i++) {
    // device_infos[device_ips[i].device_id] = device_ips[i];
    device_infos.push(device_ips[i]);
    if (!filterResult.value["ip"].includes(device_ips[i])) {
      filterResult.value["ip"].push(device_ips[i]);
    }
  }
  emit("allDeviceInfo", device_infos);
};

// 日期
const date_value = ref<Array<Date>>([]);
const initDate = () => {
  const now = new Date(); // 获取当前日期
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 获取前一周日期
  const startDate = [oneMonthAgo, now]; // 开始日期为前一周到今天
  date_value.value = startDate; // 设置日期范围为开始日期到结束日期
  handleDateChange(date_value.value);
};
const handleDateChange = (value: Array<Date>) => {
  if (value === null) {
    if (filterResult.value.hasOwnProperty("date")) {
      // 如果 filterResult 中拥有 date 属性，则删除该属性
      delete filterResult.value.date;
    }
    emit("updateFilterResult", filterResult);
    return;
  }
  const startDate = value[0];
  const endDate = value[1];
  const dateArr = [];
  // 遍历开始日期到结束日期，将每个日期添加到数组中
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const month = ("0" + (d.getMonth() + 1)).slice(-2);
    const day = ("0" + d.getDate()).slice(-2);
    dateArr.push(`${year}-${month}-${day}`);
  }
  filterResult.value.date = dateArr;
  emit("updateFilterResult", filterResult);
};

//数据请求
const dataResult: any = ref([]);
const defaultType = { types: ["fps"] };
const initDataType = () => {
  changeFilter(defaultType);
};
const getTypeData = async () => {
  let param: any = {};
  let timeout = 5000;
  while (cloneDeep(filterResult.value) && timeout >= 0) {
    timeout -= 100;
    param = cloneDeep(filterResult.value);
    if (param && param.hasOwnProperty("ip")) {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // 每隔 100 毫秒检查一次
  }
  if (param.types.some((type: any) => type.indexOf("cpu") !== -1)) {
    // types中存在"cpu",改为"cpu"
    param.types = ["cpu"];
  }
  try {
    dataResult.value = await CIPerformanceDataApi(param);
  } catch (error) {
    console.log(error);
    dataResult.value = [];
  } finally {
    emit("updateDataResult", dataResult);
  }
};

getProjectNames();
getCaseNames();
getDevices();
initDate();
initDataType();

getTypeData();

defineExpose({
  getTypeData
});
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
