<template>
	<div class="card content-box">
		<span class="text">fps（待完善） 🍓🍇🍈🍉</span>
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

		<span class="result">返回值: {{ filterResult }}</span>
		<el-button type="primary" size="default" @click="get_fps_data">测试按钮</el-button>
	</div>
</template>

<script setup lang="ts" name="selectFilter">
import { ref } from "vue";
import SelectFilter from "@/components/SelectFilter/index.vue";
import { EditorApi, CaseNameApi, FPSApi, DeviceApi } from "@/api/modules/performance";

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

const filterResult = ref({});

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
	const editors = await EditorApi();
	const options = [
		{ label: "None", value: "" },
		...editors.map(editor => ({ label: editor.editor_version, value: editor.editor_id }))
	];
	// 降序
	options.sort((a, b) => {
		if (a.label > b.label) return -1;
		if (a.label < b.label) return 1;
		return 0;
	});
	filterData.value[0].options = options;
	filterResult.value["editor_id"] = [options[1].value];
};

// Case Name
const getCaseNames = async () => {
	const caseNames = await CaseNameApi();
	const options = [{ label: "None", value: "" }];
	for (let i = 0; i < caseNames.length; i++) {
		options.push({ label: caseNames[i], value: caseNames[i] });
	}
	filterData.value[1].options = options;
};

// Device
const getDevices = async () => {
	const devices = await DeviceApi();
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

const get_fps_data = async (): Promise<void> => {
	const param = { types: ["fps"], ...filterResult.value };
	const FPSData = await FPSApi(param);
	console.log(FPSData);
};
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
