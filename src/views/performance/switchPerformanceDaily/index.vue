<template>
	<div class="card content-box">
		<div ref="echartsRef" style="width: 100%; height: 90%"></div>
		<el-button type="primary" size="default" @click="updateOption()">测试按钮</el-button>
	</div>
</template>

<script setup lang="ts" name="memory">
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import { useEcharts } from "@/hooks/useEcharts";
const echartsRef = ref<HTMLElement>();

let option: echarts.EChartsOption = {
	xAxis: {
		type: "category",
		data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
	},
	yAxis: {
		type: "value"
	},
	series: [
		{
			data: [150, 230, 224, 218, 135, 147, 260],
			type: "line"
		}
	]
};

let myChart: echarts.ECharts; // 将 myChart 设置为组件实例的属性
onMounted(() => {
	myChart = echarts.init(echartsRef.value as HTMLElement);

	useEcharts(myChart, option);
});

const updateOption = () => {
	console.log("test");
	let newOption = {
		xAxis: {
			type: "category",
			data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
		},
		yAxis: {
			type: "value"
		},
		series: [
			{
				data: [100, 200, 224, 150, 111, 222, 333],
				type: "line"
			}
		]
	};
	console.log(newOption);
	myChart.setOption(newOption);
};
</script>
