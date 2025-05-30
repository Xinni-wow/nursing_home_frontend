// stores/user.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const refresh = ref('')
  const role = ref('')
  const userInfo = ref({})

  function setUser(accessToken, userRole, info, refreshToken = '') {
    token.value = accessToken
    role.value = userRole
    userInfo.value = info
    refresh.value = refreshToken
  }

  function logout(s) {
    token.value = ''
    refresh.value = ''
    role.value = ''
    userInfo.value = {}
  }

  return { token, refresh, role, userInfo, setUser, logout }
}, {
  // 启用持久化
  persist: true,
})


