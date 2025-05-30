<template>
  <div style="max-width: 600px; margin: 20px auto;">
    <h2>撤销外出申请确认</h2>
    <el-card>
      <p><strong>老人姓名：</strong> {{ outing.elder?.full_name || '未知' }}</p>
      <p><strong>外出时间：</strong> {{ formatDateTime(outing.start_time) }} - {{ formatDateTime(outing.end_time) }}</p>
      <p><strong>外出原因：</strong> {{ outing.reason }}</p>
      <el-alert
        title="撤销后申请状态将变为“用户已撤销”，不可恢复。"
        type="warning"
        show-icon
        class="mb-4"
      />
      <div style="text-align: right;">
        <el-button @click="onCancel" plain>取消</el-button>
        <el-button type="danger" @click="onConfirmCancel" :loading="loading" style="margin-left: 12px;">
          确认撤销
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()

const outingId = route.params.id
const outing = ref({})
const loading = ref(false)

// 格式化时间函数
const formatDateTime = (datetimeStr) => {
  if (!datetimeStr) return ''
  const dt = new Date(datetimeStr)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const d = String(dt.getDate()).padStart(2, '0')
  const hh = String(dt.getHours()).padStart(2, '0')
  const mm = String(dt.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}`
}

// 加载外出申请详情
const fetchOuting = async () => {
  try {
    const res = await request.get(`relative/outing/${outingId}/`)
    outing.value = res.data
  } catch (err) {
    ElMessage.error('加载申请详情失败')
    router.back()
  }
}

// 点击取消按钮，返回上一页或列表页
const onCancel = () => {
  router.back()
}

// 点击确认撤销按钮
const onConfirmCancel = async () => {
  loading.value = true
  try {
    await request.post(`relative/outing/${outingId}/cancel/`)
    ElMessage.success('撤销成功')
    router.push({ name: 'OutingList' }) // 跳回申请列表页，路由名根据实际改
  } catch (err) {
    ElMessage.error('撤销失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOuting()
})
</script>
