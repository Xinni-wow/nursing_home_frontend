<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h2 class="text-xl font-bold mb-4">入住记录管理</h2>

    <el-card class="mb-4">
      <div class="flex flex-wrap gap-4 items-center">
        <el-input v-model="search.elder" placeholder="按老人姓名搜索" clearable style="max-width: 200px" />
        <el-input v-model="search.room" placeholder="按房间号搜索" clearable style="max-width: 200px" />
        <el-select v-model="search.status" placeholder="入住状态" clearable style="max-width: 160px">
          <el-option label="在住" value="active" />
          <el-option label="已退房" value="left" />
        </el-select>
        <el-button type="primary" @click="getCheckins">搜索</el-button>
      </div>
    </el-card>

    <el-table :data="checkins" border style="width: 100%">
      <el-table-column prop="elder_name" label="老人姓名" />
      <el-table-column prop="room_number" label="房间号" />
      <el-table-column prop="start_date" label="入住日期" />
      <el-table-column prop="duration_years" label="入住年限" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button
            v-if="scope.row.status === '在住'"
            type="danger"
            @click="checkout(scope.row.id)"
          >
            退房
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="mt-4"
      background
      layout="prev, pager, next, jumper, ->, total, sizes"
      :total="pagination.total"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      :page-sizes="[5, 10, 20, 50]"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const checkins = ref([])
const search = ref({ elder: '', room: '', status: '' })
const pagination = ref({ page: 1, pageSize: 5, total: 0 })

const getCheckins = async () => {
  try {
    const params = {
      ...search.value,
      page: pagination.value.page,
      page_size: pagination.value.pageSize
    }
    const res = await request.get('/checkins/admin/', { params })
    console.log("✅ 后端返回的数据：", res.data)
    const results = res.data.results || []
    checkins.value = results.map(item => ({
      ...item,
      start_date: new Date(item.start_date).toLocaleDateString(),
      duration_years: item.duration_years || '未知',
      status: item.status === 'active' ? '在住' : '已退房'
    }))
    pagination.value.total = res.data.count || results.length
  } catch (err) {
    ElMessage.error('加载入住记录失败')
  }
}

const checkout = async (id) => {
  try {
    await ElMessageBox.confirm('确认要退房吗？', '提示', { type: 'warning' })
    await request.post(`/checkout/${id}/`)
    ElMessage.success('退房成功')
    getCheckins()
  } catch (err) {
    ElMessage.error('退房失败')
  }
}

const handlePageChange = (val) => {
  pagination.value.page = val
  getCheckins()
}

const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  getCheckins()
}

getCheckins()
</script>
