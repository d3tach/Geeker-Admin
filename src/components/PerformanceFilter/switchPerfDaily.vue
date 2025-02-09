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

<script setup lang="ts" name="switchPerfDailyFilter">
import { ref, defineEmits, defineExpose } from "vue";
import SelectFilter from "@/components/SelectFilter/index.vue";
import { EditorDailyApi, ProjectNameApi, CaseNameApi, DeviceApi } from "@/api/modules/performance";
import { PerformanceDataApi } from "@/api/modules/performance";
import cloneDeep from "lodash/cloneDeep"; // 引入lodash库中的cloneDeep方法

const emit = defineEmits(["updateDataResult", "updateFilterResult", "allDeviceInfo"]);
const filterData = ref([
	{
		title: "editor版本",
		key: "editor_id",
		multiple: true,
		options: [
			{
				label: "All",
				value: ""
			}
		]
	},
	{
		title: "项目名",
		key: "project_name",
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
		key: "case_name",
		multiple: true,
		options: [
			{
				label: "All",
				value: ""
			}
		]
	},
	{
		title: "设备名",
		key: "device_id",
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

const changeFilter = val => {
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
// Editor
const getEditors = async (): Promise<void> => {
	const editors: any = await EditorDailyApi();
	const options = [
		{ label: "All", value: "" },
		...editors.map(editor => ({ label: editor.editor_version, value: editor.editor_id }))
	];

	filterData.value[0].options = options;
	filterResult.value["editor_id"] = [""];
	for (let i = 0; i < options.length; i++) {
		const editor_value = options[i].value;
		if (!filterResult.value["editor_id"].includes(editor_value)) filterResult.value["editor_id"].push(editor_value);
	}
	// filterResult.value["editor_id"] = [options[0].value];
};

// Project Name
const getProjectNames = async () => {
	const projectNames: any = await ProjectNameApi();
	const options = [{ label: "All", value: "" }];
	for (let i = 0; i < projectNames.length; i++) {
		options.push({ label: projectNames[i], value: projectNames[i] });
	}
	filterData.value[1].options = options;
	filterResult.value["project_name"] = [projectNames[0]];
};

// Case Name
const getCaseNames = async () => {
	const caseNames: any = await CaseNameApi();
	const options = [{ label: "All", value: "" }];
	for (let i = 0; i < caseNames.length; i++) {
		options.push({ label: caseNames[i], value: caseNames[i] });
	}
	filterData.value[2].options = options;
	filterResult.value["case_name"] = [caseNames[0]];
};

// Device
const device_infos: any = {};
const getDevices = async () => {
	const devices: any = await DeviceApi();
	const options = [{ label: "All", value: "" }, ...devices.map(device => ({ label: device.name, value: device.device_id }))];
	filterData.value[3].options = options;
	filterResult.value["device_id"] = ["ABJK022818007862"];
	for (let i = 0; i < devices.length; i++) {
		device_infos[devices[i].device_id] = devices[i];
	}
	emit("allDeviceInfo", device_infos);
};

// 日期
const date_value = ref<Array<Date>>([]);
const initDate = () => {
	const now = new Date(); // 获取当前日期
	const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 获取前一周日期
	const startDate = [oneWeekAgo, now]; // 开始日期为前一周到今天
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
	const param = cloneDeep(filterResult.value);
	if (param.types.some(type => type.indexOf("cpu") !== -1)) {
		// types中存在"cpu",改为"cpu"
		param.types = ["cpu"];
	}
	try {
		dataResult.value = await PerformanceDataApi(param);
	} catch (error) {
		console.log(error);
		dataResult.value = [];
	} finally {
		emit("updateDataResult", dataResult);
		return dataResult.value;
	}
};
defineExpose({
	getTypeData
});
getEditors();
getProjectNames();
getCaseNames();
getDevices();
initDate();
initDataType();
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
