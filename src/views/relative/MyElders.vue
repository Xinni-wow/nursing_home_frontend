<template>
    <div class="container">
        <div class="header">
            <h2>我家老人</h2>
            <el-button type="primary" @click="$router.push('/user/add-elder')" style="font-size: 16px;">添加老人</el-button>
        </div>

        <el-row :gutter="20">
            <el-col :span="8" v-for="elder in elders" :key="elder.id">
                <el-card shadow="hover">
                    <div class="card-content">
                        <el-image :src="elder.photo || defaultImage" fit="cover" style="width: 100%; height: 200px;"
                            :preview-src-list="[elder.photo || defaultImage]" />
                        <h3 style="margin-top: 10px;">{{ elder.name }}</h3>
                        <p>姓名:{{ elder.full_name }}</p>
                        <p>关系:{{ elder.relationship }}</p>
                        <p>性别：{{ elder.gender }}</p>
                        <p>年龄：{{ getAge(elder.birth_date) }}</p>
                        <p>健康状况：{{ elder.health_status }}</p>
                        <p>联系方式：{{ elder.phone || '暂无' }}</p>
                        <p>备注：{{ elder.note }}</p>
                        <el-button type="text" @click="viewElder(elder.id)">查看/编辑详情</el-button>
                        <el-button type="text" style="color: red" @click="confirmDelete(elder.id)">删除</el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/request'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const elders = ref([])
const router = useRouter()
const defaultImage = '/elder_default.jpg'

const fetchElders = async () => {
    try {
        const res = await axios.get('/relative/elders/')
        elders.value = res.data
    } catch (e) {
        console.error('获取老人信息失败', e)
        ElMessage.error('获取老人信息失败')
    }
}

const getAge = (birthDate) => {
    const birth = new Date(birthDate)
    const now = new Date()
    return now.getFullYear() - birth.getFullYear()
}

const viewElder = (id) => {
    router.push(`/user/elders/${id}`)
}
const confirmDelete = (id) => {
    ElMessageBox.confirm('确定要删除这位老人吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
    }).then(async () => {
        try {
            await axios.delete(`/relative/elders/${id}/delete/`)
            ElMessage.success('删除成功')
            fetchElders() // 刷新列表
        } catch (err) {
            // 显示后端返回的错误信息
            const errorMsg = err?.response?.data?.data?.error
                || '删除失败，请稍后再试'
            ElMessage.error(errorMsg)
            console.error(err)
        }
    }).catch(() => {
        // 取消删除
    })
}

onMounted(() => {
    fetchElders()
})
</script>
<style scoped>
.container {
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.card-content {
    text-align: center;
}
</style>