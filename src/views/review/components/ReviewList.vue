<template>
  <div class="review-list">
    <van-list
      v-model:loading="localLoading"
      :finished="!hasMore"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <div v-for="(review, index) in reviews" :key="review.id" class="review-item" @click="goToDetail(review.id)">
        <div class="review-header">
          <div class="user-info">
            <van-image
              class="avatar"
              width="40"
              height="40"
              round
              :src="review.user && review.user.avatar ? review.user.avatar : 'https://img01.yzcdn.cn/vant/cat.jpeg'"
            />
            <div class="user-details">
              <div class="username">{{ review.user ? review.user.username : '匿名用户' }}</div>
              <div class="date">{{ formatDate(review.createdAt) }}</div>
            </div>
          </div>
        </div>
        
        <div class="review-title">{{ review.title }}</div>
        
        <div class="review-content">{{ formatContent(review.content) }}</div>
        
        <div class="review-images" v-if="review.imageList && review.imageList.length">
          <van-image
            v-for="(img, imgIndex) in review.imageList.slice(0, 3)"
            :key="imgIndex"
            width="32%"
            height="100"
            fit="cover"
            :src="img"
          />
          <div v-if="review.imageList.length > 3" class="more-images">+{{ review.imageList.length - 3 }}</div>
        </div>
        
        <div class="product-info" v-if="review.product">
          <van-tag type="primary" plain>产品测评</van-tag>
          <span class="product-name">{{ review.product.name }}</span>
          <van-rate v-if="review.rating" v-model="review.rating" readonly allow-half :size="12" />
        </div>
        
        <div class="review-tags" v-if="review.tagList && review.tagList.length">
          <van-tag
            v-for="(tag, tagIndex) in review.tagList"
            :key="tagIndex"
            plain
            type="primary"
            size="medium"
            class="tag-item"
          >
            {{ tag }}
          </van-tag>
        </div>
        
        <div class="review-footer">
          <div class="stats">
            <div class="stat-item">
              <van-icon name="eye-o" />
              <span>{{ formatNumber(review.viewCount) }}</span>
            </div>
            <div class="stat-item">
              <van-icon name="like-o" :class="{ 'liked': review.isLiked }" />
              <span>{{ formatNumber(review.likeCount) }}</span>
            </div>
            <div class="stat-item">
              <van-icon name="chat-o" />
              <span>{{ formatNumber(review.commentCount) }}</span>
            </div>
          </div>
        </div>
        
        <van-divider />
      </div>
    </van-list>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

// 组件参数定义
const props = defineProps({
  reviews: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 组件事件
const emit = defineEmits(['loadMore'])

const router = useRouter()
const localLoading = ref(false)

// 是否有更多数据
const hasMore = computed(() => {
  return props.reviews && props.reviews.length >= 5
})

// 监听外部loading变化
watch(() => props.loading, (val) => {
  localLoading.value = val
})

// 加载更多
const onLoad = () => {
  emit('loadMore')
}

// 格式化数字
const formatNumber = (num) => {
  if (!num) return 0
  if (num < 1000) return num
  return (num / 1000).toFixed(1) + 'k'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  // 一天内显示几小时前
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours === 0) {
      const minutes = Math.floor(diff / (60 * 1000))
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  }
  
  // 一周内显示几天前
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }
  
  // 超过一周显示具体日期
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 格式化内容（截取部分）
const formatContent = (content) => {
  if (!content) return ''
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/review/detail/${id}`)
}
</script>

<style scoped>
.review-list {
  background-color: #f5f7fa;
  padding-bottom: 40px;
}

.review-item {
  padding: 16px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  margin-right: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.date {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.review-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.review-content {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
  margin-bottom: 12px;
  text-align: justify;
}

.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  position: relative;
}

.more-images {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.product-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
}

.product-name {
  margin: 0 8px;
  color: #666;
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag-item {
  margin-right: 8px;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.stat-item .van-icon {
  font-size: 16px;
  margin-right: 4px;
}

.stat-item .liked {
  color: #ff6b81;
}

.van-divider {
  margin: 16px 0 0;
}
</style> 