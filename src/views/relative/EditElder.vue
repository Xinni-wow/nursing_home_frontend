<template>
    <div class="container">
        <h2>老人详情</h2>
        <el-form :model="elderForm" label-width="100px" enctype="multipart/form-data">
            <el-form-item label="照片">
                <div class="photo-area">
                    <el-image style="width: 120px; height: 120px; border-radius: 8px;"
                        :src="elderForm.photo || defaultImage" fit="cover" />
                    <el-button type="primary" @click="triggerFileSelect">更换照片</el-button>
                    <input type="file" ref="fileInput" style="display: none;" @change="handleFileChange"
                        accept="image/*" />
                </div>
            </el-form-item>
            <el-form-item label="姓名">
                <el-input v-model="elderForm.full_name" />
            </el-form-item>
            <el-form-item label="性别">
                <el-select v-model="elderForm.gender">
                    <el-option label="男" value="男" />
                    <el-option label="女" value="女" />
                </el-select>
            </el-form-item>
            <el-form-item label="出生日期">
                <el-date-picker v-model="elderForm.birth_date" type="date" value-format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item label="身份证号">
                <el-input v-model="elderForm.id_number" />
            </el-form-item>
            <el-form-item label="关系">
                <el-select v-model="elderForm.relationship">
                    <el-option label="父女" value="父女" />
                    <el-option label="母女" value="母女" />
                    <el-option label="父子" value="父子" />
                    <el-option label="母子" value="母子" />
                    <el-option label="配偶" value="配偶" />
                    <el-option label="本人" value="本人" />
                    <el-option label="其他" value="其他" />
                </el-select>
            </el-form-item>
            <el-form-item label="健康状况">
                <el-input type="textarea" v-model="elderForm.health_status" />
            </el-form-item>
            <el-form-item label="住址">
                <el-input v-model="elderForm.address" />
            </el-form-item>
            <el-form-item label="电话">
                <el-input v-model="elderForm.phone" />
            </el-form-item>
            <el-form-item label="备注">
                <el-input type="textarea" v-model="elderForm.notes" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="submitForm">保存修改</el-button>
                <el-button @click="$router.back()">返回</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/request'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const elderForm = ref({
    full_name: '',
    gender: '',
    birth_date: '',
    id_number: '',
    relationship: '',
    health_status: '',
    notes: '',
    address: '',
    phone: '',
    photo: ''
})

const fetchElderDetail = async () => {
    try {
        const res = await axios.get(`/relative/elders/${route.params.id}/`)
        elderForm.value = res.data
    } catch (err) {
        ElMessage.error('获取老人信息失败')
    }
}

const fileInput = ref(null)
const defaultImage = '/elder_default.jpg'

const triggerFileSelect = () => {
    fileInput.value.click()
}

const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('photo', file)

    try {
        const res = await axios.patch(`/relative/elders/${route.params.id}/update/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        elderForm.value.photo = `${res.data.photo}?t=${new Date().getTime()}`
        ElMessage.success('照片更换成功')
        router.push('/user/elders')
    } catch (err) {
        ElMessage.error('照片上传失败')
    }
}
const submitForm = async () => {
    try {
        const formData = new FormData()

        for (const key in elderForm.value) {
            if (key === 'photo') continue  // 跳过照片
            formData.append(key, elderForm.value[key])
        }

        const res = await axios.patch(`/relative/elders/${route.params.id}/update/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        ElMessage.success('修改成功')
        router.back()
    } catch (err) {
        console.error(err)
        ElMessage.error('修改失败')
    }
}


onMounted(() => {
    fetchElderDetail()
})
</script>

<style scoped>
.container {
    max-width: 700px;
    margin: 0 auto;
    padding: 20px;
}

.avatar-uploader .avatar {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    display: block;
}

.avatar-uploader {
    cursor: pointer;
    border: 1px dashed #d9d9d9;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>