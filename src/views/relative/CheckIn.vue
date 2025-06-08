<template>
  <div class="checkin">
    <h2>入住办理</h2>

  <div class="form-group">
    <label>选择老人：</label>
    <select v-model="form.elder">
      <option disabled value="">请选择老人</option>
      <option v-for="elder in elders" :value="elder.id" :key="elder.id">
        {{ elder.full_name }}
      </option>
    </select>
  </div>

    <div class="form-group">
      <label>选择房间：</label>
        <select v-model="form.room">
          <option disabled value="">请选择房间</option>
          <option v-for="room in rooms" :value="room.id" :key="room.id">
            {{ room.room_number }}
          </option>
        </select>
    </div>

<div class="form-group">
<el-date-picker
  v-model="form.start_date"
  type="date"
  placeholder="选择入住日期"
  style="width: 100%"
></el-date-picker>
</div>

    <div class="form-group">
      <label>选择入住年限：</label>
      <select v-model="form.duration_years" @change="getFee">
        <option :value="1">1 年</option>
        <option :value="2">2 年</option>
        <option :value="3">3 年</option>
        <option :value="5">5 年</option>
        <option :value="10">10 年</option>
      </select>
    </div>

    <div v-if="fee.total_fee" class="form-group">
      <p>住宿费：￥{{ fee.stay_fee }}</p>
      <p>餐饮费：￥{{ fee.meal_fee }}</p>
      <p>合计：￥{{ fee.total_fee }}</p>
    </div>

    <button class="submit-btn" @click="pay">立即支付并提交</button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getAvailableRooms, calculateFee, submitCheckIn, getMyElders,getCheckinList } from '@/api/checkin'
import { generatePayUrl } from '@/views/Pay/pay'
import dayjs from 'dayjs'

const elders = ref([])
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
  const roomRes = await getAvailableRooms()
  rooms.value = roomRes.data

  const elderRes = await getMyElders()
  elders.value = elderRes.data
})

const getFee = async () => {
  const res = await calculateFee(form.value.duration_years)
  fee.value = res.data
}

watch(() => form.value.duration_years, () => {
  getFee()
}, { immediate: true })

// 支付并提交
const pay = async () => {
  console.log("✅ pay 函数被调用，form 内容如下：", form.value)

  if (!form.value.elder || !form.value.room) {
    alert("请先选择老人和房间！");
    return;
  }

  const elderId = form.value.elder
  const res = await getCheckinList()
  const existing = res.data.find(item => item.elder === elderId && item.status === 'active')
  if (existing) {
    alert('该老人已办理入住，无法重复办理！')
    return
  }

  const payload = {
    elder: form.value.elder,
    room: form.value.room,
    duration_years: form.value.duration_years,
    start_date: form.value.start_date,
    type: 'checkin'
  }

  try {
    const confirm = window.confirm(`即将支付 ￥${fee.value.total_fee}，是否继续？`)
    if (!confirm) return

    const payRes = await generatePayUrl(payload)
    window.location.href = payRes.data.pay_url
  } catch (error) {
    console.error("❌ 生成支付链接失败：", error.response?.data)
    alert("提交失败，请检查字段是否填写完整")
  }
}
</script>

<style scoped>
.checkin {
  padding: 30px;
  max-width: 500px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 16px;
}
label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
  color: #555;
}
select, input, .el-date-picker {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
button {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
button:hover {
  background-color: #66b1ff;
}
p {
  margin: 4px 0;
  color: #444;
}
</style>
