import { createRouter, createWebHistory } from 'vue-router'


import Login from '@/views/Login.vue'
import AdminHome from '@/views/staff/AdminHome.vue'
import UserHome from '@/views/relative/UserHome.vue'
import Register from '@/views/Register.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false } // 登录页不需要登录
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    component: () => import('@/views/ForgotPassword.vue')
  },
  // {
  //   path: '/admin',
  //   name: 'AdminHome',
  //   component: AdminHome,
  //   meta: { requiresAuth: true, role:'staff' }
  // },
  // {
  //   path: '/user',
  //   name: 'UserHome',
  //   component: UserHome,
  //   meta: { requiresAuth: true, role:'relative' }
  // },
  {
    path: '/user',
    component: () => import('@/views/relative/UserHome.vue'),
    children: [
      { path: '', redirect: '/user/health' },
      { path: 'profile', component: () => import('@/views/relative/MyProfile.vue') },
      { path: 'elders', component: () => import('@/views/relative/MyElders.vue') },
      { path: 'elders/:id', component: () => import('@/views/relative/EditElder.vue') },
      { path: 'health', component: () => import('@/views/relative/HealthView.vue') },
      { path: '/user/add-elder',component: () => import('@/views/relative/AddElder.vue')}
    ],
    meta: { requiresAuth: true, role:'relative' }
  },
  {
    path: '/admin',
    component: () => import('@/views/staff/AdminHome.vue'),
    children: [
      { path: '', redirect: '/admin/users' },
      { path: 'users', component: () => import('@/views/staff/UserList.vue') },
      { path: 'elders', component: () => import('@/views/staff/ElderList.vue') },
      { path: 'health/upload', component: () => import('@/views/staff/HealthUpload.vue') },
      { path: 'health/records', component: () => import('@/views/staff/HealthRecords.vue') },
    ],
    meta: { requiresAuth: true, role:'staff' }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
