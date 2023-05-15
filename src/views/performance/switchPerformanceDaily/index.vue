<template>
	<div class="card content-box">
		<!-- <span class="text">性能开关数据</span> -->
		<switchPerfDailyFilter></switchPerfDailyFilter>
		<div ref="echartsRef" style="width: 100%; height: 900%"></div>
	</div>
</template>

<script setup lang="ts" name="memory">
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
	myChart.setOption(chartOption);
});
</script>
