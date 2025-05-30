<template>
  <div class="p-4">
    <el-card>
      <h2>外出申请审批列表</h2>
      <el-table
        :data="pagedOutingList"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column label="申请序号">
          <template #default="{ row }">
            {{ row.id }}
          </template>
        </el-table-column>

        <el-table-column label="老人姓名">
          <template #default="{ row }">
            {{ row.elder?.full_name || '未知' }}
          </template>
        </el-table-column>

        <el-table-column label="外出时间">
          <template #default="{ row }">
            {{ formatDate(row.start_time) }} 至 {{ formatDate(row.end_time) }}
          </template>
        </el-table-column>

        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="openDialog(row)"
              :disabled="row.status !== 'pending'"
            >
              审批
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="outinglist.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 审批弹窗 -->
    <el-dialog v-model="dialogVisible" title="审批外出申请" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="老人ID">
          <span>{{ selectedOuting.elder.id }}</span>
        </el-form-item>
        <el-form-item label="外出时间">
          <span>
            {{ formatDate(selectedOuting.start_time) }} 至
            {{ formatDate(selectedOuting.end_time) }}
          </span>
        </el-form-item>
        <el-form-item label="事由">
          <span>{{ selectedOuting.reason }}</span>
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

const outinglist = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const selectedOuting = ref({})
const form = ref({
  status: '',
  remarks: ''
})

// 分页相关
const currentPage = ref(1)
const pageSize = 10
const pagedOutingList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return outinglist.value.slice(start, start + pageSize)
})
const handlePageChange = (page) => {
  currentPage.value = page
}

// 获取外出申请列表（并将 pending 的排在前面）
const fetchOutings = async () => {
  loading.value = true
  try {
    const response = await request.get('staff/outing/list/')
    let data = Array.isArray(response.data) ? response.data : []

    // 将 pending 放到前面
    const order = { pending: 0, approved: 1, rejected: 2, canceled: 3 }
    data.sort((a, b) => {
      return (order[a.status] ?? 99) - (order[b.status] ?? 99)
    })

    outinglist.value = data
    currentPage.value = 1
  } catch (error) {
    ElMessage.error('获取外出申请列表失败')
    console.error('获取失败:', error)
  } finally {
    loading.value = false
  }
}

// 打开审批弹窗
const openDialog = (outing) => {
  selectedOuting.value = outing
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
    await request.post(`staff/outing/review/${selectedOuting.value.id}/`, form.value)
    ElMessage.success('审批成功')
    dialogVisible.value = false
    fetchOutings()
  } catch (error) {
    const errorMsg = error.response?.data?.message || '审批失败，请重试'
    ElMessage.error(errorMsg)
    console.error('审批失败:', error)
  }
}

// 状态显示
const formatStatus = (status) => {
  const map = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
    canceled: '已取消'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    canceled: 'info'
  }
  return map[status] || ''
}

// 日期格式化
const formatDate = (date) => {
  if (!date) return ''
  try {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
  } catch (e) {
    console.error('日期格式化错误:', e)
    return date
  }
}

onMounted(() => {
  fetchOutings()
})
</script>

<style scoped>
.el-tag {
  margin-right: 10px;
}
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
