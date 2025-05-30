<template>
  <div>
    <h2>修改来访预约</h2>
    <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">

      <el-form-item label="来访日期" prop="visit_date">
        <el-date-picker
          v-model="form.visit_date"
          type="date"
          placeholder="请选择来访日期"
          :disabled-date="disabledDate"
        />
      </el-form-item>

      <el-form-item label="来访时间" prop="visit_time">
        <el-time-picker
          v-model="form.visit_time"
          format="HH:mm"
          value-format="HH:mm"
          placeholder="请选择来访时间"
        />
      </el-form-item>

      <el-form-item label="来访人数" prop="visitor_count">
        <el-input-number v-model="form.visitor_count" :min="1" :max="5" />
      </el-form-item>

      <el-form-item label="来访事由" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          :rows="3"
          placeholder="请输入来访事由"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交修改</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const form = ref({
  user_full_name: '',
  elder: null,
  visit_date: '',
  visit_time: '',
  visitor_count: 1,
  reason: '',
  status: ''
})

const rules = {
  visit_date: [{ required: true, message: '请选择来访日期', trigger: 'change' }],
  visit_time: [{ required: true, message: '请选择来访时间', trigger: 'change' }],
  visitor_count: [{ required: true, message: '请输入来访人数', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入来访事由', trigger: 'blur' }]
}

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

const fetchVisit = async () => {
  try {
    const response = await request.get(`relative/appointment/${route.params.id}/`)
    form.value = {
      id: response.data.id,
      elder: response.data.elder,
      visit_date: response.data.visit_date,
      visit_time: response.data.visit_time,
      visitor_count: response.data.visitor_count,
      reason: response.data.reason,
      status: response.data.status
    }
  } catch (error) {
    ElMessage.error('获取预约详情失败')
    router.push({ name: 'AppointmentList' })
  }
}

const onSubmit = () => {
  formRef.value.validate(async valid => {
    if (!valid) return

    try {
      await request.put(`/relative/appointment/${form.value.id}/`, {
        visit_date: dayjs(form.value.visit_date).format('YYYY-MM-DD'),
        visit_time: form.value.visit_time,
        visitor_count: form.value.visitor_count,
        reason: form.value.reason
      })
      ElMessage.success('修改成功')
      router.push({ name: 'AppointmentList' })
    } catch (error) {
      ElMessage.error('修改失败: ' + (error.response?.data?.detail || error.message))
    }
  })
}


const onCancel = () => {
  router.back()
}

onMounted(() => {
  fetchVisit()
})
</script>
