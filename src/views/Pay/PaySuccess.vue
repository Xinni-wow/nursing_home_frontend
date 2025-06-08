<template>
  <div>
    <h2>支付成功</h2>
    <p v-if="message">{{ message }}</p>
    <p v-if="countdown > 0">系统将在 {{ countdown }} 秒后自动跳转...</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { submitCheckIn, renewCheckIn } from '@/api/checkin'

const route = useRoute()
const router = useRouter()
const message = ref('正在写入订单信息...')
const countdown = ref(3)


onMounted(async () => {
  const elder = route.query.elder
  const room = route.query.room
  const duration_years = route.query.duration_years
  const type = route.query.type
  const start_date = route.query.start_date

  console.log('提交入住信息参数：', { elder, room, duration_years, start_date, type })
  console.log('支付成功返回的 type 是：', route.query.type)

  try {
    if (type === 'checkin') {
      await submitCheckIn({ elder, room, duration_years, start_date })
      message.value = '入住成功！'
      setTimeout(() => {
        router.push('/user/checkins')
      }, 3000)
    } else if (type === 'renew') {
      await renewCheckIn({ elder, duration_years })
      message.value = '续费成功！'
      setTimeout(() => {
        router.push('/user/bills')
      }, 3000)
    } else {
      message.value = '未知操作类型，无法处理。'
    }

    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)

  } catch (err) {
    console.error(err)
    message.value = '写入失败，请联系管理员。'
  }
})
</script>
