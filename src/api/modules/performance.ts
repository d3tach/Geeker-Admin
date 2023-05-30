import { Performance } from "@/api/interface/index";
import http from "@/api";

export const EditorApi = () => {
  return http.get<Performance.ResEditor>(`/get_all_editors`);
};

export const EditorDailyApi = () => {
  return http.get<Performance.ResEditor>(`/get_all_daily_editors`);
};

export const ProjectNameApi = () => {
  const projectNames = http.get<Performance.ResProjectName>(`/get_all_project_names`);
  return projectNames;
};

export const CaseNameApi = () => {
  const caseNames = http.get<Performance.ResCaseName>(`/get_all_case_names`);
  return caseNames;
};
export const DeviceApi = () => {
  return http.get<Performance.ResDevice>(`/get_all_devices`);
};

export const DeviceInfo = (device_id: any) => {
  return http.get<Performance.ResDevice>(`/get_device_info`, { device_id: device_id });
};

export const PerformanceDataApi = (params: any) => {
  return http.post<Performance.ResData>(`/get_performance_data`, params);
};

export const CIProjectNameApi = () => {
  const projectNames = http.get<Performance.ResProjectName>(`/get_all_project_names`);
  return projectNames;
};

export const CICaseNameApi = () => {
  return http.get<Performance.ResCaseName>(`/get_all_ci_case`);
};

export const CIDeviceIpApi = () => {
  return http.get<Performance.ResData>(`/get_all_ci_device_ip`);
};

export const CIPerformanceDataApi = (params: any) => {
  return http.post<Performance.ResData>(`/get_ci_performance_type_data`, params);
};
