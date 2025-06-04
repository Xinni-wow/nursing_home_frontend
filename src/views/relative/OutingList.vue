<template>
  <div>
    <h2>申请列表</h2>
    <el-table
      :data="pagedOutingList"
      style="width: 100%"
      @row-click="showDetails"
      highlight-current-row
      class="clickable-table"
    >
      <el-table-column label="老人姓名" width="300">
        <template #default="{ row }">
          <span>{{ row.elder?.full_name || '未知' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="外出原因" width="300">
        <template #default="{ row }">
          <span>{{ row.reason }}</span>
        </template>
      </el-table-column>

      <el-table-column label="外出时间" width="300">
        <template #default="{ row }">
          <span>{{ formatDateTime(row.start_time) }} - {{ formatDateTime(row.end_time) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="300">
        <template #default="{ row }">
          <span>{{ formatStatus(row.status) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            @click.stop="onEdit(row)"
            :disabled="row.status !== 'pending'"
          >修改</el-button>
          <el-button
            size="small"
            type="danger"
            @click.stop="onCancel(row)"
            :disabled="row.status !== 'pending'"
          >撤销</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页控件 -->
    <el-pagination
      style="margin-top: 20px; text-align: right;"
      background
      layout="prev, pager, next, jumper, ->, total"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="outingList.length"
      @current-change="handlePageChange"
    >
    </el-pagination>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="dialogVisible"
      :title="`外出申请详情 - ${selectedOuting?.elder?.full_name || ''}`"
      direction="rtl"
      size="40%"
    >
      <div v-if="selectedOuting">
        <p><strong>老人姓名：</strong>{{ selectedOuting.elder?.full_name || '未知' }}</p>
        <p><strong>外出原因：</strong>{{ selectedOuting.reason }}</p>
        <p><strong>外出时间：</strong>{{ formatDateTime(selectedOuting.start_time) }} - {{ formatDateTime(selectedOuting.end_time) }}</p>
        <p><strong>状态：</strong>{{ formatStatus(selectedOuting.status) }}</p>
        <p><strong>管理员审批留言：</strong></p>
        <p style="white-space: pre-wrap; border: 1px solid #eee; padding: 8px; min-height: 60px;">
          {{ selectedOuting.remarks || '无留言' }}
        </p>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import request from '@/utils/request'

const router = useRouter()
const outingList = ref([])

const dialogVisible = ref(false)
const selectedOuting = ref(null)

const currentPage = ref(1)
const pageSize = ref(10)

const pagedOutingList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return outingList.value.slice(start, start + pageSize.value)
})

const fetchOutingList = async () => {
  try {
    const response = await request.get('relative/outing/list/')
    outingList.value = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch (error) {
    console.error('获取外出申请失败', error)
    ElMessage.error('获取外出申请失败')
  }
}

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

const statusMap = {
  pending: '待审批',
  canceled: '用户已撤销',
  approved: '审批通过',
  rejected: '审批拒绝'
}

const formatStatus = (status) => {
  return statusMap[status] || status
}

const onEdit = (row) => {
  router.push({ name: 'OutingEdit', params: { id: row.id } })
}

const onCancel = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要撤销该外出申请吗？',
      '撤销确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await request.post(`relative/outing/${row.id}/cancel/`)
    ElMessage.success('撤销成功')
    fetchOutingList()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('撤销申请失败', error)
      ElMessage.error('撤销申请失败')
    }
  }
}

const showDetails = (row) => {
  selectedOuting.value = row
  dialogVisible.value = true
}

const handlePageChange = (page) => {
  currentPage.value = page
}

onMounted(() => {
  fetchOutingList()
})
</script>

<style scoped>
/* 鼠标悬浮整行高亮，并显示为可点击 */
.clickable-table >>> .el-table__row:hover {
  background-color: #f5f7fa !important;
  cursor: pointer;
}
</style>
