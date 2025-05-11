<template>
    <div class="login-container">
        <el-card class="login-card">
            <h2 class="title">养老院管理系统</h2>

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
                <el-form-item>
                    <el-link type="info" @click="toRegister">没有账号？去注册</el-link>
                    <el-link type="primary" @click="toForgotPassword">忘记密码？</el-link>
                </el-form-item>
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
                ElMessage.error('登录失败，请检查用户名或密码')
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
    background: #f0f2f5;
}

.login-card {
    width: 400px;
    padding: 20px;
}

.title {
    text-align: center;
    margin-bottom: 20px;
}
</style>