<template>
	<div class="card content-box">
		<span class="text">fps（待完善） 🍓🍇🍈🍉</span>

		<PerformanceFilter ref="performanceFilterRef"></PerformanceFilter>
		<div>
			<!-- <span class="result">params: {{ filterPerformanceResult }}</span> -->
			<el-button type="primary" size="default" @click="get_data">请求数据</el-button>
		</div>

		<div ref="echartsRef" style="width: 100%; height: 90%"></div>
	</div>
</template>

<script setup lang="ts" name="selectFilter">
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import { useEcharts } from "@/hooks/useEcharts";
import { FPSApi } from "@/api/modules/performance";
import PerformanceFilter from "@/components/PerformanceFilter/index.vue";
import cloneDeep from "lodash/cloneDeep"; // 引入lodash库中的cloneDeep方法

// 数据筛选
const performanceFilterRef = ref(null);
const filterPerformanceResult = ref({});

//数据显示
const echartsRef = ref<HTMLElement>();
let myChart: echarts.ECharts; // 将 myChart 设置为组件实例的属性
const defaultOption = {
	title: {
		text: "FPS"
	},
	tooltip: {
		trigger: "axis",
		showContent: true
	},
	legend: {
		data: []
	},
	grid: {
		left: "3%",
		right: "4%",
		bottom: "3%",
		containLabel: true
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
		nameLocation: "middle",
		boundaryGap: false,
		data: []
	},
	yAxis: {
		type: "value",
		scale: true
	},
	series: []
};
let chartOption = cloneDeep(defaultOption); // 使用对象解构创建新的对象

onMounted(() => {
	myChart = echarts.init(echartsRef.value as HTMLElement);
	useEcharts(myChart, chartOption);
});

// 数据更新
const get_data = async (): Promise<void> => {
	filterPerformanceResult.value = performanceFilterRef.value.filterResult;
	const param = { types: ["fps"], ...filterPerformanceResult.value };
	try {
		const resultData = await FPSApi(param);
		deal_option_data(resultData);
	} catch (error) {
		myChart.clear();
		console.log("请求数据时出错", error);
	}
	// finally {
	// 	console.log(defaultOption);
	// }
};

const deal_option_data = datas => {
	myChart.clear(); //先清理图表
	chartOption.xAxis.data = datas[0].time_data;
	chartOption.legend.data = [];
	chartOption.series = [];

	for (let i = 0; i < datas.length; i++) {
		const item = datas[i];

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
	myChart.setOption(chartOption);
};
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
