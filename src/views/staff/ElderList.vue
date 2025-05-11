<template>
    <div>
        <h2>老人信息管理</h2>

        <!-- 搜索 -->
        <div style="margin-bottom: 16px;">
            <el-input v-model="searchName" placeholder="请输入老人姓名" clearable style="width: 240px"
                @keyup.enter="handleSearch" />
            <el-button type="primary" @click="handleSearch" style="margin-left: 8px;">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
        </div>

        <!-- 老人信息列表 -->
        <el-table :data="elderList" border stripe style="width: 100%;">
            <el-table-column label="照片" width="100">
                <template #default="{ row }">
                    <el-image style="width: 60px; height: 60px; border-radius: 6px" :src="row.photo || defaultImage"
                        fit="cover" :preview-src-list="[row.photo || defaultImage]" />
                </template>
            </el-table-column>
            <el-table-column prop="id" label="ID" />
            <el-table-column prop="full_name" label="姓名" />
            <el-table-column label="家属">
                <template #default="{ row }">
                    <div>
                        <div>用户名：{{ row.user.username }}</div>
                        <div>姓名：{{ row.user.full_name }}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="relationship" label="与家属关系" />
            <el-table-column prop="gender" label="性别" />
            <el-table-column prop="birth_date" label="出生日期" />
            <el-table-column prop="id_number" label="身份证号" />
            <el-table-column label="操作" width="180">
                <template #default="{ row }">
                    <el-button size="small" type="primary" @click="editElder(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteElder(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 编辑弹窗 -->
        <el-dialog v-model="editDialogVisible" title="编辑老人信息" width="600px">
            <el-form ref="formRef" label-width="100px" enctype="multipart/form-data">

                <el-form-item label="照片">
                    <div class="photo-area">
                        <el-image style="width: 120px; height: 120px; border-radius: 8px;"
                            :src="editForm.photo || defaultImage" fit="cover" />
                        <el-button type="primary" @click="triggerFileSelect">更换照片</el-button>
                        <input type="file" ref="fileInput" style="display: none;" @change="handleFileChange"
                            accept="image/*" />
                    </div>
                </el-form-item>

                <el-form-item label="姓名">
                    <el-input v-model="editForm.full_name" />
                </el-form-item>
                <el-form-item label="性别">
                    <el-select v-model="editForm.gender">
                        <el-option label="男" value="男" />
                        <el-option label="女" value="女" />
                    </el-select>
                </el-form-item>
                <el-form-item label="出生日期">
                    <el-date-picker v-model="editForm.birth_date" type="date" value-format="YYYY-MM-DD" />
                </el-form-item>
                <el-form-item label="身份证号">
                    <el-input v-model="editForm.id_number" />
                </el-form-item>
                <el-form-item label="与绑定用户关系">
                    <el-select v-model="editForm.relationship">
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
                    <el-input type="textarea" v-model="editForm.health_status" />
                </el-form-item>
                <el-form-item label="住址">
                    <el-input v-model="editForm.address" />
                </el-form-item>
                <el-form-item label="电话">
                    <el-input v-model="editForm.phone" />
                </el-form-item>
                <el-form-item label="备注">
                    <el-input type="textarea" v-model="editForm.notes" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="submitForm">保存修改</el-button>
                    <el-button @click="editDialogVisible = false">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const elderList = ref([])
const searchName = ref('')
const defaultImage = '/elder_default.jpg'

const getElderList = () => {
    axios.get('/staff/elders')
        .then(res => {
            elderList.value = res.data
        })
}

const handleSearch = () => {
    if (!searchName.value) {
        getElderList()
        return
    }
    axios.get(`/staff/elders/search/?name=${searchName.value}`)
        .then(res => {
            elderList.value = res.data
        })
}

const resetSearch = () => {
    searchName.value = ''
    getElderList()
}

// 编辑弹窗相关
const editDialogVisible = ref(false)
const editForm = ref({})
const fileInput = ref(null)
const formRef = ref(null)

const triggerFileSelect = () => {
    fileInput.value.click()
}

const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 设置文件到表单中
    editForm.value.photo = file

    // 构造 FormData
    const formData = new FormData()
    for (const key in editForm.value) {
        if (editForm.value[key]) {
            formData.append(key, editForm.value[key])
        }
    }

    try {
        await axios.patch(`/staff/elders/${editForm.value.id}/update/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        ElMessage.success('照片更换成功')

        // 不关闭弹窗，而是重新拉取当前老人详情，刷新弹窗内容
        const res = await axios.get(`/staff/elders/${editForm.value.id}/`)
        editForm.value = { ...res.data } // 更新表单数据，包含新照片 URL
        getElderList()

    } catch (err) {
        ElMessage.error('照片上传失败')
        console.error(err)
    }
}

const previewPhoto = ref(null)

const editElder = async (elder) => {
    try {
        const res = await axios.get(`/staff/elders/${elder.id}/`)
        editForm.value = { ...res.data }
        previewPhoto.value = res.data.photo
        editDialogVisible.value = true
    } catch (err) {
        ElMessage.error('加载失败')
    }
}

const submitForm = async () => {
    const formData = new FormData()

    for (const key in editForm.value) {
        if (key === 'photo') continue
        formData.append(key, editForm.value[key])
    }

    try {
        await axios.patch(`/staff/elders/${editForm.value.id}/update/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        ElMessage.success('修改成功')
        editDialogVisible.value = false
        getElderList()
    } catch (err) {
        // 👇 处理并展示后端返回的详细错误
        if (err.response && err.response.data && err.response.data.data) {
            const backendErrors = err.response.data.data
            for (const field in backendErrors) {
                ElMessage.error(` ${backendErrors[field].join(', ')}`)
            }
        } else {
            ElMessage.error('修改失败')
        }
        console.error(err)
    }
}
const deleteElder = (elder) => {
    ElMessageBox.confirm(`确认删除老人 ${elder.full_name} 吗？`, '提示', {
        type: 'warning'
    }).then(() => {
        axios.delete(`/staff/elders/${elder.id}/delete/`)
            .then(() => {
                ElMessage.success('删除成功')
                getElderList()
            })
    }).catch(() => { })
}

getElderList()
</script>

<style scoped>
.photo-area {
    display: flex;
    align-items: center;
    gap: 10px;
}
</style>