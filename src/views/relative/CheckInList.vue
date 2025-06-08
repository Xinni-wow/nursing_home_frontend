<template>
  <div class="checkin-list">
    <h2>入住记录</h2>
    <el-table :data="checkins" style="width: 100%">
      <el-table-column prop="elder_name" label="老人姓名" />
        <el-table-column prop="room_number" label="房间号" />
        <el-table-column prop="start_date" label="入住日期" />
        <el-table-column prop="duration_years" label="入住年限" />
        <el-table-column label="预计退房">
          <template #default="{ row }">
            {{ dayjs(row.start_date).add(row.duration_years, 'year').format('YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '在住' : '已退房' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'active'"
              type="danger"
              size="small"
              @click="checkout(row.id)"
            >
              退房
            </el-button>
          </template>
        </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCheckinList, checkoutElder } from '@/api/checkin'
import dayjs from 'dayjs'

const checkins = ref([])

const loadData = async () => {
  const res = await getCheckinList()
  checkins.value = res.data
}

const checkout = async (id) => {
  const confirm = window.confirm('确认退房？')
  if (!confirm) return
  await checkoutElder(id)
  alert('退房成功')
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.checkin-list {
  padding: 30px;
}
</style>
