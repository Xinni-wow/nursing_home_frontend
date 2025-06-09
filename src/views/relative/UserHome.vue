<template>
    <el-container style="height: 100vh; flex-direction: column;">
        <!-- 顶部导航栏 -->
        <el-header class="header">
            <div class="logo_title">
                <img src="/logo2.png" style="height: 40px; vertical-align: middle; margin-right: 10px;">
                蓝天养老院家属系统
            </div>
            <div class="header-right">
                欢迎你，{{ username }}
                <el-button type="danger" size="small" @click="logout">退出</el-button>
            </div>
        </el-header>

        <el-container style="flex: 1; overflow: hidden;">
            <!-- 左侧导航栏 -->
            <el-aside width="200px" class="sidebar">
                <el-menu :default-active="activeMenu" @select="handleMenuSelect" router>
                    <el-menu-item index="/user/profile">
                        <el-icon>
                            <User />
                        </el-icon>个人信息
                    </el-menu-item>
                    <el-menu-item index="/user/elders">
                        <el-icon>
                            <HomeFilled />
                        </el-icon>我家老人
                    </el-menu-item>
                    <el-menu-item index="/user/health">
                        <el-icon>
                            <TrendCharts />
                        </el-icon>健康状况
                    </el-menu-item>

                    <el-sub-menu index="/user/outinglist">
                        <template #title>
                            <el-icon>
                                <Calendar />
                            </el-icon>外出申请
                        </template>
                        <el-menu-item index="/user/outingform">
                            <el-icon>
                                <DocumentAdd />
                            </el-icon>填写申请
                        </el-menu-item>
                        <el-menu-item index="/user/outinglist">
                            <el-icon>
                                <Document />
                            </el-icon>申请记录
                        </el-menu-item>
                    </el-sub-menu>

                    <el-sub-menu index="/user/appointmentlist">
                        <template #title>
                            <el-icon>
                                <List />
                            </el-icon>预约来访
                        </template>
                        <el-menu-item index="/user/appointmentform">
                            <el-icon>
                                <DocumentAdd />
                            </el-icon>预约申请
                        </el-menu-item>
                        <el-menu-item index="/user/appointmentlist">
                            <el-icon>
                                <Document />
                            </el-icon>预约记录
                        </el-menu-item>
                    </el-sub-menu>

                    <el-menu-item index="/user/diet/list">
                        <el-icon>
                            <DishDot />
                        </el-icon>餐饮查看
                    </el-menu-item>
                    <el-sub-menu index="checkin-management">
                      <template #title>
                        <span>入住管理</span>
                      </template>
                      <el-menu-item index="/user/checkin">入住办理</el-menu-item>
                      <el-menu-item index="/user/renew">续费办理</el-menu-item>
                      <el-menu-item index="/user/checkins">入住记录</el-menu-item>
                      <el-menu-item index="/user/bills">我的账单</el-menu-item>
                    </el-sub-menu>

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
import { HomeFilled, User, DocumentAdd, List, Calendar, Document, DishDot, TrendCharts } from '@element-plus/icons-vue'

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

.logo_title {
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
    width: 120%;
    height: 100%;
}
</style>
