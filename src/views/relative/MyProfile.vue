<template>
    <el-card>
        <h2 style="margin-bottom: 20px;">我的信息</h2>
        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="form.username" />
            </el-form-item>
            <el-form-item label="姓名" prop="full_name">
                <el-input v-model="form.full_name" />
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
                <el-input v-model="form.phone" />
            </el-form-item>
            <el-form-item label="联系地址" prop="address">
                <el-input v-model="form.address" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">保存修改</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from '@/utils/request'

const form = ref({
    username: '',
    full_name: '',
    phone: '',
    address: '',
    email: ''
})

const formRef = ref()

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    full_name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
    address: [{ required: true, message: '请输入联系地址', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入有效邮箱', trigger: 'blur' }]
}

const fetchUserInfo = async () => {
    try {
        const res = await axios.get('/relative/me/')
        console.log('完整响应:', res)
        const data = res.data
        form.value = {
            username: data.username,
            full_name: data.full_name,
            phone: data.phone,
            address: data.address,
            email: data.email
        }
    } catch (err) {
        ElMessage.error('获取信息失败')
    }
}

const onSubmit = () => {
    formRef.value.validate(async (valid) => {
        if (!valid) return
        try {
            await axios.put('/relative/me/update/', form.value)
            ElMessage.success('信息已更新')
        } catch (err) {
            console.error('更新失败:', err.response?.data || err)

            const errorData = err.response?.data
            if (errorData && errorData.data) {
                // 遍历 data 对象中的每个字段错误
                Object.entries(errorData.data).forEach(([field, messages]) => {
                    ElMessage.error(`${messages.join(', ')}`)
                })
            } else {
                ElMessage.error('更新失败: ' + (errorData?.message || '请检查输入'))
            }
        }
    })
}

onMounted(() => {
    fetchUserInfo()
})
</script>