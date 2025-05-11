<template>
    <div style="padding: 20px;">
        <h2>健康信息管理</h2>

        <el-card style="margin-bottom: 40px;">
            <h3>按日期查看与编辑</h3>

            <el-form :inline="true" style="margin-bottom: 20px;">
                <el-form-item label="选择日期">
                    <el-date-picker v-model="selectedDate" type="date" placeholder="选择日期"
                        @change="fetchRecordsByDate" />
                </el-form-item>
            </el-form>

            <el-table v-if="recordsByDate.length > 0" :data="recordsByDate" stripe style="width: 100%;">
                <el-table-column label="老人ID">
                    <template #default="{ row }">
                        {{ row.elder_info?.id }}
                    </template>
                </el-table-column>

                <el-table-column label="姓名">
                    <template #default="{ row }">
                        {{ row.elder_info?.full_name }}
                    </template>
                </el-table-column>
                <el-table-column label="体温 (°C)">
                    <template #default="{ row }">
                        <el-input v-model="row.temperature" size="small" />
                    </template>
                </el-table-column>

                <el-table-column label="血压（收缩压） (mmHg)">
                    <template #default="{ row }">
                        <el-input v-model="row.blood_pressure_systolic" size="small" />
                    </template>
                </el-table-column>

                <el-table-column label="血压（舒张压） (mmHg)">
                    <template #default="{ row }">
                        <el-input v-model="row.blood_pressure_diastolic" size="small" />
                    </template>
                </el-table-column>

                <el-table-column label="心率 (bpm)">
                    <template #default="{ row }">
                        <el-input v-model="row.heart_rate" size="small" />
                    </template>
                </el-table-column>

                <el-table-column label="血糖 (mmol/L)">
                    <template #default="{ row }">
                        <el-input v-model="row.blood_sugar" size="small" />
                    </template>
                </el-table-column>

                <el-table-column label="呼吸频率 (/分)">
                    <template #default="{ row }">
                        <el-input v-model="row.respiratory_rate" size="small" />
                    </template>
                </el-table-column>

                <el-table-column label="血氧饱和度 (%)">
                    <template #default="{ row }">
                        <el-input v-model="row.oxygen_saturation" size="small" />
                    </template>
                </el-table-column>

                <el-table-column label="体重 (kg)">
                    <template #default="{ row }">
                        <el-input v-model="row.weight" size="small" />
                    </template>
                </el-table-column>

                <el-table-column label="备注">
                    <template #default="{ row }">
                        <el-input v-model="row.notes" size="small" />
                    </template>
                </el-table-column>

                <el-table-column label="操作">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click="updateRecord(row)">保存</el-button>
                        <el-button type="danger" size="small" @click="deleteRecord(row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-empty v-else description="该日暂无健康记录" />
        </el-card>

        <el-card>
            <h3>按老人查看历史记录</h3>
            <el-form :inline="true" style="margin-bottom: 20px;">
                <el-form-item label="选择老人">
                    <el-select v-model="selectedElderId" placeholder="请选择老人" filterable @change="fetchRecordsByElder">
                        <el-option v-for="elder in elderOptions" :key="elder.id"
                            :label="`id:${elder.id} - 姓名：${elder.full_name}`" :value="elder.id" />
                    </el-select>
                </el-form-item>
            </el-form>

            <el-table :data="recordsByElder" v-if="recordsByElder.length > 0" stripe style="width: 100%;">
                <el-table-column prop="date" label="日期" />

                <el-table-column label="体温 (°C)">
                    <template #default="{ row }">
                        {{ row.temperature || '-' }}
                    </template>
                </el-table-column>

                <el-table-column label="收缩压 (mmHg)">
                    <template #default="{ row }">
                        {{ row.blood_pressure_systolic || '-' }}
                    </template>
                </el-table-column>

                <el-table-column label="舒张压 (mmHg)">
                    <template #default="{ row }">
                        {{ row.blood_pressure_diastolic || '-' }}
                    </template>
                </el-table-column>

                <el-table-column label="心率 (bpm)">
                    <template #default="{ row }">
                        {{ row.heart_rate || '-' }}
                    </template>
                </el-table-column>

                <el-table-column label="血糖 (mmol/L)">
                    <template #default="{ row }">
                        {{ row.blood_sugar || '-' }}
                    </template>
                </el-table-column>

                <el-table-column label="呼吸频率 (/分)">
                    <template #default="{ row }">
                        {{ row.respiratory_rate || '-' }}
                    </template>
                </el-table-column>

                <el-table-column label="血氧饱和度 (%)">
                    <template #default="{ row }">
                        {{ row.oxygen_saturation || '-' }}
                    </template>
                </el-table-column>

                <el-table-column label="体重 (kg)">
                    <template #default="{ row }">
                        {{ row.weight || '-' }}
                    </template>
                </el-table-column>

                <el-table-column label="备注">
                    <template #default="{ row }">
                        {{ row.notes || '-' }}
                    </template>
                </el-table-column>
            </el-table>

            <el-empty v-else description="暂无健康记录" />
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/request'
import { ElMessage } from 'element-plus'

// 日期模块
const selectedDate = ref(new Date())
const recordsByDate = ref([])

const formatDate = (date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const fetchRecordsByDate = async () => {
    if (!selectedDate.value) return
    const formattedDate = formatDate(selectedDate.value)
    try {
        const res = await axios.get('/health/records/', {
            params: { date: formattedDate }
        })
        recordsByDate.value = res.data
    } catch (err) {
        ElMessage.error('加载健康记录失败')
        recordsByDate.value = []
    }
}
fetchRecordsByDate()
const updateRecord = async (record) => {
    try {
        await axios.put(`/health/records/${record.id}/`, {
            temperature: record.temperature,
            blood_pressure_systolic: record.blood_pressure_systolic,
            blood_pressure_diastolic: record.blood_pressure_diastolic,
            heart_rate: record.heart_rate,
            blood_sugar: record.blood_sugar,
            respiratory_rate: record.respiratory_rate,
            oxygen_saturation: record.oxygen_saturation,
            weight: record.weight,
            notes: record.notes
        })
        ElMessage.success('更新成功')
    } catch (err) {
        ElMessage.error('更新失败')
    }
}

const deleteRecord = async (recordId) => {
    try {
        await axios.delete(`/health/records/${recordId}/`)
        ElMessage.success('删除成功')
        fetchRecordsByDate()  // 删除后刷新日期列表
    } catch (err) {
        ElMessage.error('删除失败')
    }
}


// 老人模块
const elderOptions = ref([])
const selectedElderId = ref(null)
const recordsByElder = ref([])

const fetchElderOptions = async () => {
    try {
        const res = await axios.get('/staff/elders/')
        elderOptions.value = res.data
    } catch (err) {
        ElMessage.error('加载老人列表失败')
    }
}

const fetchRecordsByElder = async () => {
    if (!selectedElderId.value) return
    try {
        const res = await axios.get('/health/records/', {
            params: { elder: selectedElderId.value }
        })
        recordsByElder.value = res.data
    } catch (err) {
        ElMessage.error('加载健康记录失败')
        recordsByElder.value = []
    }
}

onMounted(() => {
    fetchElderOptions()
})
</script>