<template>
  <el-card class="form-container" :body-style="{ padding: '30px' }">
    <h2 class="form-title">老人外出申请表</h2>
    <el-form
      :model="form"
      ref="formRef"
      label-width="100px"
      :rules="rules"
      @keyup.enter="submitForm"
    >
      <el-form-item label="选择老人" prop="elder">
        <el-select
          v-model="form.elder"
          placeholder="请选择老人"
          filterable
          clearable
          class="form-input"
        >
          <el-option
            v-for="item in elders"
            :key="item.id"
            :label="`${item.full_name} (ID: ${item.id})`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="外出事由" prop="reason">
        <el-input
          v-model="form.reason"
          placeholder="请输入外出事由"
          type="textarea"
          :rows="3"
          show-word-limit
          maxlength="200"
          class="form-input"
        />
      </el-form-item>

      <el-form-item label="开始时间" prop="start_time">
        <el-date-picker
          v-model="form.start_time"
          type="datetime"
          placeholder="选择开始时间"
          :disabled-date="disabledBeforeToday"
          :shortcuts="timeShortcuts"
          class="form-input"
        />
      </el-form-item>

      <el-form-item label="结束时间" prop="end_time">
        <el-date-picker
          v-model="form.end_time"
          type="datetime"
          placeholder="选择结束时间"
          :disabled-date="disabledEndDate"
          :shortcuts="timeShortcuts"
          class="form-input"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          提交申请
        </el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import dayjs from 'dayjs'

const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  elder: '',
  reason: '',
  start_time: '',
  end_time: '',
})

const rules = {
  elder: [{ required: true, message: '请选择老人', trigger: 'change' }],
  reason: [
    { required: true, message: '请输入外出事由', trigger: 'blur' },
    { min: 5, message: '事由描述至少5个字符', trigger: 'blur' }
  ],
  start_time: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  end_time: [
    { required: true, message: '请选择结束时间', trigger: 'change' },
    { validator: validateEndTime, trigger: 'change' }
  ]
}

const elders = ref([])

const timeShortcuts = [
  {
    text: '1小时后',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 1000)
      return date
    }
  },
  {
    text: '2小时后',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 2000)
      return date
    }
  },
  {
    text: '明天此时',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() + 3600 * 24 * 1000)
      return date
    }
  }
]

function validateEndTime(rule, value, callback) {
  if (!value) {
    callback(new Error('请选择结束时间'))
    return
  }
  if (form.start_time && new Date(value) <= new Date(form.start_time)) {
    callback(new Error('结束时间必须晚于开始时间'))
  } else {
    callback()
  }
}

function disabledBeforeToday(time) {
  return time.getTime() < Date.now() - 86400000
}

function disabledEndDate(time) {
  if (!form.start_time) return time.getTime() < Date.now() - 86400000
  return time.getTime() < new Date(form.start_time).getTime()
}

async function fetchElders() {
  try {
    const res = await request.get('relative/elders/')
    elders.value = res.data || []
  } catch (error) {
    ElMessage.error('加载老人列表失败')
    console.error('加载老人列表失败:', error)
  }
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true

    try {
      await request.post('relative/outing/add/', {
        elder_id: form.elder,
        reason: form.reason,
        start_time: dayjs(form.start_time).format('YYYY-MM-DD HH:mm:ss'),
        end_time: dayjs(form.end_time).format('YYYY-MM-DD HH:mm:ss'),
      })

      ElMessage.success('外出申请提交成功')
      resetForm()
    } catch (error) {
      let errorMsg = '提交失败'
      if (error.response?.data) {
        errorMsg += `: ${JSON.stringify(error.response.data)}`
      }
      ElMessage.error(errorMsg)
      console.error('提交失败:', error)
    } finally {
      submitting.value = false
    }
  })
}

function resetForm() {
  formRef.value?.resetFields()
}

onMounted(() => {
  fetchElders()
})
</script>

<style scoped>
.form-container {
  max-width: 1000px;
  width: 95%;
  margin: 40px auto;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.form-title {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-size: 22px;
}

.form-input {
  width: 100%;
  min-width: 250px;
}

.el-form-item {
  margin-bottom: 22px;
}

@media (max-width: 768px) {
  .form-container {
    width: 100%;
    margin: 10px;
    padding: 20px;
  }
}
</style>
