<template>
  <div class="knowledge-container">
    <van-nav-bar title="成分科普" />
    
    <div class="search-box">
      <van-search
        v-model="searchValue"
        placeholder="搜索科普文章标题"
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
    
    <div class="category-tabs">
      <van-tabs v-model:active="activeCategory" @change="onCategoryChange">
        <van-tab title="全部" name="all"></van-tab>
        <van-tab title="成分科普" name="ingredient"></van-tab>
        <van-tab title="护肤知识" name="skincare"></van-tab>
        <van-tab title="行业新闻" name="news"></van-tab>
      </van-tabs>
    </div>
    
    <div class="content">
      <van-empty v-if="!loading && knowledgeList.length === 0" description="暂无数据" />
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div class="knowledge-list">
            <div
              v-for="item in knowledgeList"
              :key="item.id"
              class="knowledge-item"
              @click="goToDetail(item.id)"
            >
              <div class="item-content">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-info">
                  <span class="author">{{ item.author || '佚名' }}</span>
                  <span class="category" :class="getCategoryClass(item)">{{ getCategoryText(item) }}</span>
                </div>
                <div class="item-summary" v-if="item.content">
                  {{ getSummary(item.content) }}
                </div>
              </div>
              <div class="item-image" v-if="item.image">
                <van-image
                  width="100"
                  height="100"
                  fit="cover"
                  :src="item.image"
                />
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
    
    <!-- 底部导航栏 -->
    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import TabBar from '@/components/TabBar.vue'
import { getKnowledgeList, searchKnowledge } from '@/api/knowledge'

const router = useRouter()
const searchValue = ref('')
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const knowledgeList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const activeCategory = ref('all')
const isSearching = ref(false)

// 根据文章获取分类文字
const getCategoryText = (item) => {
  if (!item.category) {
    return '成分科普'
  }
  switch (item.category) {
    case 'ingredient':
      return '成分科普'
    case 'skincare':
      return '护肤知识'
    case 'news':
      return '行业新闻'
    default:
      return '成分科普'
  }
}

// 根据文章获取分类样式类
const getCategoryClass = (item) => {
  if (!item.category) {
    return 'category-ingredient'
  }
  return `category-${item.category}`
}

// 获取内容摘要
const getSummary = (content) => {
  if (!content) return ''
  // 去除HTML标签
  const plainText = content.replace(/<[^>]+>/g, '')
  // 截取前50个字符
  return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText
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

    const res = await searchKnowledge(searchValue.value.trim())
    closeToast()

    if (res.success) {
      knowledgeList.value = res.data || []
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
  loadKnowledgeList()
}

// 分类变更
const onCategoryChange = () => {
  resetList()
  loadKnowledgeList()
}

// 重置列表
const resetList = () => {
  knowledgeList.value = []
  currentPage.value = 1
  finished.value = false
  loading.value = false
}

// 加载科普文章列表
const loadKnowledgeList = async () => {
  if (loading.value) return

  loading.value = true

  try {
    // 构建查询参数
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchValue.value.trim() || null
    }

    // 如果选择了特定分类
    if (activeCategory.value !== 'all') {
      params.category = activeCategory.value
    }

    const res = await getKnowledgeList(params.page, params.size, params.keyword)

    if (res.success) {
      const newItems = res.data.list || []
      knowledgeList.value = [...knowledgeList.value, ...newItems]
      total.value = res.data.total || 0

      // 如果当前有分类筛选，过滤结果
      if (activeCategory.value !== 'all') {
        knowledgeList.value = knowledgeList.value.filter(item => 
          (item.category || 'ingredient') === activeCategory.value)
      }

      // 判断是否已加载全部数据
      if (activeCategory.value !== 'all') {
        // 分类筛选时，手动判断是否已完成
        finished.value = knowledgeList.value.length >= 
          (newItems.filter(item => (item.category || 'ingredient') === activeCategory.value).length)
      } else {
        // 无分类筛选时，根据总数判断
        finished.value = knowledgeList.value.length >= total.value
      }
      
      currentPage.value++
    } else {
      showToast(res.message || '获取科普文章列表失败')
      finished.value = true
    }
  } catch (error) {
    console.error('获取科普文章列表失败:', error)
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
  loadKnowledgeList()
}

// 下拉刷新
const onRefresh = () => {
  resetList()
  loadKnowledgeList()
}

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/knowledge/detail/${id}`)
}

// 组件挂载时加载数据
onMounted(() => {
  loadKnowledgeList()
})
</script>

<style scoped>
.knowledge-container {
  min-height: 100vh;
  padding-bottom: 50px;
  background-color: #f7f8fa;
}

.search-box {
  position: sticky;
  top: 0;
  z-index: 100;
}

.category-tabs {
  position: sticky;
  top: 54px;
  z-index: 99;
  background-color: #fff;
}

.content {
  padding: 8px;
}

.knowledge-list {
  padding: 8px 0;
}

.knowledge-item {
  display: flex;
  padding: 16px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 8px;
}

.item-content {
  flex: 1;
  margin-right: 12px;
}

.item-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-info {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.author {
  margin-right: 8px;
}

.category {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: #fff;
}

.category-ingredient {
  background-color: #30b8c4;
}

.category-skincare {
  background-color: #ff6b81;
}

.category-news {
  background-color: #4e7df9;
}

.item-summary {
  font-size: 14px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}
</style> 