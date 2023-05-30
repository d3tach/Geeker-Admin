<template>
  <div class="card content-box">
    <!-- <span class="text">性能开关数据</span> -->
    <ciSwitchPerfDailyFilter
      ref="ciSwitchPerfDailyFilterRef"
      @update-filter-result="handleFilterChanged"
      @update-data-result="handleDataChanged"
      @all-device-info="handleGetDeviceInfo"
    ></ciSwitchPerfDailyFilter>
    <div v-show="show_memory_select">
      <SelectFilter :data="memoryFilter" @change="changeMemoryFilter" :default-values="{ memory: ['Total'] }" />
    </div>

    <div ref="echartsRef" style="width: 100%; height: 900%"></div>
  </div>
</template>

<script setup lang="ts" name="ciSwitchPerformanceDaily">
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import { useEcharts } from "@/hooks/useEcharts";
import cloneDeep from "lodash/cloneDeep"; // 引入lodash库中的cloneDeep方法
import ciSwitchPerfDailyFilter from "@/components/PerformanceFilter/ciSwitchPerfDaily.vue";
import SelectFilter from "@/components/SelectFilter/index.vue";

// 内存处理
const show_memory_select = ref(false); //是否显示内存筛选条件
const memoryFilter = ref([
  {
    title: "内存项",
    key: "memory",
    multiple: true,
    options: [
      {
        label: "All",
        value: ""
      },
      {
        label: "Total",
        value: "Total"
      },
      {
        label: "Java Heap",
        value: "Java Heap"
      },
      {
        label: "Native Heap",
        value: "Native Heap"
      },
      {
        label: "Code",
        value: "Code"
      },
      {
        label: "Stack",
        value: "Stack"
      },
      {
        label: "Graphics",
        value: "Graphics"
      },
      {
        label: "Private Other",
        value: "Private Other"
      },
      {
        label: "System",
        value: "System"
      },
      {
        label: "Unknown",
        value: "Unknown"
      }
    ]
  }
]);
const memorySelectedParam = ref(["Total"]);
const changeMemoryFilter = (val: any) => {
  memorySelectedParam.value = val.memory;
  console.log("改变内存筛选", memorySelectedParam.value);
  if (dataResult.value && filterResult.value.types.includes("memory")) {
    myChart.clear(); //先清理图表
    chartOption.legend.data = [];
    chartOption.series = [];
    deal_memory_data(dataResult.value);
    myChart.setOption(chartOption);
  }
};

//数据显示
const echartsRef = ref<HTMLElement>();
let myChart: echarts.ECharts; // 将 myChart 设置为组件实例的属性

const defaultOption = {
  title: {
    text: "",
    left: "center", // 标题水平居中
    textStyle: {
      color: "#333",
      fontSize: 28,
      fontWeight: "bold",
      textShadowColor: "rgba(0, 0, 0, 0.5)", // 阴影颜色
      textShadowBlur: 5, // 阴影模糊程度
      textShadowOffsetX: 2, // 阴影偏移量 X
      textShadowOffsetY: 2 // 阴影偏移量 Y
    }
  },
  tooltip: {
    trigger: "axis",
    showContent: true
  },
  legend: {
    top: "20",
    type: "scroll",
    padding: [20, 10], // 增加内边距
    data: [] as any[]
  } as any,

  toolbox: {
    feature: {
      saveAsImage: {},
      dataZoom: { show: false } // 添加dataZoom组件
    }
  },
  dataZoom: [
    {
      // 开启数据区域缩放，支持选择区域和滚轮缩放两种方式
      type: "inside",
      start: 0, // 开始位置
      end: 100, // 结束位置
      zoomOnMouseWheel: true, // 开启鼠标滚轮缩放
      moveOnMouseMove: true // 开启鼠标移动缩放
    }
  ],
  xAxis: {
    type: "category",
    name: "日期",
    nameLocation: "end",
    boundaryGap: true,
    axisLine: {
      symbol: ["none", "arrow"], // 在 X 轴的末尾添加箭头
      lineStyle: {
        color: "#333",
        width: 2
      }
    },
    data: []
  },
  yAxis: {
    type: "value",
    scale: true,
    axisLabel: {},
    axisLine: {
      show: true, // 是否显示坐标轴轴线
      symbol: ["none", "arrow"], // 轴线两端箭头，两个值，none表示没有箭头，arrow表示有箭头
      lineStyle: {
        color: "#333",
        width: 2
      }
    }
  },
  grid: {
    left: "2%",
    right: "4%",
    bottom: "4%",
    top: "12%", // 设置顶部留白空间
    containLabel: true
  },
  graphic: [],
  series: [] as any[]
};
let chartOption = cloneDeep(defaultOption); // 使用对象解构创建新的对象
onMounted(() => {
  myChart = echarts.init(echartsRef.value as HTMLElement);
  useEcharts(myChart, chartOption);
  myChart.setOption(chartOption);
});

//数据更新
const filterResult = ref();
const dataResult = ref();
const ciSwitchPerfDailyFilterRef = ref();
let device_infos = {}; //设备信息存个变量,避免多次重复请求数据
let date_list: any = []; //日期列表
const handleGetDeviceInfo = (device_info: any) => {
  device_infos = device_info;
  console.log("接受到device_info", device_infos);
};
const handleFilterChanged = (filter: any) => {
  filterResult.value = filter.value;
  console.log("接受到filter", filterResult.value);
  if (ciSwitchPerfDailyFilterRef.value) {
    ciSwitchPerfDailyFilterRef.value.getTypeData();
  }
  if (filterResult.value.types) {
    show_memory_select.value = filterResult.value.types.includes("memory") ? true : false;
  }
};
const handleDataChanged = async (data: any) => {
  dataResult.value = data.value;
  console.log("接受到data", data.value);
  date_list = []; //日期数据列表
  data.value.forEach((item: any) => {
    if (!date_list.includes(item.date)) {
      date_list.push(item.date);
    }
  });
  //画图表
  draw_chart(dataResult.value);
};

const draw_chart = (data: any) => {
  myChart.clear(); //先清理图表
  chartOption.xAxis.data = date_list;
  chartOption.yAxis.axisLabel = {};
  chartOption.legend.data = [];
  chartOption.graphic = [];
  chartOption.series = [];
  let data_type = filterResult.value.types[0];
  chartOption.title.text = data_type + "均值";
  switch (data_type) {
    case "fps":
      deal_fps_data(data);
      break;
    case "memory":
      deal_memory_data(data);
      break;
    case "cpu_use":
      deal_cpu_use(data);
      break;
    case "cpu_freq":
      deal_cpu_freq(data);
      break;
    case "gpu":
      deal_gpu_use(data);
    default:
      break;
  }
  myChart.setOption(chartOption);
};

const deal_fps_data = (data: any) => {
  chartOption.yAxis.axisLabel = {
    formatter: "{value}帧",
    margin: 25
  };
  const avg_fps_data: any = {};
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const avg_fps = item.fps;
    let legendName;

    if (filterResult.value["ip"] && filterResult.value["ip"].length === 1) {
      legendName = item.project + " " + item.case;
    } else {
      legendName = item.project + " " + item.case + " " + item.ip;
    }

    if (!avg_fps_data[legendName]) {
      avg_fps_data[legendName] = [];
      for (let j = 0; j < date_list.length; j++) {
        avg_fps_data[legendName].push(null);
      }
    }
    const date_index = date_list.indexOf(item.date);
    avg_fps_data[legendName][date_index] = avg_fps;
  }

  for (let legendName in avg_fps_data) {
    if (!chartOption.legend.data.includes(legendName)) {
      chartOption.legend.data.push(legendName);
    }
    // 添加线条数据
    chartOption.series.push({
      name: legendName,
      type: "line",
      label: {
        show: true,
        position: "top"
      },
      connectNulls: true,
      data: avg_fps_data[legendName]
    });
  }
};

const deal_memory_data = (data: any) => {
  chartOption.yAxis.axisLabel = {
    formatter: "{value}MB",
    margin: 25
  };
  chartOption.legend["selected"] = {};
  const avg_memory_data: any = {};

  let memory_param = memorySelectedParam.value;
  if (!memory_param || !memory_param[0]) {
    memory_param = Object.keys(data[0].memory);
  }

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    for (let j = 0; j < memory_param.length; j++) {
      const memoryParam = memory_param[j];
      const avg_memory = item.memory[memoryParam];
      let legendName;
      if (filterResult.value["ip"] && filterResult.value["ip"].length === 1) {
        legendName = item.project + " " + item.case + " " + memory_param[j];
      } else {
        legendName = item.project + " " + item.case + " " + memory_param[j] + " " + item.ip;
      }
      if (!avg_memory_data[legendName]) {
        avg_memory_data[legendName] = [];
        for (let k = 0; k < date_list.length; k++) {
          avg_memory_data[legendName].push(null);
        }
      }
      const date_index = date_list.indexOf(item.date);
      avg_memory_data[legendName][date_index] = avg_memory;
    }
  }
  for (let legendName in avg_memory_data) {
    if (!chartOption.legend.data.includes(legendName)) {
      chartOption.legend.data.push(legendName);
      // if (!legendName.includes("Total")) {
      // 	chartOption.legend["selected"][legendName] = false;
      // }
    }
    // 添加线条数据
    chartOption.series.push({
      name: legendName,
      type: "line",
      label: {
        show: true,
        position: "top"
      },
      connectNulls: true,
      data: avg_memory_data[legendName]
    });
  }
};

const deal_cpu_freq = (data: any) => {
  chartOption.yAxis.axisLabel = {
    formatter: "{value}GHz",
    margin: 25
  };

  // cpu频率图表
  const avg_cpu_freq_data: any = {};
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const date_index = date_list.indexOf(item.date);
    for (let j = 0; j < 3; j++) {
      const avg_cpu_freq = item.cpu_freq["cpu_freq" + j];
      let legendName;
      if (filterResult.value["ip"] && filterResult.value["ip"].length === 1) {
        legendName = item.project + " " + item.case + " Cluster" + j + " ";
      } else {
        legendName = item.project + " " + item.case + " Cluster" + j + " " + item.ip;
      }

      if (!avg_cpu_freq_data[legendName]) {
        avg_cpu_freq_data[legendName] = [];
        for (let k = 0; k < date_list.length; k++) {
          avg_cpu_freq_data[legendName].push(null);
        }
      }
      avg_cpu_freq_data[legendName][date_index] = avg_cpu_freq;
    }
  }

  for (let legendName in avg_cpu_freq_data) {
    if (!chartOption.legend.data.includes(legendName)) {
      chartOption.legend.data.push(legendName);
    }
    // 添加线条数据
    chartOption.series.push({
      name: legendName,
      type: "line",
      label: {
        show: true,
        position: "top"
      },
      connectNulls: true,
      data: avg_cpu_freq_data[legendName]
    });
  }

  myChart.setOption(chartOption);
};

const deal_cpu_use = (data: any) => {
  chartOption.yAxis.axisLabel = {
    formatter: "{value}%",
    margin: 15
  };
  const avg_cpu_data: any = {};
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const avg_cpu = item.cpu_utilization;
    let legendName;
    if (filterResult.value["ip"] && filterResult.value["ip"].length === 1) {
      legendName = item.project + " " + item.case;
    } else {
      legendName = item.project + " " + item.case + " " + item.ip;
    }

    if (!avg_cpu_data[legendName]) {
      avg_cpu_data[legendName] = [];
      for (let j = 0; j < date_list.length; j++) {
        avg_cpu_data[legendName].push(null);
      }
    }
    const date_index = date_list.indexOf(item.date);
    avg_cpu_data[legendName][date_index] = avg_cpu;
  }
  for (let legendName in avg_cpu_data) {
    if (!chartOption.legend.data.includes(legendName)) {
      chartOption.legend.data.push(legendName);
    }
    // 添加线条数据
    chartOption.series.push({
      name: legendName,
      type: "line",
      label: {
        show: true,
        position: "top"
      },
      connectNulls: true,
      data: avg_cpu_data[legendName]
    });
  }
};

const deal_gpu_use = (data: any) => {
  chartOption.yAxis.axisLabel = {
    formatter: "{value}%",
    margin: 15
  };
  const avg_gpu_data: any = {};
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const avg_gpu = item.gpu;
    let legendName;
    if (filterResult.value["ip"] && filterResult.value["ip"].length === 1) {
      legendName = item.project + " " + item.case;
    } else {
      legendName = item.project + " " + item.case + " " + item.ip;
    }

    if (!avg_gpu_data[legendName]) {
      avg_gpu_data[legendName] = [];
      for (let j = 0; j < date_list.length; j++) {
        avg_gpu_data[legendName].push(null);
      }
    }
    const date_index = date_list.indexOf(item.date);
    avg_gpu_data[legendName][date_index] = avg_gpu;
  }

  for (let legendName in avg_gpu_data) {
    if (!chartOption.legend.data.includes(legendName)) {
      chartOption.legend.data.push(legendName);
    }
    // 添加线条数据
    chartOption.series.push({
      name: legendName,
      type: "line",
      label: {
        show: true,
        position: "top"
      },
      connectNulls: true,
      data: avg_gpu_data[legendName]
    });
  }
};
</script>
