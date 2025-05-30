<template>
  <div class="p-4">
    <el-card>
      <h2>来访预约审批列表</h2>
      <el-table :data="paginatedList" style="width: 100%" v-loading="loading">
        <el-table-column label="预约人员">
          <template #default="{ row }">
            {{ row.user_full_name }}
          </template>
        </el-table-column>

        <el-table-column label="来访时间">
          <template #default="{ row }">
            {{ formatDate(row.visit_date) }} {{ row.visit_time }}
          </template>
        </el-table-column>

        <el-table-column label="来访人数" width="100">
          <template #default="{ row }">
            {{ row.visitor_count }}人
          </template>
        </el-table-column>

        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="openDialog(row)"
              :disabled="row.status !== 'pending'"
            >审批</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-4 text-center">
        <el-pagination
          background
          layout="prev, pager, next"
          :page-size="pageSize"
          :total="sortedList.length"
          @current-change="handlePageChange"
          :current-page="currentPage"
        />
      </div>
    </el-card>

    <!-- 审批弹窗 -->
    <el-dialog v-model="dialogVisible" title="审批来访预约" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="预约人员">
          <span>{{ selectedVisit.user_full_name }}</span>
        </el-form-item>

        <el-form-item label="来访时间">
          <span>{{ formatDate(selectedVisit.visit_date) }} {{ selectedVisit.visit_time }}</span>
        </el-form-item>

        <el-form-item label="来访人数">
          <span>{{ selectedVisit.visitor_count }}人</span>
        </el-form-item>

        <el-form-item label="来访事由">
          <span>{{ selectedVisit.reason }}</span>
        </el-form-item>

        <el-form-item label="审批结果">
          <el-radio-group v-model="form.status">
            <el-radio-button label="approved">通过</el-radio-button>
            <el-radio-button label="rejected">拒绝</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            type="textarea"
            v-model="form.remarks"
            placeholder="审批备注（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview">提交审批</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const visitList = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const selectedVisit = ref({})
const form = ref({
  status: '',
  remarks: ''
})

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)

// 获取预约列表
const fetchVisits = async () => {
  loading.value = true
  try {
    const response = await request.get('staff/appointment/list/')
    visitList.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    ElMessage.error('获取来访预约列表失败')
    console.error('获取来访预约列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 打开弹窗
const openDialog = (visit) => {
  selectedVisit.value = visit
  form.value = {
    status: '',
    remarks: ''
  }
  dialogVisible.value = true
}

// 提交审批
const submitReview = async () => {
  if (!form.value.status) {
    ElMessage.error('请选择审批结果')
    return
  }

  try {
    await request.post(`staff/appointment/review/${selectedVisit.value.id}/`, form.value)
    ElMessage.success('审批成功')
    dialogVisible.value = false
    fetchVisits()
  } catch (error) {
    const errorMsg = error.response?.data?.message || '审批失败，请重试'
    ElMessage.error(errorMsg)
    console.error('审批失败:', error)
  }
}

// 状态标签
const formatStatus = (status) => {
  const statusMap = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
    canceled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    canceled: 'info'
  }
  return typeMap[status] || ''
}

// 日期格式
const formatDate = (date) => {
  if (!date) return ''
  try {
    return new Date(date).toLocaleDateString('zh-CN').replace(/\//g, '-')
  } catch (e) {
    console.error('日期格式化错误:', e)
    return date
  }
}

// 排序：待审批排前面
const sortedList = computed(() => {
  return [...visitList.value].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return 0
  })
})

// 当前页数据
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedList.value.slice(start, start + pageSize.value)
})

const handlePageChange = (page) => {
  currentPage.value = page
}

onMounted(() => {
  fetchVisits()
})
</script>

<style scoped>
.el-tag {
  margin-right: 10px;
}
.mt-4 {
  margin-top: 16px;
}
.text-center {
  text-align: center;
}
</style>
