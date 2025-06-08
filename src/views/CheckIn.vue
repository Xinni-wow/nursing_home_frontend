<template>
  <div class="checkin">
    <h2>入住办理</h2>

  <div>
    <label>选择老人：</label>
    <select v-model="form.elder">
      <option disabled value="">请选择老人</option>
      <option v-for="elder in elders" :value="elder.id" :key="elder.id">
        {{ elder.full_name }}
      </option>
    </select>
  </div>

    <div>
      <label>选择房间：</label>
        <select v-model="form.room">
          <option disabled value="">请选择房间</option>
          <option v-for="room in rooms" :value="room.id" :key="room.id">
            {{ room.room_number }}
          </option>
        </select>
    </div>

    <div>
      <label>选择入住日期：</label>
      <input type="date" v-model="form.start_date" />
    </div>

    <div>
      <label>选择入住年限：</label>
      <select v-model="form.duration_years" @change="getFee">
        <option :value="1">1 年</option>
        <option :value="2">2 年</option>
        <option :value="3">3 年</option>
      </select>
    </div>

    <div v-if="fee.total_fee">
      <p>住宿费：￥{{ fee.stay_fee }}</p>
      <p>餐饮费：￥{{ fee.meal_fee }}</p>
      <p>合计：￥{{ fee.total_fee }}</p>
    </div>

    <button @click="pay">立即支付并提交</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAvailableRooms, calculateFee, submitCheckIn, getMyElders } from '../api/checkin'
import dayjs from 'dayjs'

const elders = ref([])

onMounted(async () => {
  const roomRes = await getAvailableRooms()
  rooms.value = roomRes.data
  console.log("✅ 房间列表：", rooms.value)  // 添加这行调试

  const elderRes = await getMyElders()
  elders.value = elderRes.data
  console.log("✅ 老人列表：", elders.value)  // 添加这行调试
})

const rooms = ref([])
const form = ref({
  elder: '', 
  room: '',
  start_date: dayjs().format('YYYY-MM-DD'),
  duration_years: 1
})
const fee = ref({
  stay_fee: 0,
  meal_fee: 0,
  total_fee: 0
})

onMounted(async () => {
  const res = await getAvailableRooms()
  console.log("房间数据：", res.data)
  rooms.value = res.data
})

const getFee = async () => {
  const res = await calculateFee(form.value.duration_years)
  fee.value = res.data
}

// 支付并提交
const pay = async () => {
  try {
    const confirm = window.confirm(`即将支付 ￥${fee.value.total_fee}，是否继续？`)
    if (!confirm) return

    console.log("🚀 准备提交的表单：", form.value)

    alert("模拟支付宝支付成功")

    const res = await submitCheckIn(form.value)
    alert("入住办理成功！")
    console.log(res.data)
  } catch (error) {
    console.error("❌ 后端返回错误：", error.response?.data)
    alert("提交失败，请检查字段是否填写完整")
  }
}
</script>

<style scoped>
.checkin {
  padding: 30px;
}
</style>