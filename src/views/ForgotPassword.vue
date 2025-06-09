<template>
    <div class="forgot-password-container">
        <el-card class="forgot-password-card">
            <h2 class="title">找回密码</h2>

            <el-form :model="form" :rules="rules" ref="forgotPasswordForm" label-width="100px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" />
                </el-form-item>


                <el-form-item v-if="securityQuestion" label="密保问题">
                    <el-input v-model="securityQuestion" disabled />
                </el-form-item>

                <el-form-item v-if="securityQuestion" label="密保答案" prop="security_answer">
                    <el-input v-model="form.security_answer" />
                </el-form-item>

                <el-form-item v-if="securityQuestion" label="新密码" prop="new_password">
                    <el-input v-model="form.new_password" type="password" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleRetrieve">重置密码</el-button>
                    <el-button @click="goBack">返回登录</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';
import router from '@/router';


const goBack = () => {
    const currentPath = router.currentRoute.value.path;
    if (currentPath !== '/login') {
        router.push('/login').catch(err => {
            console.warn('路由跳转失败:', err);
        });
    }
};

const form = ref({
    username: '',
    security_answer: '',
    new_password: ''
});

const securityQuestion = ref('');
const forgotPasswordForm = ref(null);

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    security_answer: [{ required: true, message: '请输入密保答案', trigger: 'blur' }],
    new_password: [{ required: true, message: '请输入新密码', trigger: 'blur' }]
};

const handleRetrieve = async () => {
    if (!securityQuestion.value) {
        // 获取密保问题
        try {
            const res = await request.post('/auth/retrieve_security_question/', { username: form.value.username });
            securityQuestion.value = res.data.security_question;
        } catch (err) {
            ElMessage.error(err.response.data.data.msg || '获取密保问题失败');
        }
    } else {
        // 重置密码
        forgotPasswordForm.value.validate(async (valid) => {
            if (valid) {
                try {
                    await request.post('/auth/reset_password/', {
                        username: form.value.username,
                        security_answer: form.value.security_answer,
                        new_password: form.value.new_password
                    });
                    ElMessage.success('密码重置成功，请登录');
                    router.push('/login');
                } catch (err) {
                    ElMessage.error(err.response.data.data.msg || '密码重置失败');
                }
            }
        });
    }
};
</script>

<style scoped>
.forgot-password-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: url('/background.png');
    background-size: cover;
}

.forgot-password-card {
    width: 450px;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
    text-align: center;
    margin-bottom: 20px;
}
</style>
