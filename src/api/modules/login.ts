import { Login } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import DynamicRouter from "@/assets/json/dynamicRouter.json";
import UserRouter from "@/assets/json/UserRouter.json";
import AuthButtons from "@/assets/json/authButtons.json";
import qs from "qs";
import http from "@/api";

/**
 * @name 登录模块
 */
// * 用户登录
export const loginApi = (params: Login.ReqLoginForm) => {
	// return {
	// 	code: 200,
	// 	data: {
	// 		access_token: "bqddxxwqmfncffacvbpkuxvwvqrhln"
	// 	},
	// 	msg: "成功"
	// };
	return http.post<Login.ResLogin>(`/login`, params, { headers: { noLoading: true } }); // 正常 post json 请求  ==>  application/json
	return http.post<Login.ResLogin>(PORT1 + `/login`, params, { headers: { noLoading: true } }); // 正常 post json 请求  ==>  application/json
	return http.post<Login.ResLogin>(PORT1 + `/login`, params, { headers: { noLoading: true } }); // 控制当前请求不显示 loading
	return http.post<Login.ResLogin>(PORT1 + `/login`, {}, { params }); // post 请求携带 query 参数  ==>  ?username=admin&password=123456
	return http.post<Login.ResLogin>(PORT1 + `/login`, qs.stringify(params)); // post 请求携带表单参数  ==>  application/x-www-form-urlencoded
	return http.get<Login.ResLogin>(PORT1 + `/login?${qs.stringify(params, { arrayFormat: "repeat" })}`); // 如果是 get 请求可以携带数组等复杂参数
};

// * 获取按钮权限
export const getAuthButtonListApi = () => {
	// return http.get<Login.ResAuthButtons>(PORT1 + `/auth/buttons`, {}, { headers: { noLoading: true } });
	// 如果想让按钮权限变为本地数据，注释上一行代码，并引入本地 authButtons.json 数据
	return AuthButtons;
};

// * 获取菜单列表
export const getAuthMenuListApi = (params: any) => {
	// 就用前端本地路由吧,懒得修改后端路由了...
	if (params["role"] === "User") {
		return UserRouter;
	} else if (params["role"] === "Admin") {
		return DynamicRouter;
	}

	//动态路由,不过接口懒得维护了
	return http.get<Menu.MenuOptions[]>(`/route_list`, params, { headers: { noLoading: true } });
};

// * 用户退出登录
// export const logoutApi = () => {
// 	return http.post(PORT1 + `/logout`);
// };
