<template>
    <div class="register-container">
        <el-card class="register-card">
            <h2 class="title">用户注册</h2>

            <el-form :model="form" :rules="rules" ref="registerForm" label-width="80px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" />
                </el-form-item>

                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" type="password" />
                </el-form-item>

                <el-form-item label="确认密码" prop="password2">
                    <el-input v-model="form.password2" type="password" />
                </el-form-item>

                <el-form-item label="姓名" prop="full_name">
                    <el-input v-model="form.full_name" />
                </el-form-item>

                <el-form-item label="电话" prop="phone">
                    <el-input v-model="form.phone" />
                </el-form-item>
                <p style="color: red;">*密保请必填并记住答案，用于找回/重置密码</p>
                <el-form-item label="密保问题" prop="security_question">
                    <el-input v-model="form.security_question" />
                </el-form-item>

                <el-form-item label="密保答案" prop="security_answer">
                    <el-input v-model="form.security_answer" />
                </el-form-item>
                <el-form-item label="地址" prop="address">
                    <el-input v-model="form.address" />
                </el-form-item>

                <el-form-item label="邮箱">
                    <el-input v-model="form.email" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="submitRegister" style="width: 100%">注册</el-button>
                </el-form-item>

                <el-form-item>
                    <el-link type="info" @click="toLogin">已有账号？去登录</el-link>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()

const form = ref({
    username: '',
    password: '',
    password2: '',
    full_name: '',
    phone: '',
    address: '',
    email: '',
    security_question: '',
    security_answer: ''
})

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    password2: [{ required: true, message: '请确认密码', trigger: 'blur' }],
    full_name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
    address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
    email: [{ type: 'email', message: '邮箱格式错误', trigger: 'blur' },],
    security_question: [{ required: true, message: '请输入密保问题', trigger: 'blur' }],
    security_answer: [{ required: true, message: '请输入密保答案', trigger: 'blur' }]
}

const registerForm = ref(null)

const submitRegister = () => {
    registerForm.value.validate(async (valid) => {
        if (valid) {
            try {
                await request.post('/auth/register/', form.value)
                ElMessage.success('注册成功，请登录')
                router.push('/login')
            } catch (err) {
                const errors = err?.response?.data?.data
                if (errors) {
                    for (const field in errors) {
                        ElMessage.error(`${field}：${errors[field].join('；')}`)
                    }
                } else {
                    ElMessage.error('注册失败，请检查您的输入或稍后再试')
                }
            }
        }
    })
}

const toLogin = () => {
    router.push('/login')
}
</script>

<style scoped>
.register-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: url('/background.png');
    background-size: cover;
}

.el-form-item {
    margin-bottom: 12px;
}

.register-card {
    width: 450px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
    text-align: center;
    margin-bottom: 20px;
}
</style>