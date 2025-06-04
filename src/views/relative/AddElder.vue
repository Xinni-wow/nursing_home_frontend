<template>
    <div class="add-elder">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" enctype="multipart/form-data">
            <el-form-item label="照片">
                <input type="file" @change="handleFileChange" />
            </el-form-item>
            <el-form-item label="姓名" prop="full_name">
                <el-input v-model="form.full_name" />
            </el-form-item>
            <el-form-item label="亲属关系" prop="relationship">
                <el-select v-model="form.relationship">
                    <el-option v-for="item in relationships" :key="item" :label="item" :value="item" />
                </el-select>
            </el-form-item>
            <el-form-item label="性别" prop="gender">
                <el-select v-model="form.gender">
                    <el-option label="男" value="男" />
                    <el-option label="女" value="女" />
                </el-select>
            </el-form-item>
            <el-form-item label="出生日期" prop="birth_date">
                <el-date-picker v-model="form.birth_date" type="date" value-format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item label="身份证号" prop="id_number">
                <el-input v-model="form.id_number" />
            </el-form-item>
            <el-form-item label="健康状况" prop="health_status">
                <el-input type="textarea" v-model="form.health_status" />
            </el-form-item>
            <el-form-item label="备注">
                <el-input type="textarea" v-model="form.notes" />
            </el-form-item>
            <el-form-item label="住址">
                <el-input v-model="form.address" />
            </el-form-item>
            <el-form-item label="电话" prop="phone">
                <el-input v-model="form.phone" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm">提交</el-button>
                <el-button @click="$router.back()">返回</el-button>
            </el-form-item>

        </el-form>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from '@/utils/request'
import { ElMessage } from 'element-plus'

const form = ref({
    photo: null,
    full_name: '',
    gender: '',
    birth_date: '',
    id_number: '',
    health_status: '',
    notes: '',
    address: '',
    phone: '',
    relationship: '',
})

const relationships = ['父女', '母女', '父子', '母子', '配偶', '本人', '其他']

const rules = {
    full_name: [
        { required: true, message: '请输入姓名', trigger: 'blur' }
    ],
    gender: [
        { required: true, message: '请选择性别', trigger: 'change' }
    ],
    birth_date: [
        { required: true, message: '请选择出生日期', trigger: 'change' }
    ],
    id_number: [
        { required: true, message: '请输入身份证号', trigger: 'blur' },
        { pattern: /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, message: '身份证号格式错误' }
    ],
    health_status: [
        { required: true, message: '请输入健康状况', trigger: 'blur' }
    ],
    relationship: [
        { required: true, message: '请选择亲属关系', trigger: 'change' }
    ],
    phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的中国大陆手机号' }
    ],
}
const handleFileChange = (e) => {
    form.value.photo = e.target.files[0]
}
const submitForm = async () => {
    const formData = new FormData()
    for (const key in form.value) {
        if (form.value[key]) formData.append(key, form.value[key])
    }

    try {
        await axios.post('/relative/elders/add/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        ElMessage.success('添加成功！')
    } catch (err) {
        if (err.response && err.response.data && err.response.data.data) {
            const backendErrors = err.response.data.data

            // 显示第一个错误字段的消息作为提示
            const fieldNames = Object.keys(backendErrors)
            if (fieldNames.length > 0) {
                const firstField = fieldNames[0]
                const message = backendErrors[firstField][0]
                ElMessage.error(message)

                // 设置到表单项上（需要 formRef）
                if (formRef.value) {
                    formRef.value.fields.forEach(field => {
                        if (field.prop === firstField) {
                            field.validate('change', backendErrors[firstField][0])
                        }
                    })
                }
            }
        } else {
            ElMessage.error('添加失败，请稍后再试！')
        }
    }
}
</script>