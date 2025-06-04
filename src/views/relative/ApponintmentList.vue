<template>
  <div>
    <h2>来访预约列表</h2>
    <el-table
      :data="pagedVisitList"
      style="width: 100%"
      @row-click="showDetails"
      highlight-current-row
      class="clickable-table"
    >
      <el-table-column label="申请人" width="250">
        <template #default="{ row }">
          <span>{{ row.user_full_name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="拜访老人" width="250">
        <template #default="{ row }">
          <span>{{ row.elder_name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="来访时间" width="250">
        <template #default="{ row }">
          <span>{{ formatDate(row.visit_date) }} {{ row.visit_time }}</span>
        </template>
      </el-table-column>

      <el-table-column label="来访人数" width="250">
        <template #default="{ row }">
          {{ row.visitor_count }}人
        </template>
      </el-table-column>

      <el-table-column label="状态" width="250">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ formatStatus(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200">
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
          >取消</el-button>
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
      :total="visitList.length"
      @current-change="handlePageChange"
    />

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="dialogVisible"
      :title="`来访预约详情 - ${selectedVisit?.user_full_name || ''}`"
      direction="rtl"
      size="40%"
    >
      <div v-if="selectedVisit">
        <p><strong>拜访老人：</strong>{{ selectedVisit.elder_name }}</p>
        <p><strong>来访时间：</strong>{{ formatDate(selectedVisit.visit_date) }} {{ selectedVisit.visit_time }}</p>
        <p><strong>来访人数：</strong>{{ selectedVisit.visitor_count }}人</p>
        <p><strong>来访事由：</strong>{{ selectedVisit.reason }}</p>
        <p><strong>状态：</strong>{{ formatStatus(selectedVisit.status) }}</p>
        <p><strong>管理员备注：</strong></p>
        <p style="white-space: pre-wrap; border: 1px solid #eee; padding: 8px; min-height: 60px;">
          {{ selectedVisit.remarks || '无备注' }}
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
const visitList = ref([])
const dialogVisible = ref(false)
const selectedVisit = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

const pagedVisitList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return visitList.value.slice(start, start + pageSize.value)
})

const fetchVisitList = async () => {
  try {
    const response = await request.get('relative/appointment/list/')
    visitList.value = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch (error) {
    console.error('获取来访预约失败', error)
    ElMessage.error('获取来访预约失败')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}

const formatDateTime = (datetimeStr) => {
  if (!datetimeStr) return ''
  return new Date(datetimeStr).toLocaleString()
}

const statusMap = {
  pending: '待审批',
  canceled: '已取消',
  approved: '已批准',
  rejected: '已拒绝'
}

const formatStatus = (status) => {
  return statusMap[status] || status
}

const getStatusTagType = (status) => {
  switch (status) {
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    case 'canceled': return 'info'
    default: return 'warning'
  }
}

const onEdit = (row) => {
  router.push({ name: 'VisitEdit', params: { id: row.id } })
}

const onCancel = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消该来访预约吗？',
      '取消确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await request.post(`relative/visit/${row.id}/cancel/`)
    ElMessage.success('取消成功')
    fetchVisitList()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('取消预约失败', error)
      ElMessage.error('取消预约失败')
    }
  }
}

const showDetails = (row) => {
  selectedVisit.value = row
  dialogVisible.value = true
}

const handlePageChange = (page) => {
  currentPage.value = page
}

onMounted(() => {
  fetchVisitList()
})
</script>

<style scoped>
/* 鼠标悬浮整行高亮，且鼠标变手势 */
.clickable-table >>> .el-table__row:hover {
  background-color: #f5f7fa !important;
  cursor: pointer;
}
</style>
