<template>
	<SelectFilter :data="filterData" @change="changeFilter" :defaultValues="filterResult" />
	<div class="select-filter">
		<div class="select-filter-item">
			<div class="select-filter-item-title"><span>日期 ：</span></div>

			<div class="select-filter-date-picker">
				<el-date-picker v-model="date_value" type="date" placeholder="选择日期" @change="handleDateChange"> </el-date-picker>
			</div>
			<SelectFilter :data="performanceTypeData"></SelectFilter>
			<div>
				<el-button type="primary" size="large">请求数据</el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="PerformanceFilter">
import { ref } from "vue";
import SelectFilter from "@/components/SelectFilter/index.vue";
import { EditorApi, ProjectNameApi, CaseNameApi, DeviceApi } from "@/api/modules/performance";

const filterData = ref([
	{
		title: "editor版本",
		key: "editor_id",
		multiple: false,
		options: [
			{
				label: "None",
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
				label: "None",
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
				label: "None",
				value: ""
			}
		]
	},
	{
		title: "设备名",
		key: "device_id",
		multiple: false,
		options: [
			{
				label: "None",
				value: ""
			}
		]
	}
]);

const performanceTypeData = ref([
	{
		title: "数据类型",
		key: "type_id",
		multiple: false,
		options: [
			{
				label: "None",
				value: ""
			},
			{
				label: "FPS",
				value: "FPS"
			},
			{
				label: "内存",
				value: "memory"
			},
			{
				label: "CPU",
				value: "cpu"
			},
			{
				label: "GPU",
				value: "gpu"
			}
		]
	}
]);

const filterResult: any = ref({});

const changeFilter = (val: typeof filterResult.value) => {
	// 使用对象的扩展运算符将原始数据和新数据合并
	const newFilterResult = { ...filterResult.value, ...val };
	filterResult.value = {};
	// 如果新数据中不存在某个属性，则从原始数据中获取该属性并添加到新数据中
	for (const [key, value] of Object.entries(newFilterResult)) {
		if (value && value[0]) {
			filterResult.value[key] = value;
		}
	}
};
// Editor
const getEditors = async (): Promise<void> => {
	const editors: any = await EditorApi();
	const options = [
		{ label: "None", value: "" },
		...editors.map(editor => ({ label: editor.editor_version, value: editor.editor_id }))
	];

	filterData.value[0].options = options;
	filterResult.value["editor_id"] = [options[1].value];
};

// Project Name
const getProjectNames = async () => {
	const projectNames: any = await ProjectNameApi();
	const options = [{ label: "None", value: "" }];
	for (let i = 0; i < projectNames.length; i++) {
		options.push({ label: projectNames[i], value: projectNames[i] });
	}
	filterData.value[1].options = options;
};

// Case Name
const getCaseNames = async () => {
	const caseNames: any = await CaseNameApi();
	const options = [{ label: "None", value: "" }];
	for (let i = 0; i < caseNames.length; i++) {
		options.push({ label: caseNames[i], value: caseNames[i] });
	}
	filterData.value[2].options = options;
};

// Device
const getDevices = async () => {
	const devices: any = await DeviceApi();
	const options = [{ label: "None", value: "" }, ...devices.map(device => ({ label: device.name, value: device.device_id }))];
	filterData.value[3].options = options;
};

// 日期
let date_value = ref<string | null>(null);
const initDate = () => {
	const today = new Date();
	const year = today.getFullYear();
	const month = today.getMonth() + 1;
	const day = today.getDate();
	const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
	date_value.value = formattedDate;
	handleDateChange(today);
};
const handleDateChange = value => {
	if (value === null) {
		if (filterResult.value.hasOwnProperty("date")) {
			// 如果 filterResult 中拥有 date 属性，则删除该属性
			delete filterResult.value.date;
		}
		return;
	}
	const date = new Date(value);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

	filterResult.value.date = [formattedDate];
};

//数据请求
// enum PerformanceDataType {
// 	FPS = "fps",
// 	Memory = "memory"
// }
// const get_data = async (dataType: PerformanceDataType): Promise<void> => {
// 	filterPerformanceResult.value = performanceFilterRef.value.filterResult;
// 	const param = { types: [dataType], ...filterPerformanceResult.value };
// 	try {
// 		let resultData;
// 		// 根据 dataType 判断要调用哪个 API
// 		switch (dataType) {
// 			case PerformanceDataType.FPS:
// 				resultData = await FPSApi(param);
// 				break;
// 			case PerformanceDataType.Memory:
// 				resultData = await MemoryApi(param);
// 				break;
// 			default:
// 				throw new Error("未知的性能数据类型");
// 		}
// 		deal_option_data(resultData);
// 	} catch (error) {
// 		myChart.setOption(defaultOption);
// 		console.log("请求数据时出错", error);
// 	} finally {
// 		console.log(defaultOption);
// 	}
// };

getEditors();
getProjectNames();
getCaseNames();
getDevices();
initDate();
defineExpose({
	filterResult
});
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
