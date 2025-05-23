<template>
  <div class="ingredient-container">
    <van-nav-bar title="成分查询" />
    
    <div class="search-box">
      <van-search
        v-model="searchValue"
        placeholder="搜索成分名称"
        shape="round"
        show-action
        @search="onSearch"
        @cancel="onCancelSearch"
      >
        <template #action>
          <div @click="onSearch">搜索</div>
        </template>
      </van-search>
    </div>
    
    <div class="filter-box" v-if="!isSearching">
      <van-dropdown-menu>
        <van-dropdown-item v-model="riskLevel" :options="riskLevelOptions" />
        <van-dropdown-item v-model="suitableSkin" :options="skinTypeOptions" />
      </van-dropdown-menu>
    </div>
    
    <div class="content">
      <van-empty v-if="!loading && ingredients.length === 0" description="暂无数据" />
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-cell
            v-for="item in ingredients"
            :key="item.id"
            :title="item.name"
            :label="item.effect || '暂无描述'"
            is-link
            @click="goToDetail(item.id)"
          >
            <template #right-icon>
              <van-tag :type="getRiskTagType(item.riskLevel)">{{ getRiskText(item.riskLevel) }}</van-tag>
            </template>
          </van-cell>
        </van-list>
      </van-pull-refresh>
    </div>
    
    <!-- 底部导航栏 -->
    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import TabBar from '@/components/TabBar.vue'
import { getIngredientList, searchIngredient } from '@/api/ingredient'

const router = useRouter()
const searchValue = ref('')
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const ingredients = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isSearching = ref(false)

// 筛选条件
const riskLevel = ref(-1)
const suitableSkin = ref('')
const riskLevelOptions = [
  { text: '全部风险等级', value: -1 },
  { text: '安全', value: 0 },
  { text: '低风险', value: 1 },
  { text: '中风险', value: 2 },
  { text: '高风险', value: 3 }
]
const skinTypeOptions = [
  { text: '全部肤质', value: '' },
  { text: '干性', value: '干性' },
  { text: '油性', value: '油性' },
  { text: '中性', value: '中性' },
  { text: '混合性', value: '混合性' },
  { text: '敏感', value: '敏感' }
]

// 监听筛选条件变化
watch([riskLevel, suitableSkin], () => {
  if (!isSearching.value) {
    resetList()
    loadIngredients()
  }
})

// 获取风险等级对应的标签类型
const getRiskTagType = (level) => {
  switch (level) {
    case 0: return 'success'
    case 1: return 'warning'
    case 2: return 'danger'
    case 3: return 'danger'
    default: return 'default'
  }
}

// 获取风险等级对应的文本
const getRiskText = (level) => {
  switch (level) {
    case 0: return '安全'
    case 1: return '低风险'
    case 2: return '中风险'
    case 3: return '高风险'
    default: return '未知'
  }
}

// 搜索处理
const onSearch = async () => {
  if (!searchValue.value.trim()) {
    showToast('请输入搜索关键词')
    return
  }

  isSearching.value = true
  resetList()

  try {
    showLoadingToast({
      message: '搜索中...',
      forbidClick: true,
      duration: 0
    })

    const res = await searchIngredient(searchValue.value.trim())
    closeToast()

    if (res.success) {
      ingredients.value = res.data || []
      finished.value = true // 搜索结果一次性返回，不需要分页
    } else {
      showToast(res.message || '搜索失败')
    }
  } catch (error) {
    console.error('搜索失败:', error)
    showToast('搜索失败，请稍后重试')
  } finally {
    loading.value = false
    closeToast()
  }
}

// 取消搜索
const onCancelSearch = () => {
  searchValue.value = ''
  isSearching.value = false
  resetList()
  loadIngredients()
}

// 重置列表
const resetList = () => {
  ingredients.value = []
  currentPage.value = 1
  finished.value = false
  loading.value = false
}

// 加载成分列表
const loadIngredients = async () => {
  if (loading.value) return

  loading.value = true

  try {
    const riskLevelParam = riskLevel.value >= 0 ? riskLevel.value : null
    const skinParam = suitableSkin.value || null

    const res = await getIngredientList(
      currentPage.value,
      pageSize.value,
      searchValue.value.trim(),
      riskLevelParam,
      skinParam
    )

    if (res.success) {
      const newItems = res.data.list || []
      ingredients.value = [...ingredients.value, ...newItems]
      total.value = res.data.total || 0

      // 判断是否已加载全部数据
      finished.value = ingredients.value.length >= total.value
      currentPage.value++
    } else {
      showToast(res.message || '获取成分列表失败')
      finished.value = true
    }
  } catch (error) {
    console.error('获取成分列表失败:', error)
    showToast('获取数据失败，请稍后重试')
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 加载更多
const onLoad = () => {
  if (isSearching.value) {
    loading.value = false
    return
  }
  loadIngredients()
}

// 下拉刷新
const onRefresh = () => {
  resetList()
  loadIngredients()
}

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/ingredient/detail/${id}`)
}

// 组件挂载时加载数据
onMounted(() => {
  loadIngredients()
})
</script>

<style scoped>
.ingredient-container {
  min-height: 100vh;
  padding-bottom: 50px;
  background-color: #f7f8fa;
}

.search-box {
  position: sticky;
  top: 0;
  z-index: 100;
}

.filter-box {
  position: sticky;
  top: 54px;
  z-index: 99;
}

.content {
  padding: 8px;
}
</style> 