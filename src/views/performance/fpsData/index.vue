<template>
	<div class="card content-box">
		<span class="text">fps（待完善） 🍓🍇🍈🍉</span>

		<PerformanceFilter ref="performanceFilterRef"></PerformanceFilter>

		<span class="result">params: {{ filterPerformanceResult }}</span>
		<el-button type="primary" size="default" @click="get_data">请求数据</el-button>
	</div>
</template>

<script setup lang="ts" name="selectFilter">
import { ref } from "vue";
import { FPSApi } from "@/api/modules/performance";
import PerformanceFilter from "@/components/PerformanceFilter/index.vue";

const performanceFilterRef = ref(null);

const filterPerformanceResult = ref({});

const get_data = async (): Promise<void> => {
	filterPerformanceResult.value = performanceFilterRef.value.filterResult;
	console.log(filterPerformanceResult.value);
	const param = { types: ["fps"], ...filterPerformanceResult.value };
	const FPSData = await FPSApi(param);
	console.log(FPSData);
};
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
