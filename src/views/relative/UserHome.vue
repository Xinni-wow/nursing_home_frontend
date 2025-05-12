<template>
    <el-container style="height: 100vh; flex-direction: column;">
        <!-- 顶部导航栏 -->
        <el-header class="header">
            <div class="logo">养老院陪伴系统</div>
            <div class="header-right">
                欢迎你，{{ username }}
                <el-button type="danger" size="small" @click="logout">退出</el-button>
            </div>
        </el-header>

        <el-container style="flex: 1; overflow: hidden;">
            <!-- 左侧导航栏 -->
            <el-aside width="200px" class="sidebar">
                <el-menu :default-active="activeMenu" @select="handleMenuSelect" router>
                    <el-menu-item index="/user/profile">个人信息</el-menu-item>
                    <el-menu-item index="/user/elders">我家老人</el-menu-item>
                    <el-menu-item index="/user/health">健康情况</el-menu-item>
                </el-menu>
            </el-aside>

            <!-- 主内容区域 -->
            <el-main class="main-content">
                <div class="content-wrapper">
                    <router-view />
                </div>
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 用户名从 Pinia 获取
const username = computed(() => userStore.userInfo.username || '用户')

// 当前激活菜单项
const activeMenu = computed(() => route.path)

// 登出逻辑
const logout = () => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
}

// 菜单跳转
const handleMenuSelect = (index) => {
    router.push(index)
}
</script>

<style scoped>
.header {
    background: #409eff;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
}

.logo {
    font-size: 20px;
    font-weight: bold;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.sidebar {
    background: #f5f5f5;
    height: 100%;
}

.main-content {
    padding: 0;
    background: #fff;
    overflow-y: auto;
    height: calc(100vh - 60px);
    /* header 高度 */
}

.content-wrapper {
    padding: 20px;
    transform: scale(0.8);
    transform-origin: top left;
    width: 125%;
    height: auto;
}
</style>