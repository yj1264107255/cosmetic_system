<template>
  <div class="my-reviews-container">
    <van-nav-bar
      title="我的评价"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <div class="content">
      <!-- 未登录时显示提示 -->
      <div v-if="!isLoggedIn" class="not-logged-in">
        <van-empty description="登录后才能查看评价">
          <template #bottom>
            <van-button round type="primary" size="small" @click="goToLogin">
              去登录
            </van-button>
          </template>
        </van-empty>
      </div>
      
      <!-- 已登录时显示评价列表 -->
      <div v-else>
        <van-empty v-if="!loading && reviews.length === 0" description="暂无评价记录" />
        <van-list
          v-else
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
        >
          <div class="review-list">
            <div
              v-for="review in reviews"
              :key="review.id"
              class="review-item"
            >
              <div class="product-info" @click="goToProductDetail(review.productId)">
                <van-image
                  width="60"
                  height="60"
                  fit="cover"
                  :src="review.product && review.product.image ? review.product.image : 'https://img01.yzcdn.cn/vant/cat.jpeg'"
                />
                <div class="product-detail">
                  <div class="product-name">{{ review.product ? review.product.name : '未知产品' }}</div>
                  <div class="review-rating">
                    <van-rate v-model="review.rating" readonly allow-half size="small" />
                    <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                  </div>
                  <div class="review-content">{{ review.content }}</div>
                </div>
              </div>
              <div class="review-actions">
                <van-button
                  size="small"
                  type="danger"
                  plain
                  icon="delete"
                  @click="confirmDeleteReview(review.id)"
                >
                  删除
                </van-button>
              </div>
            </div>
          </div>
        </van-list>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showDialog } from 'vant'
import { getUserReviews, deleteReview } from '@/api/review'

const router = useRouter()
const loading = ref(false)
const finished = ref(true)
const reviews = ref([])

// 是否已登录
const isLoggedIn = ref(false)

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
    query: { redirect: '/my-reviews' }
  })
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`
}

// 补零
const padZero = (num) => {
  return num < 10 ? '0' + num : num
}

// 加载评价列表
const loadReviews = async () => {
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

    const res = await getUserReviews(userId)
    if (res.success) {
      reviews.value = res.data || []
    } else {
      showToast(res.message || '获取评价列表失败')
    }
  } catch (error) {
    console.error('获取评价列表失败:', error)
    showToast('获取评价列表失败，请稍后重试')
  } finally {
    loading.value = false
    closeToast()
    finished.value = true
  }
}

// 跳转到产品详情
const goToProductDetail = (productId) => {
  router.push(`/product/detail/${productId}`)
}

// 确认删除评价
const confirmDeleteReview = (id) => {
  const userId = getUserId();
  if (!userId) {
    showToast('请先登录');
    return;
  }
  
  showDialog({
    title: '删除评价',
    message: '确定要删除这条评价吗？',
    showCancelButton: true,
  })
    .then(async () => {
      try {
        const res = await deleteReview(id, userId)
        if (res.success) {
          showToast('删除成功')
          // 从列表中移除
          reviews.value = reviews.value.filter(review => review.id !== id)
        } else {
          showToast(res.message || '删除失败')
        }
      } catch (error) {
        console.error('删除评价失败:', error)
        showToast('删除评价失败，请稍后重试')
      }
    })
    .catch(() => {
      // 取消操作
    })
}

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 组件挂载时加载数据
onMounted(() => {
  // 检查登录状态
  const userId = getUserId()
  isLoggedIn.value = !!userId
  
  if (isLoggedIn.value) {
    loadReviews()
  }
})
</script>

<style scoped>
.my-reviews-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding-bottom: 20px;
}

.review-list {
  padding: 8px;
}

.review-item {
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  padding: 12px;
}

.product-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.product-detail {
  flex: 1;
  margin-left: 12px;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.review-rating {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.review-date {
  margin-left: 8px;
  font-size: 12px;
  color: #999;
}

.review-content {
  font-size: 14px;
  line-height: 1.4;
  color: #333;
}

.review-actions {
  display: flex;
  justify-content: flex-end;
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