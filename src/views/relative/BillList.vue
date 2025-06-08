<template>
  <div class="bill-list">
    <h2>我的账单记录</h2>

    <el-table :data="bills" style="width: 100%">
      <el-table-column label="老人姓名">
        <template #default="{ row }">
          {{ row.elder_name || (row.elder && row.elder.full_name) || '未知' }}
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型">
        <template #default="{ row }">
          <el-tag :type="row.type === 'initial' ? 'success' : 'info'">
            {{ row.type === 'initial' ? '首次入住' : '续费' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="years" label="年限" />
      <el-table-column prop="stay_fee" label="住宿费" />
      <el-table-column prop="meal_fee" label="餐饮费" />
      <el-table-column prop="total_fee" label="总费用" />
      <el-table-column prop="created_at" label="支付时间" />
    </el-table>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import dayjs from 'dayjs'


const bills = ref([])

onMounted(async () => {
  try {
    const res = await request.get('/bills/')
    bills.value = res.data.map(bill => ({
      ...bill,
      created_at: dayjs(bill.created_at).format('YYYY-MM-DD HH:mm:ss')
    }))
  } catch (error) {
    console.error('获取账单失败:', error)
  }
})
</script>

<style scoped>
.bill-list {
  padding: 20px;
}
</style>
