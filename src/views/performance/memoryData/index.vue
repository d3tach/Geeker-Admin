<template>
	<div class="card content-box">
		<span class="text"> memory 🍓🍇🍈🍉</span>
		<el-button type="primary" size="default" @click="getMemory()">获取内存数据</el-button>
	</div>
</template>

<script setup lang="ts" name="memory">
import { getMemoryApi } from "@/api/modules/performance";
const getMemory = async () => {
	const data = await getMemoryApi();
	console.log(data);
};
</script>
