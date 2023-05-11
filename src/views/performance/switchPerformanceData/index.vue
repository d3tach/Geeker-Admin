<template>
	<div class="card content-box">
		<!-- <span class="text">性能开关数据</span> -->
		<PerformanceFilter @update-filter-result="handleFilterChanged" @update-data-result="handleDataChanged"></PerformanceFilter>

		<div ref="echartsRef" style="width: 100%; height: 900%"></div>
	</div>
</template>

<script setup lang="ts" name="switchPerformanceData">
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import { useEcharts } from "@/hooks/useEcharts";

import PerformanceFilter from "@/components/PerformanceFilter/index.vue";
import cloneDeep from "lodash/cloneDeep"; // 引入lodash库中的cloneDeep方法

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
			end: 100
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
		name: "时间",
		nameLocation: "end",
		axisLabel: {
			formatter: "{value}s"
		},
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
});

// 数据更新
const filterResult = ref();
const dataResult = ref();
const handleFilterChanged = filter => {
	filterResult.value = filter.value;
	console.log("接受到filter", filterResult.value);
};
const handleDataChanged = data => {
	dataResult.value = data.value;
	draw_chart(dataResult.value);
	console.log("接受到data", data.value);
};

const draw_chart = data => {
	myChart.clear(); //先清理图表
	chartOption.xAxis.data = data[0].time_data;
	chartOption.yAxis.axisLabel = {};
	chartOption.legend.data = [];
	chartOption.graphic = [];
	chartOption.series = [];
	let data_type = filterResult.value.types[0];
	chartOption.title.text = data_type;
	console.log(data_type);
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
	for (let i = 0; i < data.length; i++) {
		const item = data[i];
		const legendName = item.project_name + " " + item.case_name;

		// 添加图例
		chartOption.legend.data.push(legendName);

		// 添加线条数据
		chartOption.series.push({
			name: legendName,
			type: "line",
			label: {
				show: true,
				position: "top"
			},
			data: item.fps_data
		});
	}
};

const deal_memory_data = data => {
	chartOption.yAxis.axisLabel = {
		formatter: "{value}MB",
		margin: 20
	};
	const memory_param = Object.keys(data[0].memory_data[0]);

	for (let i = 0; i < data.length; i++) {
		const item = data[i];
		// const codeList = item.memory_data.map(memory => memory.Code.Pss);
		// console.log(codeList);
		for (let j = 0; j < memory_param.length; j++) {
			const memoryParam = memory_param[j];

			const pssData = item.memory_data.map(memory => memory[memoryParam].Pss);
			const legendName = item.project_name + " " + item.case_name + " " + memory_param[j];
			// 添加图例
			chartOption.legend.data.push(legendName);
			// 添加线条数据
			chartOption.series.push({
				name: legendName,
				type: "line",
				// stack: "Total",
				label: {
					show: true,
					position: "top"
				},
				areaStyle: {},
				emphasis: {
					focus: "series"
				},
				data: pssData
			});
		}
	}
};

const deal_cpu_use = data => {
	chartOption.yAxis.axisLabel = {
		formatter: "{value}%",
		margin: 20
	};
	for (let i = 0; i < data.length; i++) {
		const item = data[i];
		const legendName = item.project_name + " " + item.case_name;
		// 添加图例
		chartOption.legend.data.push(legendName);
		// 添加线条数据
		chartOption.series.push({
			name: legendName,
			type: "line",
			label: {
				show: true,
				position: "top"
			},
			data: item.cpu_data.cpu_utilization
		});
	}
};

const deal_cpu_freq = data => {
	console.log(data);
	chartOption.graphic = [
		{
			type: "rect", // 矩形类型
			z: -1, // 矩形层级设置为最底层，避免覆盖其他元素
			left: 0, // 矩形左侧距离为 0
			top: 0, // 矩形顶部距离为 0
			shape: {
				width: "100%", // 矩形宽度为 100%
				height: "100%" // 矩形高度为 100%
			},
			style: {
				fill: "#000" // 矩形填充颜色为灰色
			}
		},
		{
			type: "text", // 文本类型
			right: 200, // 距离右侧距离
			top: 10, // 距离顶部距离
			style: {
				text: "还没想好怎么写,\n不同核的显示可能得先获取设备cpu集群信息", // 文本内容
				fill: "red", // 文本颜色
				fontSize: 14, // 字体大小
				fontWeight: "bold", // 字体粗细
				cursor: "move" // 鼠标样式设置为拖拽手势
			},
			draggable: true // 允许拖拽
		}
	];
};
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
