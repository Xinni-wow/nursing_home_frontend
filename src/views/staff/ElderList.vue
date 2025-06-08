<template>
    <div style="padding: 20px; padding-top: 0%;">
        <h2>老人信息管理</h2>

        <!-- 搜索 -->
        <div style="margin-bottom: 16px;">
            <el-input v-model="searchName" placeholder="请输入老人姓名" clearable style="width: 240px"
                @keyup.enter="handleSearch" />
            <el-button type="primary" @click="handleSearch" style="margin-left: 8px;">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
        </div>

        <!-- 老人信息列表 -->
        <el-table :data="paginatedElderList" border stripe style="width: 100%;">
            <el-table-column label="照片" width="100">
                <template #default="{ row }">
                    <el-image style="width: 60px; height: 60px; border-radius: 6px" :src="row.photo || defaultImage"
                        fit="cover" :preview-src-list="[row.photo || defaultImage]" preview-teleported="true" />
                </template>
            </el-table-column>
            <el-table-column prop="id" label="ID" width="60px" />
            <el-table-column prop="full_name" label="姓名" width="80px" />
            <el-table-column prop="gender" label="性别" width="60px" />
            <el-table-column label="家属" width="130px">
                <template #default="{ row }">
                    <div>
                        <div>用户名：{{ row.user.username }}</div>
                        <div>姓名：{{ row.user.full_name }}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="relationship" label="与家属关系" />
            <el-table-column label="年龄" width="70px">
                <template #default="{ row }">
                    {{ calculateAge(row.birth_date) }} 岁
                </template>
            </el-table-column>
            <el-table-column prop="id_number" label="身份证号" width="180px" />
            <el-table-column prop="health_status" label="健康状况" />
            <el-table-column label="备注">
                <template #default="{ row }">
                    {{ row.notes ? (row.notes.length > 20 ? row.notes.slice(0, 20) + '...' : row.notes) : '-' }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
                <template #default="{ row }">
                    <el-button type="primary" @click="editElder(row)">编辑</el-button>
                    <el-button type="danger" @click="deleteElder(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页控件 -->
        <el-pagination style="margin-top: 20px; text-align: center" background layout="prev, pager, next"
            :page-size="pageSize" :total="elderList.length" @current-change="handlePageChange"
            :current-page="currentPage" />

        <!-- 编辑弹窗 -->
        <el-dialog v-model="editDialogVisible" title="编辑老人信息" width="600px" append-to-body="true" top='5vh'>
            <el-form ref="formRef" label-width="100px" size="small">
                <el-form-item label="照片">
                    <div class="photo-area">
                        <el-image style="width: 80px; height: auto; border-radius: 8px;"
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
import { ref, computed } from 'vue'
import axios from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const elderList = ref([])
const searchName = ref('')
const defaultImage = '/elder_default.jpg'

const getElderList = () => {
    axios.get('/staff/elders')
        .then(res => {
            elderList.value = res.data
            currentPage.value = 1 // 搜索后重置页码
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
            currentPage.value = 1
        })
}
const calculateAge = (birthDate) => {
    if (!birthDate) return '-'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return age
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

    editForm.value.photo = file

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

        const res = await axios.get(`/staff/elders/${editForm.value.id}/`)
        editForm.value = { ...res.data }
        getElderList()

    } catch (err) {
        ElMessage.error('照片上传失败')
        console.error(err)
    }
}

const editElder = async (elder) => {
    try {
        const res = await axios.get(`/staff/elders/${elder.id}/`)
        editForm.value = { ...res.data }
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
        if (err.response && err.response.data && err.response.data.data) {
            const backendErrors = err.response.data.data
            for (const field in backendErrors) {
                ElMessage.error(`${backendErrors[field].join(', ')}`)
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
    }).then(async () => {
        try {
            await axios.delete(`/staff/elders/${elder.id}/delete/`)
            ElMessage.success('删除成功')
            getElderList()
        } catch (err) {
            // 获取并显示后端返回的错误信息
            const errorMsg = err?.response?.data?.data?.error
                || '删除失败，请稍后再试'
            ElMessage.error(errorMsg)
            console.error(err)
        }
    }).catch(() => {
        // 取消删除
    })
}

// 分页功能
const currentPage = ref(1)
const pageSize = ref(5)

const handlePageChange = (page) => {
    currentPage.value = page
}

const paginatedElderList = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return elderList.value.slice(start, end)
})

getElderList()
</script>

<style scoped>
.photo-area {
    display: flex;
    align-items: center;
    gap: 10px;
}

::v-deep(.el-input__inner) {
    font-size: 16px;
}

::v-deep(.el-table) {
    font-size: 15px;
}
</style>
