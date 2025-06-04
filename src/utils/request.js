import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建主请求实例（有拦截器）
const request = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  timeout: 5000
})

// 刷新 token 专用实例（避免死循环疯狂请求）
const refreshRequest = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  timeout: 5000
})

// 请求拦截器：自动加上 token
request.interceptors.request.use(config => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
}, error => Promise.reject(error))

// 响应拦截器
request.interceptors.response.use(
  response => response.data,
  async error => {
    const userStore = useUserStore()
    const originalRequest = error.config

    if (!error.response) {
      return Promise.reject(error)
    }

    const status = error.response.status
    const isLogin = originalRequest.url.includes('auth/login')
    const isRefresh = originalRequest.url.includes('auth/token/refresh')

    // 登录失败
    if (isLogin) return Promise.reject(error)

    // 避免死循环
    if (isRefresh || originalRequest._retry) {
      userStore.logout()
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
      return Promise.reject(error)
    }

    // access 过期，尝试刷新
    if (status === 401 && userStore.refresh) {
      originalRequest._retry = true
      try {
        const res = await refreshRequest.post('auth/token/refresh/', {
          refresh: userStore.refresh
        })
        
        const newAccessToken = res.data?.data?.access
        
        if (!newAccessToken) throw new Error('刷新失败：无 access token')
        
        userStore.setUser(
          newAccessToken,
          userStore.role,
          userStore.userInfo,
          userStore.refresh
        )

        // 更新原请求并重发
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return request(originalRequest)
      } catch (refreshError) {
        userStore.logout()
        router.push('/login')
        ElMessage.error('登录信息已失效，请重新登录')
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default request
