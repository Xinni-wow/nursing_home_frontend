<template>
  <el-card class="form-container" :body-style="{ padding: '30px' }">
    <h2 class="form-title">老人来访预约表</h2>
    <el-form :model="form" ref="formRef" label-width="100px">
      <el-form-item
        label="选择老人"
        prop="elder"
        :rules="[{ required: true, message: '请选择老人', trigger: 'change' }]"
      >
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
            :label="item.full_name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        label="来访日期"
        prop="visit_date"
        :rules="[{ required: true, message: '请选择来访日期', trigger: 'change' }]"
      >
        <el-date-picker
          v-model="form.visit_date"
          type="date"
          placeholder="选择来访日期"
          :disabled-date="disabledDate"
          class="form-input"
        />
      </el-form-item>

      <el-form-item
        label="来访时间"
        prop="visit_time"
        :rules="[{ required: true, message: '请选择来访时间', trigger: 'change' }]"
      >
        <el-time-picker
          v-model="form.visit_time"
          format="HH:mm"
          value-format="HH:mm"
          placeholder="选择来访时间"
          class="form-input"
        />
      </el-form-item>

      <el-form-item
        label="来访人数"
         prop="visitor_count"
         :rules="[{ required: true, message: '请输入来访人数', trigger: 'blur' }]"
          >
          <el-input-number
           v-model="form.visitor_count"
            :min="1"
            :max="5"
            class="narrow-input"
           />
        </el-form-item>


      <el-form-item
        label="备注"
        prop="reason"
        :rules="[{ required: true, message: '备注', trigger: 'blur' }]"
      >
        <el-input
          v-model="form.reason"
          type="textarea"
          placeholder="请输入备注"
          :rows="3"
          class="form-input"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">提交预约</el-button>
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
const form = reactive({
  elder: '',
  visit_date: '',
  visit_time: '',
  visitor_count: 1,
  reason: ''
})

const elders = ref([])

async function fetchElders() {
  try {
    const res = await request.get('relative/elders/')
    elders.value = res.data
  } catch (error) {
    ElMessage.error('加载老人列表失败')
  }
}

const disabledDate = (time) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      const formattedDate = dayjs(form.visit_date).format('YYYY-MM-DD')
      await request.post('relative/appointment/add/', {
        elder: form.elder,
        visit_date: formattedDate,
        visit_time: form.visit_time,
        visitor_count: form.visitor_count,
        reason: form.reason
      })

      ElMessage.success('来访预约提交成功')
      resetForm()
    } catch (error) {
      if (error.response?.data) {
        ElMessage.error(`提交失败: ${JSON.stringify(error.response.data)}`)
      } else {
        ElMessage.error('提交失败，未知错误')
      }
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
