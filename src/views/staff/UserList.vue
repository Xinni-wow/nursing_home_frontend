<template>
    <div class="user-list">
        <h2 style="margin-bottom: 20px">用户管理</h2>

        <!-- 搜索栏 -->
        <el-form :inline="true" @submit.prevent>
            <el-form :inline="true" @submit.prevent>

                <el-input v-model="usernameKeyword" placeholder="输入用户名" clearable />
                <el-input v-model="nameKeyword" placeholder="输入真实姓名" clearable />
                <el-input v-model="elderKeyword" placeholder="输入老人姓名" clearable />
                <el-button type="primary" @click="unifiedSearch">搜索</el-button>
                <el-button @click="fetchUsers">重置</el-button>
            </el-form>
        </el-form>

        <!-- 表格展示 -->
        <el-table :data="paginatedUsers" v-loading="loading" style="margin-top: 20px" stripe border>
            <el-table-column prop="username" label="用户名" width="150" />
            <el-table-column prop="full_name" label="真实姓名" width="150" />
            <el-table-column prop="phone" label="手机号" width="140" />
            <el-table-column prop="email" label="邮箱" width="200" />
            <el-table-column prop="address" label="住址" />
            <el-table-column label="绑定老人">
                <template #default="scope">
                    <div v-if="scope.row.elders && scope.row.elders.length">
                        <div v-for="(elder, idx) in scope.row.elders" :key="idx">
                            (老人id:{{ elder.id }}){{ elder.full_name }}({{ elder.relationship }})
                        </div>
                    </div>
                    <div v-else>暂无</div>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="160">
                <template #default="scope">
                    <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页控件 -->
        <el-pagination style="margin-top: 20px; text-align: center" background layout="prev, pager, next"
            :page-size="pageSize" :total="users.length" @current-change="handlePageChange"
            :current-page="currentPage" />

        <el-dialog v-model="editDialogVisible" title="编辑用户信息" width="500px" append-to-body="true" top='25vh'>
            <el-form :model="editForm" label-width="100px" size="small">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled />
                </el-form-item>
                <el-form-item label="真实姓名">
                    <el-input v-model="editForm.full_name" />
                </el-form-item>
                <el-form-item label="手机号">
                    <el-input v-model="editForm.phone" />
                </el-form-item>
                <el-form-item label="住址">
                    <el-input v-model="editForm.address" />
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input v-model="editForm.email" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitEdit">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const users = ref([])
const loading = ref(false)

const usernameKeyword = ref('')
const nameKeyword = ref('')

const fetchUsers = async () => {
    loading.value = true
    try {
        const res = await axios.get('/staff/relatives/')
        users.value = res.data
        currentPage.value = 1

        // 清空搜索输入框
        usernameKeyword.value = ''
        nameKeyword.value = ''
        elderKeyword.value = ''
    } catch (err) {
        ElMessage.error('获取用户列表失败')
    } finally {
        loading.value = false
    }
}

const elderKeyword = ref('')
const editDialogVisible = ref(false)
const editForm = ref({})

const handleEdit = (user) => {
    editForm.value = { ...user } // 复制用户数据
    editDialogVisible.value = true
}

const submitEdit = async () => {
    try {
        const res = await axios.patch(`/staff/relative/${editForm.value.id}/update/`, editForm.value)
        ElMessage.success('修改成功')
        editDialogVisible.value = false
        fetchUsers() // 重新拉取用户列表
    } catch (err) {
        ElMessage.error('修改失败')
    }
}

const handleDelete = async (id) => {
    try {
        await ElMessageBox.confirm(
            '确定要删除这个用户吗？此操作不可撤销！',
            '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
        const res = await axios.delete(`/staff/relative/${id}/delete/`)
        if (res.data.code >= 400) {
            throw new Error(res.data.data.error || res.data.message)
        }
        ElMessage.success('删除成功')
        fetchUsers()
    } catch (err) {
        if (err === 'cancel') return
        const errorMessage = err.response?.data?.data?.error
            || err.response?.data?.message
            || err.message
        ElMessage.error(`删除失败：${errorMessage}`)
        console.error('删除失败详情:', err)
    }
}

const unifiedSearch = async () => {
    loading.value = true
    try {
        const params = {}

        if (usernameKeyword.value.trim()) {
            params.username = usernameKeyword.value.trim()
        }

        if (nameKeyword.value.trim()) {
            params.full_name = nameKeyword.value.trim()
        }

        if (elderKeyword.value.trim()) {
            params.elder_name = elderKeyword.value.trim()
        }

        let url = '/staff/relatives/'

        // 有搜索条件，使用搜索接口
        if (Object.keys(params).length > 0) {
            url = '/staff/relatives/search/'
        }

        const res = await axios.get(url, { params })
        users.value = res.data
        currentPage.value = 1
    } catch (err) {
        ElMessage.error('搜索失败')
    } finally {
        loading.value = false
    }
}

// 分页功能
const currentPage = ref(1)
const pageSize = ref(5)

const handlePageChange = (page) => {
    currentPage.value = page
}

const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return users.value.slice(start, end)
})

onMounted(() => {
    fetchUsers()
})
</script>

<style scoped>
.user-list {
    padding: 20px;
}

.el-input {
    width: 150px;
    margin-right: 10px;
}
</style>
