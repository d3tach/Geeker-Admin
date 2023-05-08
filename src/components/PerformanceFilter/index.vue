<template>
	<SelectFilter :data="filterData" @change="changeFilter" :defaultValues="filterResult" />
	<div class="select-filter">
		<div class="select-filter-item">
			<div class="select-filter-item-title"><span>日期 ：</span></div>
			<el-scrollbar>
				<div class="select-filter-list">
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
			</el-scrollbar>
		</div>
	</div>
</template>

<script setup lang="ts" name="selectFilter">
import { ref } from "vue";
import SelectFilter from "@/components/SelectFilter/index.vue";
import { EditorApi, CaseNameApi, DeviceApi } from "@/api/modules/performance";

const filterData = ref([
	{
		title: "editor版本",
		key: "editor_id",
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
		multiple: true,
		options: [
			{
				label: "None",
				value: ""
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
		if (value[0] !== "") {
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

// Case Name
const getCaseNames = async () => {
	const caseNames: any = await CaseNameApi();
	const options = [{ label: "None", value: "" }];
	for (let i = 0; i < caseNames.length; i++) {
		options.push({ label: caseNames[i], value: caseNames[i] });
	}
	filterData.value[1].options = options;
};

// Device
const getDevices = async () => {
	const devices: any = await DeviceApi();
	const options = [{ label: "None", value: "" }, ...devices.map(device => ({ label: device.name, value: device.device_id }))];
	filterData.value[2].options = options;
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

	return dateArr;
};

getEditors();
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
