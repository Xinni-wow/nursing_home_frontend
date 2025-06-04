<template>
  <div>
    <h2>修改外出申请</h2>
    <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
      <el-form-item label="外出原因" prop="reason">
        <el-input v-model="form.reason" />
      </el-form-item>

      <el-form-item label="开始时间" prop="start_time">
        <el-date-picker
          v-model="form.start_time"
          type="datetime"
          placeholder="请选择开始时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DDTHH:mm:ssZ"
        />
      </el-form-item>

      <el-form-item label="结束时间" prop="end_time">
        <el-date-picker
          v-model="form.end_time"
          type="datetime"
          placeholder="请选择结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DDTHH:mm:ssZ"
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

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const form = ref({
  reason: '',
  start_time: '',
  end_time: ''
})

const rules = {
  reason: [{ required: true, message: '请输入外出原因', trigger: 'blur' }],
  start_time: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  end_time: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const fetchOuting = async () => {
  try {
    const response = await request.get(`relative/outing/${route.params.id}/`)
    Object.assign(form.value, {
      reason: response.data.reason,
      start_time: response.data.start_time,
      end_time: response.data.end_time
    })
  } catch (error) {
    ElMessage.error('获取申请详情失败')
  }
}

const onSubmit = () => {
  formRef.value.validate(async valid => {
    if (!valid) return

    // 简单验证开始时间必须早于结束时间
    if (new Date(form.value.start_time) >= new Date(form.value.end_time)) {
      ElMessage.error('开始时间必须早于结束时间')
      return
    }

    try {
      await request.put(`relative/outing/${route.params.id}/`, {
        reason: form.value.reason,
        start_time: form.value.start_time,
        end_time: form.value.end_time
      })
      ElMessage.success('修改成功')
      router.push({ name: 'OutingList' }) // 返回列表页，路由名请确认
    } catch (error) {
      ElMessage.error('修改失败')
    }
  })
}

const onCancel = () => {
  router.back()
}

onMounted(() => {
  fetchOuting()
})
</script>
