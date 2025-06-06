<template>
    <div class="p-6">
        <el-card>
            <template #header>
                <div class="text-lg font-bold">上传老人健康信息</div>
            </template>

            <el-form :model="form" ref="formRef" label-width="140px" :rules="rules">
                <el-form-item label="选择老人" prop="elder">
                    <el-select v-model="form.elder" placeholder="请选择老人">
                        <el-option v-for="elder in elders" :key="elder.id"
                            :label="`${elder.full_name}（id：${elder.id}）（身份证号：${elder.id_number}）`" :value="elder.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="记录日期" prop="date">
                    <el-date-picker v-model="form.date" type="date" placeholder="选择日期" format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD" />
                </el-form-item>

                <el-form-item label="体温 (°C)">
                    <el-input-number v-model="form.temperature" :step="0.1" :min="33" :max="42" />
                </el-form-item>

                <el-form-item label="血压 (收缩压)">
                    <el-input-number v-model="form.blood_pressure_systolic" :min="70" :max="250" />
                </el-form-item>

                <el-form-item label="血压 (舒张压)">
                    <el-input-number v-model="form.blood_pressure_diastolic" :min="50" :max="120" />
                </el-form-item>

                <el-form-item label="心率 (bpm)">
                    <el-input-number v-model="form.heart_rate" :min="40" :max="160" />
                </el-form-item>

                <el-form-item label="血糖 (mmol/L)">
                    <el-input-number v-model="form.blood_sugar" :step="0.1" :min="2.2" :max="25" />
                </el-form-item>

                <el-form-item label="呼吸频率 (/分)">
                    <el-input-number v-model="form.respiratory_rate" :min="8" :max="30" />
                </el-form-item>

                <el-form-item label="血氧饱和度 (%)">
                    <el-input-number v-model="form.oxygen_saturation" :min="85" :max="100" />
                </el-form-item>

                <el-form-item label="体重 (kg)">
                    <el-input-number v-model="form.weight" :step="0.1" :min="20" :max="150" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="submitForm">提交</el-button>
                    <el-button @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/request'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const formRef = ref()

// 初始化日期为今天
const today = dayjs().format('YYYY-MM-DD')

const form = ref({
    elder: '',
    date: today,
    temperature: null,
    blood_pressure_systolic: null,
    blood_pressure_diastolic: null,
    heart_rate: null,
    blood_sugar: null,
    respiratory_rate: null,
    oxygen_saturation: null,
    weight: null,
})

const rules = {
    elder: [{ required: true, message: '请选择老人', trigger: 'change' }],
    date: [{ required: true, message: '请选择日期', trigger: 'change' }],
}

const elders = ref([])

onMounted(async () => {
    try {
        const res = await axios.get('/staff/elders/')
        elders.value = res.data
    } catch (error) {
        ElMessage.error('获取老人列表失败')
    }
})

const submitForm = () => {
    formRef.value.validate(async (valid) => {
        if (!valid) return

        const formData = { ...form.value }
        try {
            const res = await axios.post('/health/records/', formData)
            ElMessage.success('上传成功')
            resetForm()
        } catch (error) {
            if (error.response && error.response.status === 400) {
                ElMessage.error(error.response.data.detail || '上传失败：该老人在该日期已上传记录')
            } else {
                ElMessage.error('上传失败')
            }
        }
    })
}

const resetForm = () => {
    form.value = {
        elder: '',
        date: today,
        temperature: null,
        blood_pressure_systolic: null,
        blood_pressure_diastolic: null,
        heart_rate: null,
        blood_sugar: null,
        respiratory_rate: null,
        oxygen_saturation: null,
        weight: null,
    }
}
</script>

<style scoped>
.text-lg {
    font-size: 18px;
}
</style>
