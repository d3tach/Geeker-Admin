import { Performance } from "@/api/interface/index";
import http from "@/api";

export const EditorApi = () => {
	return http.get<Performance.ResEditor>(`/get_all_editors`);
};
export const ProjectNameApi = () => {
	const projectNames = http.get<Performance.ResCaseName>(`/get_all_project_names`);
	// console.log(caseNames);
	return projectNames;
};

export const CaseNameApi = () => {
	const caseNames = http.get<Performance.ResCaseName>(`/get_all_case_names`);
	// console.log(caseNames);
	return caseNames;
};
export const DeviceApi = () => {
	return http.get<Performance.ResDevice>(`/get_all_devices`);
};
export const FPSApi = params => {
	return http.post<Performance.ResData>(`/get_performance_data`, params);
};
export const PerformanceDataApi = params => {
	return http.post<Performance.ResData>(`/get_performance_data`, params);
};

export const getMemoryApi = () => {
	// return http.get<Performance.ResMemory>("https://jsonplaceholder.typicode.com/todos/1");
	return http.get<Performance.ResMemory>("users");
};
