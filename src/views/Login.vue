<template>
    <div class="login-container">
        <el-card class="login-card">
            <h2 class="title">
                <img src="/logo.png" style="height: 40px; vertical-align: middle; margin-right: 10px;">
                蓝天养老院管理系统
            </h2>

            <el-form :model="form" :rules="rules" ref="loginForm" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" placeholder="请输入用户名" />
                </el-form-item>

                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="submitLogin" style="width: 100%">登录</el-button>
                </el-form-item>
                <div style="display: flex;justify-content: space-between; align-items: center;">
                    <el-link type="primary" @click="toRegister">没有账号？去注册</el-link>
                    <el-link type="primary" @click="toForgotPassword">忘记密码？去重置</el-link>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
    username: '',
    password: ''
})

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const loginForm = ref(null)
const submitLogin = () => {
    loginForm.value.validate(async (valid) => {
        if (valid) {
            try {
                const res = await request.post('auth/login/', {
                    username: form.value.username,
                    password: form.value.password
                })

                // 登录成功
                const data = res.data
                const userInfo = data.user_info
                const userRole = userInfo.user_type
                userStore.setUser(data.access, userRole, userInfo, data.refresh)

                ElMessage.success('登录成功')
                router.push(userRole === 'staff' ? '/admin' : '/user')
            } catch (err) {
                if (err.response) {
                    // 有响应但登录失败，可能是账号密码错误
                    ElMessage.error('登录失败，请检查用户名或密码')
                } else if (err.request) {
                    // 有请求但无响应，可能是后端未开启
                    ElMessage.error('无法连接到服务器，请检查服务器状态')
                } else {
                    // 其他错误
                    ElMessage.error('登录失败，请稍后再试')
                }
            }
        }
    })
}

const toRegister = () => {
    router.push('/register')
}
const toForgotPassword = () => {
    router.push('/forgot-password');
};

</script>
<style scoped>
.login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: url('/background.png');
    background-size: cover;
}

.login-card {
    margin-right: 50%;
    width: 400px;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
    text-align: center;
    margin-bottom: 20px;
    color: #00a0ea;
}
</style>