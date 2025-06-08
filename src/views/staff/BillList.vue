<template>
  <div class="bill-list">
    <h2>所有账单</h2>

    <el-card class="mb-4">
      <div class="flex flex-wrap gap-4 items-center">
        <el-input v-model="search.elder" placeholder="输入老人姓名" clearable style="max-width: 200px" />
        <el-input v-model="search.room" placeholder="输入房间号" clearable style="max-width: 200px" />
        <el-select v-model="search.type" placeholder="账单类型" clearable style="max-width: 160px">
          <el-option label="初次入住" value="initial" />
          <el-option label="续费" value="renew" />
        </el-select>
        <el-button type="primary" @click="fetchBills">搜索</el-button>
        <el-button @click="exportCSV">导出CSV</el-button>
      </div>
    </el-card>

    <el-table v-loading="loading" :data="bills" style="width: 100%" border>
      <el-table-column prop="elder_name" label="老人姓名" />
      <el-table-column prop="room_number" label="房间号" />
      <el-table-column label="账单类型" :formatter="formatType" />
      <el-table-column prop="stay_fee" label="住宿费" :formatter="formatFee" />
      <el-table-column prop="meal_fee" label="餐饮费" :formatter="formatFee" />
      <el-table-column prop="total_fee" label="总费用" :formatter="formatFee" />
      <el-table-column prop="created_at" label="支付时间" :formatter="formatDate" />
    </el-table>
    <el-pagination
      class="mt-4"
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import request from '@/utils/request'

const bills = ref([])
const search = ref({ elder: '', room: '', type: '' })
const loading = ref(false)
const page = ref(1)
const pageSize = 5
const total = ref(0)

const fetchBills = async () => {
  loading.value = true
  const params = {
    elder: search.value.elder,
    room: search.value.room,
    type: search.value.type,
    page: page.value,
    page_size: pageSize
  }

  const res = await request.get('/bills/all/', { params })

  // 处理分页和非分页两种情况
  if (res.data.results) {
    bills.value = res.data.results
    total.value = res.data.count
  } else {
    bills.value = res.data
    total.value = res.data.length
  }

  loading.value = false
}

const handlePageChange = (val) => {
  page.value = val
  fetchBills()
}

// 修复格式化函数 - Element Plus formatter 参数顺序是 (row, column, cellValue, index)
const formatDate = (row, column, cellValue, index) => {
  const d = dayjs(cellValue)
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm') : '无效时间'
}

const formatFee = (row, column, cellValue, index) => {
  const num = parseFloat(cellValue)
  return isNaN(num) ? '￥0.00' : `￥${num.toFixed(2)}`
}

const formatType = (row, column, cellValue, index) => {
  return row.type === 'initial' ? '初次入住' : '续费'
}

const exportCSV = async () => {
  const raw = { ...search.value }
  const params = {}
  if (raw.elder) params.elder = raw.elder
  if (raw.room) params.room = raw.room
  if (raw.type) params.type = raw.type

  try {
    const res = await request.get('/bills/export/', {
      params,
      responseType: 'blob'
    })

    console.log('✅ 接口响应状态码:', res.status)
    console.log('✅ 响应类型:', res.data)
    console.log('✅ 响应 header:', res.headers)

    const reader = new FileReader()

    reader.onload = () => {
      console.log('✅ 文件读取成功')
      const csvText = reader.result
      console.log('✅ CSV 内容：', csvText)

      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvText], { type: 'text/csv;charset=utf-8;' })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `bills_export_${Date.now()}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    reader.onerror = (e) => {
      console.error('❌ 读取 blob 出错', e)
      alert('读取 CSV 文件失败')
    }

    reader.readAsText(res.data, 'utf-8')

  } catch (err) {
    console.error('❌ 导出失败', err)
    alert('导出失败，请检查接口或网络')
  }
}

onMounted(() => {
  fetchBills()
})
</script>

<style scoped>
.bill-list {
  padding: 24px;
  background-color: #f9f9f9;
  min-height: 100vh;
}
input, select, button {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
th {
  background-color: #f3f3f3;
}
* {
  font-size: 14px;
}
</style>
