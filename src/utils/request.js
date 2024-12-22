import axios from 'axios'
import store from '@/store'
import { getAccessToken, getRefreshToken, setToken } from '@/utils/auth'
import qs from 'qs';

// Axios 无感知刷新令牌，参考 https://www.dashingdog.cn/article/11 与 https://segmentfault.com/a/1190000020210980 实现
// 是否显示重新登录
// TODO
let isRelogin = { show: false };
// 请求队列
let requestList = []
// 是否正在刷新中
let isRefreshToken = false;

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: '/api/', // 此处的 /admin-api/ 地址，原因是后端的基础路径为 /admin-api/
  // 超时
  timeout: 30000,
  // 禁用 Cookie 等信息
  withCredentials: false,
});
// request拦截器
service.interceptors.request.use(config => {
  // 是否需要设置 token
  if (getAccessToken()) {
    config.headers['Authorization'] = 'Bearer ' + getAccessToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  config.paramsSerializer = {
    serialize: (params) => qs.stringify(params, { indices: false })
  };
  return config;
}, error => {
  console.log(error)
  throw error;
})

// 需要忽略的提示。忽略后，自动 Promise.reject('error')
const ignoreMsgs = [
  "无效的刷新令牌", // 刷新令牌被删除时，不用提示
  "刷新令牌已过期" // 使用刷新令牌，刷新获取新的访问令牌时，结果因为过期失败，此时需要忽略。否则，会导致继续 401，无法跳转到登出界面
];

// TODO refactor
const errorHandler = async (code, msg, error) => {
  console.log('errorHandler: ' + code + ', ' + error + ', ' + msg);
  if (ignoreMsgs.indexOf(msg) !== -1) { // 如果是忽略的错误码，直接返回 msg 异常
    return Promise.reject(msg)
  } else if (code === 401) {

    // return Promise.reject(error); //TODO
    // 如果未认证，并且未进行刷新令牌，说明可能是访问令牌过期了
    if ((!error || !(error.config.noAutoLogin)) && !isRefreshToken) {
      isRefreshToken = true;
      // 1. 如果获取不到刷新令牌，则只能执行登出操作
      if (!getRefreshToken()) {
        return handleAuthorized();
      }
      // 2. 进行刷新访问令牌
      try {
        const refreshTokenRes = await refreshToken()
        // 2.1 刷新成功，则回放队列的请求 + 当前请求
        setToken(refreshTokenRes.data)
        requestList.forEach(cb => cb())
        return service(res.config)
      } catch (e) {// 为什么需要 catch 异常呢？刷新失败时，请求因为 Promise.reject 触发异常。
        // 2.2 刷新失败，只回放队列的请求
        requestList.forEach(cb => cb())
        // 提示是否要登出。即不回放当前请求！不然会形成递归
        return handleAuthorized();
      } finally {
        requestList = []
        isRefreshToken = false
      }
    } else {
      // 添加到队列，等待刷新获取到新的令牌
      /*
      return new Promise(resolve => {
        requestList.push(() => {
          res.config.headers['Authorization'] = 'Bearer ' + getAccessToken() // 让每个请求携带自定义token 请根据实际情况自行修改
          resolve(service(res.config))
        })
      })
      */
      error._handled = true;
      return Promise.reject(error);
    }
  } else if (code === 500) {
    return Promise.reject(error);
  } else { //client side exception //if (code !== 200) {  // && code !== 'Ok'
    let message = msg;
    if (msg === '无效的刷新令牌') { // hard coding：忽略这个提示，直接登出
      console.log(msg)
      return;
    }
    if (msg === "Network Error") {
      message = "后端接口连接异常";
    } else if (msg?.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (msg?.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    return Promise.reject(error)
  }
};


// 响应拦截器
service.interceptors.response.use(async res => {
  // 未设置状态码则默认成功状态
  //const code = res.data.code || 200;
  // 获取错误信息
  //const msg = res.data.msg || errorCode[code] || errorCode['default']
  //if (res.status == 200)
  return res.data;
  //return errorHandler(res.status, res.statusText, res);
}, async error => {
  return errorHandler(error.response?.status, error.response?.data ? error.response.data.message : error.message, error);
})

export function getBaseHeader() {
  return {
    'Authorization': "Bearer " + getAccessToken(),
  }
}

import { MessageBox } from 'element-ui'
function handleAuthorized() {
  if (!isRelogin.show) {
    isRelogin.show = true;
    MessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning'
    }
    ).then(() => {
      store.dispatch('LogOut').finally(() => {
        console.log(window.location.href);
        window.vue.$router.push(`/login?from=${encodeURIComponent(window.location.href)}`);
        setTimeout(() => { isRelogin.show = false; }, 1000);
        //location.href = '/login?from=' + vue.$route.fullPath;
      })
    }).catch(() => {
      isRelogin.show = false;
    });
  }
  const error = new Error('无效的会话，或者会话已过期，请重新登录。')
  error._handled = true;
  return Promise.reject(error);
}

export default service;
