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

                <el-table-column label="操作" width="180">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click="updateRecord(row)">保存</el-button>
                        <el-button type="danger" size="small" @click="deleteRecord(row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-empty v-else description="该日暂无健康记录" />
        </el-card>

        <el-card>
            <h2 class="text-xl font-bold mb-4">查看老人健康信息</h2>

            <!-- 选择老人 -->
            <el-form :inline="true">
                <el-form-item label="选择老人">
                    <el-select v-model="selectedElderId" placeholder="请选择老人" style="width: 240px"
                        @change="fetchHealthData" :disabled="elders.length === 0">
                        <el-option v-for="elder in elders" :key="elder.id" :label="`${elder.full_name}（ID：${elder.id}）`"
                            :value="elder.id" />
                    </el-select>

                    <div v-if="elders.length === 0" style="margin-top: 10px; color: gray;">
                        暂无可查看的老人，请先添加老人信息。
                    </div>
                </el-form-item>
            </el-form>

            <!-- 健康记录表格 -->
            <el-table :data="paginatedRecords" class="mt-4" stripe>
                <el-table-column prop="date" label="日期" width="120" />
                <el-table-column prop="temperature" label="体温 (°C)" />
                <el-table-column prop="heart_rate" label="心率 (bpm)" />
                <el-table-column label="血压 (mmHg)">
                    <template #default="{ row }">
                        <span v-if="row.blood_pressure_systolic && row.blood_pressure_diastolic">
                            {{ row.blood_pressure_systolic }} / {{ row.blood_pressure_diastolic }}
                        </span>
                        <span v-else>--</span>
                    </template>
                </el-table-column>
                <el-table-column prop="blood_sugar" label="血糖 (mmol/L)" />
                <el-table-column prop="respiratory_rate" label="呼吸频率 (次/分钟)" />
                <el-table-column prop="oxygen_saturation" label="血氧 (%)" />
                <el-table-column prop="weight" label="体重 (kg)" />
            </el-table>

            <!-- 分页控件 -->
            <el-pagination v-if="healthRecords.length > 0" v-model:current-page="currentPage" :page-size="pageSize"
                :total="healthRecords.length" layout="prev, pager, next" class="mt-4 justify-center" />

            <!-- 图表展示 -->
            <div v-show="healthRecords.length > 0" class="mt-8">
                <h3 class="text-lg font-semibold mb-2">健康趋势图</h3>
                <v-chart :option="lineChartOption" autoresize style="height: 400px;" class="mt-6" />
                <v-chart :option="barChartOption" autoresize style="height: 400px;" class="mt-6" />
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
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
        const formattedDate = formatDate(selectedDate.value)

        const cleanValue = (val) => {
            if (val === '' || isNaN(val)) return null
            return parseFloat(val)
        }

        await axios.put(`/health/records/${record.id}/`, {
            elder: record.elder_info.id,
            date: formattedDate,
            temperature: cleanValue(record.temperature),
            blood_pressure_systolic: cleanValue(record.blood_pressure_systolic),
            blood_pressure_diastolic: cleanValue(record.blood_pressure_diastolic),
            heart_rate: cleanValue(record.heart_rate),
            blood_sugar: cleanValue(record.blood_sugar),
            respiratory_rate: cleanValue(record.respiratory_rate),
            oxygen_saturation: cleanValue(record.oxygen_saturation),
            weight: cleanValue(record.weight),
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



import VChart from 'vue-echarts'

import { use } from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
use([LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer])

const selectedElderId = ref(null)
const elders = ref([])
const healthRecords = ref([])

const currentPage = ref(1)
const pageSize = 7

// 表格当前页数据
const paginatedRecords = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return healthRecords.value.slice(start, start + pageSize)
})

// 近 7 天的数据用于图表
const recent7Records = computed(() => {
    return healthRecords.value
        .slice() // 避免修改原数组
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // 按日期降序
        .slice(0, 7)
        .reverse() // 日期升序
})

const lineChartOption = ref({})
const barChartOption = ref({})

// 获取当前用户绑定的老人
const fetchElders = async () => {
    const res = await axios.get('/staff/elders/')
    elders.value = res.data

    // 默认选中第一个
    if (elders.value.length > 0) {
        selectedElderId.value = elders.value[0].id
        fetchHealthData()
    }
}

// 获取某老人健康记录
const fetchHealthData = async () => {
    if (!selectedElderId.value) return
    const res = await axios.get('/health/records/', {
        params: { elder: selectedElderId.value }
    })
    healthRecords.value = res.data

    // 等待 DOM 更新后再初始化图表
    await nextTick()
    updateCharts()
}

// 生成图表数据
const updateCharts = () => {
    const records = recent7Records.value
    const dates = records.map(r => r.date)
    const temperature = records.map(r => r.temperature)
    const heartRate = records.map(r => r.heart_rate)
    const bloodPressureSys = records.map(r => r.blood_pressure_systolic)
    const bloodPressureDia = records.map(r => r.blood_pressure_diastolic)
    const bloodSugar = records.map(r => r.blood_sugar)
    const respiratoryRate = records.map(r => r.respiratory_rate)
    const oxygen = records.map(r => r.oxygen_saturation)
    const weight = records.map(r => r.weight)

    lineChartOption.value = {
        title: { text: '近7日健康趋势' },
        tooltip: { trigger: 'axis' },
        legend: {
            data: ['体温 (°C)', '心率 (bpm)', '收缩压 (mmHg)', '舒张压 (mmHg)', '血糖 (mmol/L)', '呼吸频率', '血氧 (%)', '体重 (kg)']
        },
        xAxis: { type: 'category', data: dates },
        yAxis: { type: 'value' },
        series: [
            { name: '体温 (°C)', type: 'line', data: temperature },
            { name: '心率 (bpm)', type: 'line', data: heartRate },
            { name: '收缩压 (mmHg)', type: 'line', data: bloodPressureSys },
            { name: '舒张压 (mmHg)', type: 'line', data: bloodPressureDia },
            { name: '血糖 (mmol/L)', type: 'line', data: bloodSugar },
            { name: '呼吸频率', type: 'line', data: respiratoryRate },
            { name: '血氧 (%)', type: 'line', data: oxygen },
            { name: '体重 (kg)', type: 'line', data: weight }
        ]
    }

    barChartOption.value = {
        title: { text: '近7日健康指标平均值' },
        tooltip: {},
        xAxis: {
            type: 'category',
            data: [
                '体温 (°C)',
                '心率 (bpm)',
                '收缩压 (mmHg)',
                '舒张压 (mmHg)',
                '血糖 (mmol/L)',
                '呼吸频率 (/min)',
                '血氧 (%)',
                '体重 (kg)'
            ]
        },
        yAxis: { type: 'value' },
        series: [{
            type: 'bar',
            data: [
                average(temperature),
                average(heartRate),
                average(bloodPressureSys),
                average(bloodPressureDia),
                average(bloodSugar),
                average(respiratoryRate),
                average(oxygen),
                average(weight)
            ]
        }]
    }
}

// 平均函数
const average = arr => {
    if (arr.length === 0) return 0
    return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
}

onMounted(() => {
    fetchElders()
})
</script>
