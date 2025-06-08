<template>
  <div class="renew">
    <h2>续费办理</h2>

    <div class="form-group">
      <label>选择在住老人：</label>
      <select v-model="selectedCheckinId">
        <option disabled value="">请选择</option>
        <option v-for="record in activeCheckins" :key="record.id" :value="record.id">
          {{ record.elder_name }}（房间 {{ record.room_number }}）
        </option>
      </select>
    </div>

    <div class="form-group">
      <label>选择续住年限：</label>
      <select v-model="durationYears" @change="getFee">
        <option :value="1">1 年</option>
        <option :value="2">2 年</option>
        <option :value="3">3 年</option>
        <option :value="5">5 年</option>
        <option :value="10">10 年</option>
      </select>
    </div>

    <div class="form-group" v-if="fee.total_fee">
      <p>住宿费：￥{{ fee.stay_fee }}</p>
      <p>餐饮费：￥{{ fee.meal_fee }}</p>
      <p>合计：￥{{ fee.total_fee }}</p>
    </div>

    <div class="form-group" v-if="selectedRecord">
      <p>当前预计退房时间：{{ estimatedEndDate }}</p>
    </div>
    <button @click="pay">立即支付并续费</button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { getCheckinList, calculateFee, renewCheckIn } from '@/api/checkin'
import { generatePayUrl } from '@/views/Pay/pay'
import request from '@/utils/request'
import dayjs from 'dayjs'

const activeCheckins = ref([])
const selectedCheckinId = ref('')
const durationYears = ref(1)
const fee = ref({ stay_fee: 0, meal_fee: 0, total_fee: 0 })

onMounted(async () => {
  const res = await getCheckinList()
  activeCheckins.value = res.data.filter(item => item.status === 'active')
})

watch([selectedCheckinId, durationYears], async () => {
  if (selectedCheckinId.value) {
    getFee()
  }
}, { immediate: true })

const getFee = async () => {
  const res = await calculateFee(durationYears.value)
  fee.value = res.data
}

const pay = async () => {
  const record = activeCheckins.value.find(r => r.id === selectedCheckinId.value)
  if (!record) {
    alert("请选择一个在住老人")
    return
  }

  const confirmPay = window.confirm(`确认支付 ￥${fee.value.total_fee} 进行续费吗？`)
  if (!confirmPay) return

  const formData = {
    elder: record.elder,
    room: record.room,
    start_date: dayjs().format('YYYY-MM-DD'),
    duration_years: durationYears.value
  }

  try {
    const response = await generatePayUrl({ ...formData, type: 'renew' })
    if (response && response.data?.pay_url) {
      alert("跳转支付页")
      window.location.href = response.data.pay_url
    } else {
      alert("生成支付链接失败")
    }
  } catch (err) {
    console.error(err)
    alert("续费失败，请稍后重试")
  }
}

const selectedRecord = computed(() => {
  return activeCheckins.value.find(r => r.id === selectedCheckinId.value)
})

const estimatedEndDate = computed(() => {
  if (!selectedRecord.value) return ''
  return dayjs(selectedRecord.value.start_date).add(selectedRecord.value.duration_years, 'year').format('YYYY-MM-DD')
})
</script>

<style scoped>
.renew {
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
select, input {
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
