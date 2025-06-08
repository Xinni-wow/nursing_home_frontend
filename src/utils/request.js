import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  timeout: 5000,

})

// 请求拦截器：添加 token
request.interceptors.request.use(config => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// // 响应拦截器
// request.interceptors.response.use(
//   response => response.data,
//   error => {
//     return Promise.reject(error)
//   }
// )
// 响应拦截器：统一处理错误和刷新 token
request.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config

    // 如果是 401 错误，并且不是刷新 token 的请求
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true // 防止无限循环

      const userStore = useUserStore()

      if (!userStore.refresh) {
        // 没有 refresh token，直接跳转登录页
        userStore.logout()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // 调用刷新 token 接口
        const res = await request.post('auth/token/refresh/', {
          refresh: userStore.refresh
        })

        const newAccessToken = res.data.access

        // 更新 Pinia 中的 token
        userStore.setUser(
          newAccessToken,
          userStore.role,
          userStore.userInfo,
          userStore.refresh
        )

        // 更新原请求的 token 并重新发送
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return request(originalRequest)
      } catch (refreshError) {
        // 刷新失败，跳转登录页
        ElMessage.error('登录信息已过期，请重新登录')
        userStore.logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)
export default request
