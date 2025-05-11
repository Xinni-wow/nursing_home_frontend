import './assets/main.css'
import { createApp, onMounted } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { createPersistedState } from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(createPersistedState())

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 页面守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 如果访问的是登录页，并且已经登录了，则跳转到首页
  if (to.path === '/login' && userStore.token) {
      ElMessage.info('您已登录')
      return next(userStore.role === 'staff' ? '/admin' : '/user')
  }

  // 如果访问的是需要登录的页面
  if (to.meta.requiresAuth) {
      if (userStore.token) {
          // 已登录
          if (to.meta.role && to.meta.role !== userStore.role) {
              ElMessage.error('无权限访问该页面')
              return next('/403') // 👈 跳转到 /403 页面
          }
          next()
      } else {
          // 未登录
          ElMessage.warning('请先登录')
          next('/login')
      }
  } else {
      // 非受保护页面，直接放行
      next()
  }
})

app.mount('#app');