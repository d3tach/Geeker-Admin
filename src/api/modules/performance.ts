import { Performance } from "@/api/interface/index";
import http from "@/api";

export const getMemoryApi = () => {
	// return http.get<Performance.ResMemory>("https://jsonplaceholder.typicode.com/todos/1");
	return http.get<Performance.ResMemory>("users");
};
