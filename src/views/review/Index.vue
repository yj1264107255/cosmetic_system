<template>
  <div class="review-list-page">
    <van-nav-bar
      title="护肤品测评"
      left-arrow
      fixed
      @click-left="onClickLeft"
      @click-right="onClickRight"
    >
      <template #right>
        <van-icon name="edit" size="18" />
      </template>
    </van-nav-bar>

    <div class="content-container">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <van-search 
          v-model="searchKeyword" 
          placeholder="搜索测评内容、品牌、产品" 
          shape="round"
          @search="onSearch"
        />
      </div>

      <!-- 标签栏 -->
      <div class="tags-container">
        <van-tabs v-model:active="activeTab" sticky swipeable>
          <van-tab title="推荐">
            <review-list :reviews="reviews" :loading="loading" @loadMore="loadMore" />
          </van-tab>
          <van-tab title="热门">
            <review-list :reviews="hotReviews" :loading="hotLoading" @loadMore="loadMoreHot" />
          </van-tab>
          <van-tab title="最新">
            <review-list :reviews="latestReviews" :loading="latestLoading" @loadMore="loadMoreLatest" />
          </van-tab>
        </van-tabs>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="reviews.length === 0 && !loading" class="empty-state">
      <van-empty description="暂无测评内容" />
    </div>
    
    <!-- 悬浮发布按钮 -->
    <div class="floating-button" @click="onClickRight">
      <van-button type="primary" round icon="edit" size="small">发布测评</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { getReviewPostList, getHotReviewPosts } from '@/api/reviewPost'
import ReviewList from './components/ReviewList.vue'

const router = useRouter()
const searchKeyword = ref('')
const activeTab = ref(0)
const loading = ref(false)
const hotLoading = ref(false)
const latestLoading = ref(false)
const hasMore = ref(true)
const hotHasMore = ref(true)
const latestHasMore = ref(true)
const userId = ref(localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null)

// 测评数据
const reviews = ref([])
const hotReviews = ref([])
const latestReviews = ref([])

// 分页参数
const page = ref(1)
const hotPage = ref(1)
const latestPage = ref(1)
const pageSize = 10

// 返回上一页
const onClickLeft = () => {
  router.push('/')
}

// 跳转到发布测评页面
const onClickRight = () => {
  if (!userId.value) {
    showToast('请先登录')
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    return
  }
  router.push('/review/publish')
}

// 加载测评列表
const loadReviews = async (isRefresh = false) => {
  if (isRefresh) {
    page.value = 1
    reviews.value = []
    hasMore.value = true
  }
  
  if (!hasMore.value) return
  
  loading.value = true
  try {
    const res = await getReviewPostList(page.value, pageSize, userId.value)
    if (res.success && res.data) {
      if (isRefresh) {
        reviews.value = res.data.list || []
      } else {
        reviews.value = [...reviews.value, ...(res.data.list || [])]
      }
      
      hasMore.value = reviews.value.length < res.data.total
      page.value++
    } else {
      showToast(res.message || '获取测评列表失败')
    }
  } catch (error) {
    console.error('获取测评列表失败:', error)
    showToast('获取测评列表失败')
  } finally {
    loading.value = false
  }
}

// 加载热门测评
const loadHotReviews = async (isRefresh = false) => {
  if (isRefresh) {
    hotPage.value = 1
    hotReviews.value = []
    hotHasMore.value = true
  }
  
  if (!hotHasMore.value) return
  
  hotLoading.value = true
  try {
    const res = await getHotReviewPosts(10, userId.value)
    if (res.success && res.data) {
      hotReviews.value = res.data || []
      hotHasMore.value = false // 热门测评使用固定10条
    } else {
      showToast(res.message || '获取热门测评失败')
    }
  } catch (error) {
    console.error('获取热门测评失败:', error)
    showToast('获取热门测评失败')
  } finally {
    hotLoading.value = false
  }
}

// 加载最新测评
const loadLatestReviews = async (isRefresh = false) => {
  if (isRefresh) {
    latestPage.value = 1
    latestReviews.value = []
    latestHasMore.value = true
  }
  
  if (!latestHasMore.value) return
  
  latestLoading.value = true
  try {
    const res = await getReviewPostList(latestPage.value, pageSize, userId.value)
    if (res.success && res.data) {
      if (isRefresh) {
        latestReviews.value = res.data.list || []
      } else {
        latestReviews.value = [...latestReviews.value, ...(res.data.list || [])]
      }
      
      latestHasMore.value = latestReviews.value.length < res.data.total
      latestPage.value++
    } else {
      showToast(res.message || '获取最新测评失败')
    }
  } catch (error) {
    console.error('获取最新测评失败:', error)
    showToast('获取最新测评失败')
  } finally {
    latestLoading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    loadReviews()
  }
}

// 加载更多热门测评
const loadMoreHot = () => {
  if (!hotLoading.value && hotHasMore.value) {
    loadHotReviews()
  }
}

// 加载更多最新测评
const loadMoreLatest = () => {
  if (!latestLoading.value && latestHasMore.value) {
    loadLatestReviews()
  }
}

// 搜索测评
const onSearch = () => {
  if (!searchKeyword.value.trim()) {
    loadReviews(true)
    return
  }
  
  router.push({
    path: '/review/search',
    query: {
      keyword: searchKeyword.value
    }
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadReviews(true)
  loadHotReviews(true)
  loadLatestReviews(true)
})
</script>

<style scoped>
.review-list-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-top: 46px;
  padding-bottom: 65px;
}

.content-container {
  width: 100%;
}

.search-bar {
  position: sticky;
  top: 46px;
  z-index: 100;
  background-color: #fff;
}

.tags-container {
  margin-top: 8px;
}

.empty-state {
  margin-top: 100px;
}

.floating-button {
  position: fixed;
  right: 16px;
  bottom: 80px;
  z-index: 99;
}

.floating-button .van-button {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  padding: 8px 16px;
  background-color: #ff6b81;
  border: none;
}
</style> 