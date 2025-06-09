<template>
  <div class="max-w-7xl mx-auto p-4">
    <el-card class="mb-6">
      <div class="flex items-center gap-4 flex-wrap">
        <span class="font-medium text-gray-700">选择日期：</span>
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
          @change="fetchMenu"
          clearable
        />
        <el-button type="primary" @click="resetDate">查看未来两周</el-button>
      </div>
    </el-card>

    <div v-if="groupedByDate.length" class="cards-container">
      <el-card
        v-for="day in groupedByDate"
        :key="day.date"
        shadow="hover"
        class="day-card"
      >
        <h3 class="date-title">{{ day.date }}</h3>
        <div class="meal-row" v-for="meal of mealTypes" :key="meal.type">
          <div class="meal-label">{{ meal.label }}：</div>
          <div class="meal-content" v-if="day[meal.type]">{{ day[meal.type] }}</div>
          <div class="meal-content empty" v-else>暂无</div>
        </div>
      </el-card>
    </div>

    <el-empty v-else description="暂无菜单信息" class="mt-20" image-size="140" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

// 当前选中的日期
const selectedDate = ref(null)
// 菜单列表
const menuList = ref([])

// 用于展示的三餐类型
const mealTypes = [
  { type: 'breakfast', label: '早餐' },
  { type: 'lunch', label: '午餐' },
  { type: 'dinner', label: '晚餐' },
]

// 禁用今天之前或15天以后的日期
const disabledDate = (date) => {
  const today = new Date()
  const maxDate = new Date()
  maxDate.setDate(today.getDate() + 14)

  // 只保留年月日判断（清除时间部分）
  today.setHours(0, 0, 0, 0)
  maxDate.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  return date < today || date > maxDate
}

// 获取菜单数据
const fetchMenu = async () => {
  try {
    const params = selectedDate.value ? { date: selectedDate.value } : {}
    const res = await request.get('relative/diet/menu/', { params })
    menuList.value = res.data || []
  } catch (error) {
    ElMessage.error('获取菜单信息失败')
  }
}

// 重置选择日期（查看未来两周）
const resetDate = () => {
  selectedDate.value = null
  fetchMenu()
}

// 将菜单按日期分组并整理成对象数组
const groupedByDate = computed(() => {
  const map = {}
  for (const item of menuList.value) {
    if (!map[item.date]) {
      map[item.date] = { date: item.date, breakfast: '', lunch: '', dinner: '' }
    }
    if (item.meal_type && map[item.date][item.meal_type] !== undefined) {
      map[item.date][item.meal_type] += (map[item.date][item.meal_type] ? '\n' : '') + item.content
    }
  }
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
})

// 初始加载菜单数据
onMounted(fetchMenu)
</script>

<style scoped>
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
}

.day-card {
  width: 100%;
  border-radius: 8px;
  cursor: default;
  transition: box-shadow 0.3s ease;
  padding: 16px;
  box-sizing: border-box;
}

.day-card:hover {
  box-shadow: 0 8px 20px rgb(64 158 255 / 0.3);
}

.date-title {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 4px solid #409EFF;
}

.meal-row {
  display: flex;
  margin-bottom: 8px;
  align-items: flex-start;
}

.meal-label {
  width: 60px;
  font-weight: 600;
  color: #409EFF;
  flex-shrink: 0;
}

.meal-content {
  white-space: pre-wrap;
  flex-grow: 1;
  color: #333;
  line-height: 1.4;
}

.meal-content.empty {
  color: #999;
  font-style: italic;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .cards-container {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 480px) {
  .cards-container {
    grid-template-columns: 1fr;
  }
}
</style>
