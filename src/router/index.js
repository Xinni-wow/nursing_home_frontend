import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import { createRouter, createWebHistory } from 'vue-router'
import CheckIn from '../views/relative/CheckIn.vue'

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
  {
    path: '/payment-success',
    name: 'PaymentSuccess',
    component: () => import('@/views/Pay/PaySuccess.vue'),
    meta: { requiresAuth: false }
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
      { path: '/user/add-elder',component: () => import('@/views/relative/AddElder.vue')},
      { path: 'outinglist',name:'OutingList', component: () => import('@/views/relative/OutingList.vue') },
      { path: 'outingform', component: () => import('@/views/relative/OutingForm.vue') },
      { path: 'outing/:id',name: 'OutingEdit', component: () => import('@/views/relative/OutingEdit.vue') },
      { path: 'outing/:id/cancel-confirm',name: 'OutingDelete',component: () => import('@/views/relative/OutingDelete.vue')},
      { path: 'appointmentlist',name:'AppointmentList', component: () => import('@/views/relative/ApponintmentList.vue')},
      { path: 'appointmentform', component: () => import('@/views/relative/AppointmentForm.vue') },
      { path: 'appointment/:id',name: 'VisitEdit', component: () => import('@/views/relative/AppointmentEdit.vue') },
      { path:'appointment/qscode',component:()=>import('@/views/relative/AppointmentCode.vue')},
      { path:'diet/list',component:()=>import('@/views/relative/MenuDisplay.vue')},
      { path: 'checkin', name: 'CheckIn', component: () => import('@/views/relative/CheckIn.vue') },
      { path: 'checkins', name: 'CheckInList', component: () => import('@/views/relative/CheckInList.vue') },
      { path: '/user/renew',name: 'UserRenew',component: () => import('@/views/relative/Renew.vue')},
      { path: '/user/bills',name: 'UserBillList',component: () => import('@/views/relative/BillList.vue')}
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
      { path: 'outing/review',component:() =>import('@/views/staff/OutingReview.vue')},
      { path: 'appointment/review', component: () => import('@/views/staff/AppointmentReview.vue') },
      { path:' diet/manage',component:()=>import('@/views/staff/MenuManagement.vue')},
      { path: '/admin/bills',name: 'AdminBillList',component: () => import('@/views/staff/BillList.vue')},
      { path: '/admin/checkins',name: 'StaffCheckinList',component: () => import('@/views/staff/CheckInList.vue'),meta: { requiresAuth: true, role: 'staff' }},
    ],
    meta: { requiresAuth: true, role:'staff' }
  },

  {
    path: '/checkin', component: CheckIn
  },
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
