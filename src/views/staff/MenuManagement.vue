<template>
  <el-row :gutter="20" style="padding: 20px; display: flex; align-items: stretch;">
    <!-- 左栏：上传 / 修改菜单 -->
    <el-col :xs="24" :md="10" style="display: flex;">
      <el-card shadow="hover" style="flex: 1; border-radius: 12px;">
        <h2 style="margin-bottom: 20px; text-align: center;">上传 / 修改菜单</h2>
        <el-form :model="form" ref="formRef" :rules="rules" label-width="80px">
          <el-form-item label="日期" prop="date">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="选择日期（本周 + 后 4 周）"
              :disabled-date="disableInvalidDate"
              style="width: 100%;"
            />
          </el-form-item>

          <el-form-item label="餐别" prop="meal_type">
            <el-select v-model="form.meal_type" placeholder="选择餐别" style="width: 100%;">
              <el-option label="早餐" value="breakfast" />
              <el-option label="午餐" value="lunch" />
              <el-option label="晚餐" value="dinner" />
            </el-select>
          </el-form-item>

          <el-form-item label="菜单内容" prop="content">
            <el-input
              type="textarea"
              v-model="form.content"
              placeholder="如：粥 + 鸡蛋 + 馒头"
              :rows="3"
              style="width: 100%;"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitMenu" :loading="loading">提交</el-button>
            <el-button @click="resetForm" :disabled="loading" style="margin-left: 10px;">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>

    <!-- 右栏：菜单展示 -->
    <el-col :xs="24" :md="14" style="display: flex;">
      <el-card shadow="hover" style="flex: 1; border-radius: 12px;">
        <h2 style="margin-bottom: 20px; text-align: center;">已上传菜单</h2>

        <el-form inline style="margin-bottom: 20px;">
          <el-form-item label="开始日期">
            <el-date-picker
              v-model="query.start_date"
              type="date"
              placeholder="选择开始日期"
              style="width: 140px;"
            />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker
              v-model="query.end_date"
              type="date"
              placeholder="选择结束日期"
              style="width: 140px;"
            />
          </el-form-item>
           <el-form-item>
               <el-button type="primary" @click="fetchMenus">查询</el-button>
             </el-form-item>
        </el-form>

        <el-table :data="menuList" style="width: 100%;" border height="400">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="meal_type_display" label="餐别" width="100" />
          <el-table-column prop="content" label="菜单内容" />
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'  // 你的 axios 实例
import { ElMessage } from 'element-plus'

const formRef = ref(null)
const loading = ref(false)

const form = ref({
  date: new Date(),
  meal_type: '',
  content: '',
})

// 禁止选择今天之前或 28 天之后的日期
const today = new Date()
today.setHours(0, 0, 0, 0)
const maxDate = new Date(today)
maxDate.setDate(today.getDate() + 28)

const disableInvalidDate = (time) => {
  const timeDate = new Date(time.getFullYear(), time.getMonth(), time.getDate())
  return timeDate < today || timeDate > maxDate
}

// 格式化为 yyyy-mm-dd 字符串
function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 校验规则
const rules = {
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  meal_type: [{ required: true, message: '请选择餐别', trigger: 'change' }],
  content: [{ required: true, message: '请输入菜单内容', trigger: 'blur' }],
}

// 提交菜单
const submitMenu = () => {
  if (!formRef.value) return

  formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const payload = {
        date: formatDate(form.value.date),
        meal_type: form.value.meal_type,
        content: form.value.content,
      }

      const res = await request.post('staff/diet/manage/', payload)
      ElMessage.success(res.status === 201 ? '菜单新增成功' : '菜单更新成功')
      resetForm()
      fetchMenus()  // 提交后刷新表格
    } catch (err) {
      console.error('❌ 提交失败:', err.response?.data || err.message)
      ElMessage.error(err.response?.data?.detail || '提交失败，请检查内容或权限')
    } finally {
      loading.value = false
    }
  })
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
}

// ========== 菜单查询逻辑 ========== //
const query = ref({
  start_date: new Date(),  // 直接用 Date 对象
  end_date: new Date(today.getTime() + 28 * 24 * 3600 * 1000),
})


const menuList = ref([])
const fetchMenus = async () => {
  try {
    const { start_date, end_date } = query.value

    // 开始日期和结束日期都不能为空
    if (!start_date) {
      ElMessage.warning('请先选择开始日期')
      return
    }
    if (!end_date) {
      ElMessage.warning('请先选择结束日期')
      return
    }

    // 开始日期不能晚于结束日期
    if (start_date > end_date) {
      ElMessage.warning('开始日期不能晚于结束日期')
      return
    }

    const startDateStr = formatDate(start_date)
    const endDateStr = formatDate(end_date)

    const res = await request.get('staff/diet/list/', {
      params: {
        start_date: startDateStr,
        end_date: endDateStr,
      }
    })

    menuList.value = res.data
  } catch (err) {
    console.error('❌ 获取菜单失败:', err.response?.data || err.message)
    ElMessage.error(err.response?.data?.detail || '获取菜单失败')
  }
}



onMounted(fetchMenus)
</script>
