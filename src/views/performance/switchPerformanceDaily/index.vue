<template>
	<div class="card content-box">
		<!-- <span class="text">性能开关数据</span> -->
		<switchPerfDailyFilter
			@update-filter-result="handleFilterChanged"
			@update-data-result="handleDataChanged"
			@all-device-info="handleGetDeviceInfo"
		></switchPerfDailyFilter>
		<div ref="echartsRef" style="width: 100%; height: 900%"></div>
	</div>
</template>

<script setup lang="ts" name="switchPerformanceDaily">
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import { useEcharts } from "@/hooks/useEcharts";
import cloneDeep from "lodash/cloneDeep"; // 引入lodash库中的cloneDeep方法
import switchPerfDailyFilter from "@/components/PerformanceFilter/switchPerfDaily.vue";

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
		padding: [20, 10], // 增加内边距
		data: []
	},

	toolbox: {
		feature: {
			saveAsImage: {},
			dataZoom: {} // 添加dataZoom组件
		}
	},
	dataZoom: [
		{
			// 开启数据区域缩放，支持选择区域和滚轮缩放两种方式
			type: "inside",
			start: 0,
			orient: "vertical", // 纵向放缩
			end: 100,
			bottom: 30
		},
		{
			start: 0,
			end: 100,
			height: 20,
			handleIcon:
				"path://M17.3,7.9l-4.4-4.4c-0.4-0.4-1-0.4-1.4,0L6.4,9.7c-0.4,0.4-0.4,1,0,1.4l5.5,5.5c0.4,0.4,1,0.4,1.4,0l5.5-5.5c0.4-0.4,0.4-1,0-1.4L17.3,7.9z",
			handleSize: "50%", // 缩放手柄大小
			handleStyle: {
				color: "#fff",
				shadowBlur: 3,
				shadowColor: "rgba(0, 0, 0, 0.6)",
				shadowOffsetX: 2,
				shadowOffsetY: 2
			}
		}
	],
	xAxis: {
		type: "category",
		name: "日期",
		nameLocation: "end",
		boundaryGap: false,
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
		bottom: "3%",
		top: "12%", // 设置顶部留白空间
		containLabel: true
	},
	graphic: [],
	series: []
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
let device_infos = {}; //设备信息存个变量,避免多次重复请求数据
let date_list = []; //日期列表
const handleGetDeviceInfo = device_info => {
	device_infos = device_info;
	console.log("接受到device_info", device_infos);
};
const handleFilterChanged = filter => {
	filterResult.value = filter.value;
	console.log("接受到filter", filterResult.value);
};
const handleDataChanged = async data => {
	dataResult.value = data.value;
	date_list = []; //日期数据列表
	data.value.forEach(item => {
		if (!date_list.includes(item.date)) {
			date_list.push(item.date);
		}
	});
	//画图表
	draw_chart(dataResult.value);
	console.log("接受到data", data.value);
};

//返回数组均值
const average = (arr: number[]) => {
	if (arr.length === 0) {
		return 0;
	}
	const sum = arr.reduce((acc, val) => acc + val);
	const avg = sum / arr.length;
	return Number(avg.toFixed(2)); // 保留两位小数
};

const draw_chart = data => {
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

const deal_fps_data = data => {
	chartOption.yAxis.axisLabel = {
		formatter: "{value}帧",
		margin: 25
	};
	const avg_fps_data: any = {};
	for (let i = 0; i < data.length; i++) {
		const item = data[i];
		const avg_fps = average(item.fps_data);
		let legendName;
		if (filterResult.value["device_id"] && filterResult.value["device_id"].length === 1) {
			legendName = item.project_name + " " + item.case_name;
		} else {
			legendName = item.project_name + " " + item.case_name + " " + device_infos[item.device_id].name;
		}

		if (!avg_fps_data[legendName]) {
			avg_fps_data[legendName] = [];
			for (let j = 0; j < date_list.length; j++) {
				avg_fps_data[legendName].push(0); //[0,0,0,0]
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
			data: avg_fps_data[legendName]
		});
	}
};

const deal_memory_data = data => {
	chartOption.yAxis.axisLabel = {
		formatter: "{value}MB",
		margin: 25
	};
	const avg_memory_data: any = {};
	const memory_param = Object.keys(data[0].memory_data[0]);
	for (let i = 0; i < data.length; i++) {
		const item = data[i];
		for (let j = 0; j < memory_param.length; j++) {
			const memoryParam = memory_param[j];
			const avg_memory = average(item.memory_data.map(memory => memory[memoryParam].Pss));
			let legendName;
			if (filterResult.value["device_id"] && filterResult.value["device_id"].length === 1) {
				legendName = item.project_name + " " + item.case_name + " " + memory_param[j];
			} else {
				legendName = item.project_name + " " + item.case_name + " " + memory_param[j] + " " + device_infos[item.device_id].name;
			}
			if (!avg_memory_data[legendName]) {
				avg_memory_data[legendName] = [];
				for (let k = 0; k < date_list.length; k++) {
					avg_memory_data[legendName].push(0); //[0,0,0,0]
				}
			}
			const date_index = date_list.indexOf(item.date);
			avg_memory_data[legendName][date_index] = avg_memory;
		}
	}
	for (let legendName in avg_memory_data) {
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
			data: avg_memory_data[legendName]
		});
	}
};

const deal_cpu_freq = data => {
	let devices_id = filterResult.value.device_id;
	if (!devices_id) {
		devices_id = Object.keys(device_infos);
	}
	const defaultGraphic = {
		type: "group",
		right: 20,
		top: 100,
		draggable: true,
		children: [
			{
				type: "rect",
				z: 100,
				shape: {
					width: 300,
					height: 100,
					r: 10 //圆角
				},
				style: {
					fill: "rgba(234, 238, 241,1)", // 矩形填充颜色
					shadowBlur: 1, // 阴影模糊程度
					shadowOffsetX: 1, // 阴影偏移量 X
					shadowOffsetY: 1 // 阴影偏移量 Y
				}
			},
			{
				type: "text", // 文字
				z: 101,
				position: [150, 10], // 将文本放置在矩形中央（位置自行调整）
				style: {
					fill: "#e46c11",
					fontWeight: "bold",
					text: "cpu",
					font: "14px Microsoft YaHei",
					textAlign: "center" // 水平居中对齐
				}
			}
		]
	};

	// cpu频率信息矩形框
	for (let i = 0; i < devices_id.length; i++) {
		const newGraphic = cloneDeep(defaultGraphic);
		newGraphic.top = 60 + 130 * i;
		newGraphic.children[1].style.text = device_infos[devices_id[i]].name + "\n" + device_infos[devices_id[i]].cpu_info.cpu_brand;

		//处理cpu集群名
		for (let j = 0; j < device_infos[devices_id[i]].cpu_info.cpu_affected_lists.length; j++) {
			const cpu_affected_list = device_infos[devices_id[i]].cpu_info.cpu_affected_lists[j];
			const nums = cpu_affected_list.split(" ");
			let cpu_affected_list_name: any;
			if (nums.length > 1) {
				const cpu_affected_list_first = `cpu${nums[0]}`;
				const cpu_affected_list_last = `cpu${nums.length > 1 ? nums[nums.length - 1] : nums[0]}`;
				cpu_affected_list_name = `${cpu_affected_list_first}~${cpu_affected_list_last}`;
			} else {
				cpu_affected_list_name = `cpu${nums[0]}`;
			}
			const cpu_freq_limit_list = device_infos[devices_id[i]].cpu_info.cpu_freq_limit_lists[j];
			const cpu_min_freq = cpu_freq_limit_list[0];
			const cpu_max_freq = cpu_freq_limit_list[1];

			//添加cpu集群信息至信息卡
			const cpu_affected_list_info: any = {
				type: "text", // 文字
				z: 101,
				left: 10,
				top: 40 + j * 20,
				style: {
					fill: "#393a3b",
					fontWeight: "bold",
					text: "【Cluster" + j + "】" + cpu_affected_list_name + "：" + cpu_min_freq + "~" + cpu_max_freq + " GHz",
					font: "14px Microsoft YaHei"
				}
			};
			newGraphic.children.push(cpu_affected_list_info);
		}
		chartOption.yAxis.axisLabel = {
			formatter: "{value}GHz",
			margin: 25
		};
		chartOption.graphic.push(newGraphic);
	}

	// cpu频率图表
	const avg_cpu_freq_data: any = {};
	for (let i = 0; i < data.length; i++) {
		const item = data[i];
		const date_index = date_list.indexOf(item.date);
		for (let j = 0; j < device_infos[item.device_id].cpu_info.cpu_affected_lists.length; j++) {
			const avg_cpu_freq = average(item.cpu_data.cpu_freq.map(cpu_freq => cpu_freq[j]));
			let legendName;
			if (filterResult.value["device_id"] && filterResult.value["device_id"].length === 1) {
				legendName = item.project_name + " " + item.case_name + " Cluster" + j + " ";
			} else {
				legendName = item.project_name + " " + item.case_name + " Cluster" + j + " " + device_infos[item.device_id].name;
			}

			if (!avg_cpu_freq_data[legendName]) {
				avg_cpu_freq_data[legendName] = [];
				for (let k = 0; k < date_list.length; k++) {
					avg_cpu_freq_data[legendName].push(0);
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
			data: avg_cpu_freq_data[legendName]
		});
	}

	myChart.setOption(chartOption);
};

const deal_cpu_use = data => {
	chartOption.yAxis.axisLabel = {
		formatter: "{value}%",
		margin: 15
	};
	const avg_cpu_data: any = {};
	for (let i = 0; i < data.length; i++) {
		const item = data[i];
		const avg_cpu = average(item.cpu_data.cpu_utilization);
		let legendName;
		if (filterResult.value["device_id"] && filterResult.value["device_id"].length === 1) {
			legendName = item.project_name + " " + item.case_name;
		} else {
			legendName = item.project_name + " " + item.case_name + " " + device_infos[item.device_id].name;
		}

		if (!avg_cpu_data[legendName]) {
			avg_cpu_data[legendName] = [];
			for (let j = 0; j < date_list.length; j++) {
				avg_cpu_data[legendName].push(0); //[0,0,0,0]
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
			data: avg_cpu_data[legendName]
		});
	}
};

const deal_gpu_use = data => {
	chartOption.yAxis.axisLabel = {
		formatter: "{value}%",
		margin: 15
	};
	const avg_gpu_data: any = {};
	for (let i = 0; i < data.length; i++) {
		const item = data[i];
		const avg_gpu = average(item.gpu_data.gpu_use_percent);
		let legendName;
		if (filterResult.value["device_id"] && filterResult.value["device_id"].length === 1) {
			legendName = item.project_name + " " + item.case_name;
		} else {
			legendName = item.project_name + " " + item.case_name + " " + device_infos[item.device_id].name;
		}

		if (!avg_gpu_data[legendName]) {
			avg_gpu_data[legendName] = [];
			for (let j = 0; j < date_list.length; j++) {
				avg_gpu_data[legendName].push(0); //[0,0,0,0]
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
			data: avg_gpu_data[legendName]
		});
	}
};
</script>
