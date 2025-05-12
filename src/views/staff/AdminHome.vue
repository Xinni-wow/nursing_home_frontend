<template>
    <div class="admin-layout">
        <el-container style="min-height: 100vh;">
            <!-- 左侧导航 -->
            <el-aside width="200px" class="sidebar">
                <div class="logo">养老院后台</div>
                <el-menu :default-active="$route.path" class="el-menu-vertical-demo" @select="handleSelect" router>
                    <el-menu-item index="/admin/users">
                        <el-icon>
                            <User />
                        </el-icon>
                        <span>用户管理</span>
                    </el-menu-item>
                    <el-menu-item index="/admin/elders">
                        <el-icon>
                            <Avatar />
                        </el-icon>
                        <span>老人管理</span>
                    </el-menu-item>
                    <el-menu-item index="/admin/health/upload">
                        <el-icon>
                            <Upload />
                        </el-icon>
                        <span>健康信息上传</span>
                    </el-menu-item>
                    <el-menu-item index="/admin/health/records">
                        <el-icon>
                            <Document />
                        </el-icon>
                        <span>健康记录查看</span>
                    </el-menu-item>
                </el-menu>
            </el-aside>

            <!-- 右侧容器 -->
            <el-container direction="vertical">
                <!-- 顶部栏 -->
                <el-header class="header">
                    <div class="admin-title">后台管理系统</div>
                    <div class="right">
                        <el-button type="text" @click="logout">退出登录</el-button>
                    </div>
                </el-header>

                <!-- 滚动主内容区 -->
                <el-main class="scrollable-main">
                    <div class="scaled-wrapper">
                        <router-view />
                    </div>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Avatar, Upload, Document } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const handleSelect = (index) => {
    router.push(index)
}

const logout = () => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
}
</script>

<style scoped>
.admin-layout .sidebar {
    background-color: #2d3a4b;
    color: #fff;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
}

.logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    font-weight: bold;
    font-size: 18px;
    color: #fff;
    background-color: #1f2d3d;
}

.el-menu {
    border-right: none;
    background-color: transparent;
    height: calc(100% - 60px);
}

.el-menu-item {
    color: #fff;
}

.el-menu-item.is-active {
    background-color: #1f2d3d !important;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f5f7fa;
    padding: 0 20px;
    height: 60px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    right: 0;
    left: 200px;
    z-index: 99;
}

.admin-title {
    font-size: 18px;
    font-weight: bold;
}

.scrollable-main {
    margin-top: 60px;
    margin-left: 200px;
    padding: 20px;
    overflow-y: auto;
    height: calc(100vh - 60px);
    background-color: #f9f9f9;
}

.scaled-wrapper {
    transform: scale(0.8);
    transform-origin: top left;
    width: 125%;
    min-height: 100%;
}
</style>