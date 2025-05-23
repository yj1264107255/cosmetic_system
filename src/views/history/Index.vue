<template>
  <div class="history-container">
    <van-nav-bar
      title="浏览历史"
      left-arrow
      @click-left="onClickLeft"
      right-text="清空"
      @click-right="onClickClear"
    />
    
    <div class="content">
      <!-- 未登录时显示提示 -->
      <div v-if="!isLoggedIn" class="not-logged-in">
        <van-empty description="登录后才能查看浏览历史">
          <template #bottom>
            <van-button round type="primary" size="small" @click="goToLogin">
              去登录
            </van-button>
          </template>
        </van-empty>
      </div>
      
      <!-- 已登录时显示历史列表 -->
      <van-tabs v-else v-model:active="activeTab" sticky>
        <van-tab title="全部">
          <van-empty v-if="!loading && allHistory.length === 0" description="暂无浏览记录" />
          <van-list
            v-else
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div class="history-list">
              <div
                v-for="item in allHistory"
                :key="item.id"
                class="history-item"
                @click="goToDetail(item)"
              >
                <van-image
                  width="60"
                  height="60"
                  fit="cover"
                  :src="item.image || 'https://img01.yzcdn.cn/vant/cat.jpeg'"
                />
                <div class="history-info">
                  <div class="history-name">{{ item.keyword }}</div>
                  <div class="history-type">{{ getTypeName(item.searchType) }}</div>
                  <div class="history-time">{{ formatDate(item.createdAt) }}</div>
                </div>
                <van-icon name="arrow" />
              </div>
            </div>
          </van-list>
        </van-tab>
        <van-tab title="成分">
          <van-empty v-if="!ingredientLoading && ingredientHistory.length === 0" description="暂无成分浏览记录" />
          <van-list
            v-else
            v-model:loading="ingredientLoading"
            :finished="ingredientFinished"
            finished-text="没有更多了"
            @load="onLoadIngredient"
          >
            <div class="history-list">
              <div
                v-for="item in ingredientHistory"
                :key="item.id"
                class="history-item"
                @click="goToDetail(item)"
              >
                <van-image
                  width="60"
                  height="60"
                  fit="cover"
                  :src="item.image || 'https://img01.yzcdn.cn/vant/cat.jpeg'"
                />
                <div class="history-info">
                  <div class="history-name">{{ item.keyword }}</div>
                  <div class="history-time">{{ formatDate(item.createdAt) }}</div>
                </div>
                <van-icon name="arrow" />
              </div>
            </div>
          </van-list>
        </van-tab>
        <van-tab title="产品">
          <van-empty v-if="!productLoading && productHistory.length === 0" description="暂无产品浏览记录" />
          <van-list
            v-else
            v-model:loading="productLoading"
            :finished="productFinished"
            finished-text="没有更多了"
            @load="onLoadProduct"
          >
            <div class="history-list">
              <div
                v-for="item in productHistory"
                :key="item.id"
                class="history-item"
                @click="goToDetail(item)"
              >
                <van-image
                  width="60"
                  height="60"
                  fit="cover"
                  :src="item.image || 'https://img01.yzcdn.cn/vant/cat.jpeg'"
                />
                <div class="history-info">
                  <div class="history-name">{{ item.keyword }}</div>
                  <div class="history-time">{{ formatDate(item.createdAt) }}</div>
                </div>
                <van-icon name="arrow" />
              </div>
            </div>
          </van-list>
        </van-tab>
        <van-tab title="品牌">
          <van-empty v-if="!brandLoading && brandHistory.length === 0" description="暂无品牌浏览记录" />
          <van-list
            v-else
            v-model:loading="brandLoading"
            :finished="brandFinished"
            finished-text="没有更多了"
            @load="onLoadBrand"
          >
            <div class="history-list">
              <div
                v-for="item in brandHistory"
                :key="item.id"
                class="history-item"
                @click="goToDetail(item)"
              >
                <van-image
                  width="60"
                  height="60"
                  fit="contain"
                  :src="item.image || 'https://img01.yzcdn.cn/vant/cat.jpeg'"
                />
                <div class="history-info">
                  <div class="history-name">{{ item.keyword }}</div>
                  <div class="history-time">{{ formatDate(item.createdAt) }}</div>
                </div>
                <van-icon name="arrow" />
              </div>
            </div>
          </van-list>
        </van-tab>
        <van-tab title="科普">
          <van-empty v-if="!knowledgeLoading && knowledgeHistory.length === 0" description="暂无科普文章浏览记录" />
          <van-list
            v-else
            v-model:loading="knowledgeLoading"
            :finished="knowledgeFinished"
            finished-text="没有更多了"
            @load="onLoadKnowledge"
          >
            <div class="history-list">
              <div
                v-for="item in knowledgeHistory"
                :key="item.id"
                class="history-item"
                @click="goToDetail(item)"
              >
                <van-image
                  width="60"
                  height="60"
                  fit="cover"
                  :src="item.image || 'https://img01.yzcdn.cn/vant/cat.jpeg'"
                />
                <div class="history-info">
                  <div class="history-name">{{ item.keyword }}</div>
                  <div class="history-time">{{ formatDate(item.createdAt) }}</div>
                </div>
                <van-icon name="arrow" />
              </div>
            </div>
          </van-list>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog, showLoadingToast, closeToast } from 'vant'
import { getHistoryList, getHistoryByType, clearHistory, clearHistoryByType } from '@/api/history'

const router = useRouter()
const activeTab = ref(0)
const loading = ref(false)
const finished = ref(true)
const ingredientLoading = ref(false)
const ingredientFinished = ref(true)
const productLoading = ref(false)
const productFinished = ref(true)
const brandLoading = ref(false)
const brandFinished = ref(true)
const knowledgeLoading = ref(false)
const knowledgeFinished = ref(true)

// 是否已登录
const isLoggedIn = ref(false)

// 历史数据
const allHistory = ref([])
const ingredientHistory = ref([])
const productHistory = ref([])
const brandHistory = ref([])
const knowledgeHistory = ref([])

// 获取当前用户ID
const getUserId = () => {
  const userId = localStorage.getItem('userId')
  if (!userId) {
    return null
  }
  return Number(userId)
}

// 跳转到登录页面
const goToLogin = () => {
  router.push({
    path: '/login',
    query: { redirect: '/history' }
  })
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`
}

// 补零
const padZero = (num) => {
  return num < 10 ? '0' + num : num
}

// 获取类型名称
const getTypeName = (type) => {
  switch (type) {
    case 'ingredient': return '成分'
    case 'product': return '产品'
    case 'brand': return '品牌'
    case 'knowledge': return '科普'
    default: return '未知'
  }
}

// 加载所有历史
const loadAllHistory = async () => {
  const userId = getUserId()
  if (!userId) {
    isLoggedIn.value = false
    return
  }

  isLoggedIn.value = true
  loading.value = true

  try {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })

    const res = await getHistoryList(userId)
    if (res.success) {
      allHistory.value = res.data || []
      
      // 按类型过滤历史记录
      updateFilteredHistory()
    } else {
      showToast(res.message || '获取浏览历史失败')
    }
  } catch (error) {
    console.error('获取浏览历史失败:', error)
    showToast('获取浏览历史失败，请稍后重试')
  } finally {
    loading.value = false
    closeToast()
    finished.value = true
  }
}

// 更新过滤后的历史记录
const updateFilteredHistory = () => {
  ingredientHistory.value = allHistory.value.filter(item => item.searchType === 'ingredient')
  productHistory.value = allHistory.value.filter(item => item.searchType === 'product')
  brandHistory.value = allHistory.value.filter(item => item.searchType === 'brand')
  knowledgeHistory.value = allHistory.value.filter(item => item.searchType === 'knowledge')
}

// 加载按类型历史
const loadHistoryByType = async (type) => {
  const userId = getUserId()
  if (!userId) {
    isLoggedIn.value = false
    return
  }

  isLoggedIn.value = true
  
  switch (type) {
    case 'ingredient':
      ingredientLoading.value = true
      break
    case 'product':
      productLoading.value = true
      break
    case 'brand':
      brandLoading.value = true
      break
    case 'knowledge':
      knowledgeLoading.value = true
      break
  }

  try {
    const res = await getHistoryByType(userId, type)
    if (res.success) {
      switch (type) {
        case 'ingredient':
          ingredientHistory.value = res.data || []
          break
        case 'product':
          productHistory.value = res.data || []
          break
        case 'brand':
          brandHistory.value = res.data || []
          break
        case 'knowledge':
          knowledgeHistory.value = res.data || []
          break
      }
    } else {
      showToast(res.message || `获取${getTypeName(type)}浏览历史失败`)
    }
  } catch (error) {
    console.error(`获取${getTypeName(type)}浏览历史失败:`, error)
    showToast(`获取${getTypeName(type)}浏览历史失败，请稍后重试`)
  } finally {
    switch (type) {
      case 'ingredient':
        ingredientLoading.value = false
        ingredientFinished.value = true
        break
      case 'product':
        productLoading.value = false
        productFinished.value = true
        break
      case 'brand':
        brandLoading.value = false
        brandFinished.value = true
        break
      case 'knowledge':
        knowledgeLoading.value = false
        knowledgeFinished.value = true
        break
    }
  }
}

// 加载更多 - 全部
const onLoad = () => {
  loadAllHistory()
}

// 加载更多 - 成分
const onLoadIngredient = () => {
  loadHistoryByType('ingredient')
}

// 加载更多 - 产品
const onLoadProduct = () => {
  loadHistoryByType('product')
}

// 加载更多 - 品牌
const onLoadBrand = () => {
  loadHistoryByType('brand')
}

// 加载更多 - 科普
const onLoadKnowledge = () => {
  loadHistoryByType('knowledge')
}

// 跳转到详情页
const goToDetail = (item) => {
  switch (item.searchType) {
    case 'ingredient':
      router.push(`/ingredient/detail/${item.resultId}`)
      break
    case 'product':
      router.push(`/product/detail/${item.resultId}`)
      break
    case 'brand':
      router.push(`/brand/detail/${item.resultId}`)
      break
    case 'knowledge':
      router.push(`/knowledge/detail/${item.resultId}`)
      break
  }
}

const onClickLeft = () => {
  router.back()
}

const onClickClear = () => {
  const userId = getUserId()
  if (!userId) {
    showToast('请先登录')
    return
  }

  showDialog({
    title: '清空历史记录',
    message: activeTab.value === 0 ? '确定要清空所有浏览历史吗？' : `确定要清空${getTabName()}浏览历史吗？`,
    showCancelButton: true,
  })
    .then(async () => {
      try {
        let res
        if (activeTab.value === 0) {
          // 清空所有历史
          res = await clearHistory(userId)
          if (res.success) {
            allHistory.value = []
            ingredientHistory.value = []
            productHistory.value = []
            brandHistory.value = []
            knowledgeHistory.value = []
            showToast('已清空浏览历史')
          } else {
            showToast(res.message || '清空失败')
          }
        } else {
          // 清空特定类型的历史
          const type = getTypeByTab()
          res = await clearHistoryByType(userId, type)
          if (res.success) {
            switch (type) {
              case 'ingredient':
                ingredientHistory.value = []
                break
              case 'product':
                productHistory.value = []
                break
              case 'brand':
                brandHistory.value = []
                break
              case 'knowledge':
                knowledgeHistory.value = []
                break
            }
            // 更新全部历史
            loadAllHistory()
            showToast(`已清空${getTabName()}浏览历史`)
          } else {
            showToast(res.message || '清空失败')
          }
        }
      } catch (error) {
        console.error('清空历史失败:', error)
        showToast('清空历史失败，请稍后重试')
      }
    })
    .catch(() => {
      // 取消操作
    })
}

// 获取当前标签页名称
const getTabName = () => {
  switch (activeTab.value) {
    case 1: return '成分'
    case 2: return '产品'
    case 3: return '品牌'
    case 4: return '科普'
    default: return '全部'
  }
}

// 获取当前标签页对应的类型
const getTypeByTab = () => {
  switch (activeTab.value) {
    case 1: return 'ingredient'
    case 2: return 'product'
    case 3: return 'brand'
    case 4: return 'knowledge'
    default: return ''
  }
}

// 组件挂载时加载数据
onMounted(() => {
  // 检查登录状态
  const userId = getUserId()
  isLoggedIn.value = !!userId
  
  if (isLoggedIn.value) {
    loadAllHistory()
  }
})
</script>

<style scoped>
.history-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding-bottom: 20px;
}

.history-list {
  padding: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 8px;
}

.history-info {
  flex: 1;
  margin-left: 12px;
}

.history-name {
  font-size: 16px;
  margin-bottom: 4px;
}

.history-type {
  font-size: 14px;
  color: #999;
  margin-bottom: 4px;
}

.history-time {
  font-size: 12px;
  color: #999;
}

.not-logged-in {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 46px);
  background-color: #fff;
}
</style> 