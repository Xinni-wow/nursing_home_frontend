<!-- VisitQRCode.vue -->
<template>
  <div style="text-align: center">
    <el-button type="primary" @click="fetchQRCode" :loading="loading">
      获取二维码
    </el-button>

    <div v-if="qrcodeUrl" style="margin-top: 20px;">
      <img :src="qrcodeUrl" alt="二维码" style="max-width: 100%; border: 1px solid #ccc;" />
    </div>

    <div v-else-if="!loading" style="margin-top: 10px;">
      <p>请点击上方按钮生成二维码</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'VisitQRCode',
  props: {
    visitId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      qrcodeUrl: null,
      loading: false
    }
  },
  methods: {
    async fetchQRCode() {
      this.loading = true
      try {
        const response = await axios.get(`/api/visit/${this.visitId}/qrcode/`, {
          responseType: 'blob',
          withCredentials: true // 如果你启用了登录认证（cookie）
        })
        this.qrcodeUrl = URL.createObjectURL(response.data)
      } catch (error) {
        this.$message.error('二维码加载失败')
        console.error(error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
