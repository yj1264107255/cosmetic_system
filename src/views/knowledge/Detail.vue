<template>
  <div class="knowledge-detail">
    <van-nav-bar
      :title="knowledge.title || '科普详情'"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <div class="content" v-if="!loading">
      <div class="article-header">
        <h1 class="title">{{ knowledge.title }}</h1>
        <div class="meta">
          <span class="author">作者：{{ knowledge.author || '佚名' }}</span>
          <span class="date">{{ formatDate(knowledge.createdAt) }}</span>
        </div>
        <div class="category-tag" :class="getCategoryClass(knowledge)">
          {{ getCategoryText(knowledge) }}
        </div>
      </div>
      
      <div class="cover-image" v-if="knowledge.image">
        <van-image
          width="100%"
          fit="cover"
          :src="knowledge.image"
        />
      </div>
      
      <div class="article-content" v-html="knowledge.content"></div>
      
      <div class="related-ingredient" v-if="ingredient">
        <div class="related-title">相关成分</div>
        <div class="ingredient-card" @click="goToIngredient(ingredient.id)">
          <div class="ingredient-name">{{ ingredient.name }}</div>
          <div class="ingredient-info">
            <div class="info-item">
              <span class="label">英文名：</span>
              <span class="value">{{ ingredient.enName || '暂无' }}</span>
            </div>
            <div class="info-item">
              <span class="label">风险等级：</span>
              <span class="value risk-level" :class="getRiskClass(ingredient.riskLevel)">
                {{ getRiskText(ingredient.riskLevel) }}
              </span>
            </div>
            <div class="info-item" v-if="ingredient.suitableSkin">
              <span class="label">适用肤质：</span>
              <span class="value">{{ ingredient.suitableSkin }}</span>
            </div>
          </div>
          <van-icon name="arrow" />
        </div>
      </div>
      
      <div class="related-articles" v-if="relatedArticles.length > 0">
        <div class="related-title">相关文章</div>
        <div
          v-for="article in relatedArticles"
          :key="article.id"
          class="related-article-item"
          @click="goToArticle(article.id)"
        >
          <div class="article-item-title">{{ article.title }}</div>
          <van-icon name="arrow" />
        </div>
      </div>
    </div>
    
    <van-skeleton title :row="10" :loading="loading" />
    
    <div class="action-bar">
      <van-button :class="['collect-button', isFavorite ? 'collected' : '']" block @click="toggleFavorite">
        {{ isFavorite ? '已收藏' : '收藏文章' }}
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showDialog } from 'vant'
import { getKnowledgeDetail, getKnowledgeByIngredient } from '@/api/knowledge'
import { getIngredientDetail } from '@/api/ingredient'
import { checkFavorite, addFavorite, cancelFavorite } from '@/api/favorite'
import { addHistory } from '@/api/history'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const knowledge = ref({})
const ingredient = ref(null)
const relatedArticles = ref([])
const isFavorite = ref(false)

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`
}

// 数字补零
const padZero = (num) => {
  return num < 10 ? '0' + num : num
}

// 根据文章获取分类文字
const getCategoryText = (item) => {
  if (!item || !item.category) {
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
  if (!item || !item.category) {
    return 'category-ingredient'
  }
  return `category-${item.category}`
}

// 获取风险等级文字
const getRiskText = (level) => {
  if (level === undefined || level === null) return '未知'
  const riskMap = {
    0: '安全',
    1: '低风险',
    2: '中等风险',
    3: '高风险'
  }
  return riskMap[level] || '未知'
}

// 获取风险等级样式类
const getRiskClass = (level) => {
  if (level === undefined || level === null) return 'risk-unknown'
  const riskClassMap = {
    0: 'risk-safe',
    1: 'risk-low',
    2: 'risk-medium',
    3: 'risk-high'
  }
  return riskClassMap[level] || 'risk-unknown'
}

// 获取科普文章详情
const fetchKnowledgeDetail = async () => {
  const id = route.params.id
  if (!id) {
    showToast('无效的文章ID')
    router.back()
    return
  }

  loading.value = true

  try {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })

    const res = await getKnowledgeDetail(id)
    closeToast()

    if (res.success) {
      // 科普文章详情
      knowledge.value = res.data.knowledge || {}
      
      // 设置文档标题
      document.title = knowledge.value.title || '科普详情'
      
      // 记录浏览历史
      recordViewHistory(id, knowledge.value.title)
      
      // 关联的成分
      if (res.data.ingredient) {
        ingredient.value = res.data.ingredient
        // 获取相关文章
        fetchRelatedArticles(ingredient.value.id)
      }

      // 检查是否已收藏
      await checkIsFavorite()
    } else {
      showToast(res.message || '获取科普文章详情失败')
    }
  } catch (error) {
    console.error('获取科普文章详情失败:', error)
    showToast('获取科普文章详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 记录浏览历史
const recordViewHistory = (resultId, keyword) => {
  // 获取当前登录用户ID
  const userId = localStorage.getItem('userId')
  if (!userId) {
    return // 未登录不记录历史
  }

  const historyData = {
    userId: Number(userId),
    searchType: 'knowledge',
    keyword: keyword || '未知文章',
    resultId: Number(resultId)
  }

  addHistory(historyData).catch(error => {
    console.error('记录浏览历史失败:', error)
  })
}

// 检查是否已收藏
const checkIsFavorite = async () => {
  const id = route.params.id
  // 获取当前登录用户ID
  const userId = localStorage.getItem('userId')
  if (!userId) {
    // 未登录时不检查收藏状态
    isFavorite.value = false
    return
  }

  try {
    const res = await checkFavorite(userId, 'knowledge', id)
    if (res.success) {
      isFavorite.value = res.data
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 获取相关文章
const fetchRelatedArticles = async (ingredientId) => {
  if (!ingredientId) return
  
  try {
    const res = await getKnowledgeByIngredient(ingredientId)
    if (res.success) {
      // 过滤掉当前文章
      relatedArticles.value = (res.data || [])
        .filter(item => item.id !== Number(route.params.id))
        .slice(0, 5) // 最多显示5篇相关文章
    }
  } catch (error) {
    console.error('获取相关文章失败:', error)
  }
}

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 跳转到成分详情页
const goToIngredient = (id) => {
  router.push(`/ingredient/detail/${id}`)
}

// 跳转到文章详情页
const goToArticle = (id) => {
  router.push(`/knowledge/detail/${id}`)
}

// 收藏/取消收藏
const toggleFavorite = async () => {
  // 获取当前登录用户ID
  const userId = localStorage.getItem('userId')
  if (!userId) {
    showDialog({
      title: '提示',
      message: '登录后才能收藏内容',
      showCancelButton: true,
      confirmButtonText: '去登录',
      cancelButtonText: '取消'
    }).then(() => {
      // 跳转到登录页，并设置返回到当前页面
      router.push({
        path: '/login',
        query: { redirect: `/knowledge/detail/${route.params.id}` }
      })
    }).catch(() => {
      // 用户取消操作
    })
    return
  }

  const id = route.params.id
  try {
    if (isFavorite.value) {
      // 取消收藏
      const res = await cancelFavorite(userId, 'knowledge', id)
      if (res.success) {
        isFavorite.value = false
        showToast('已取消收藏')
      } else {
        showToast(res.message || '取消收藏失败')
      }
    } else {
      // 添加收藏
      const data = {
        userId: Number(userId),
        favoriteType: 'knowledge',
        favoriteId: Number(id)
      }
      const res = await addFavorite(data)
      if (res.success) {
        isFavorite.value = true
        showToast('已收藏')
      } else {
        showToast(res.message || '收藏失败')
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    showToast('操作失败，请稍后重试')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchKnowledgeDetail()
})
</script>

<style scoped>
.knowledge-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 60px;
}

.content {
  padding: 16px;
  background-color: #fff;
}

.article-header {
  margin-bottom: 20px;
  position: relative;
}

.title {
  font-size: 22px;
  font-weight: bold;
  margin: 0 0 12px;
  line-height: 1.4;
}

.meta {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
  display: flex;
}

.author {
  margin-right: 12px;
}

.category-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
  position: absolute;
  top: 0;
  right: 0;
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

.cover-image {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 20px;
}

.article-content img {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
  border-radius: 4px;
}

.article-content p {
  margin: 10px 0;
}

.related-title {
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0 12px;
  color: #333;
}

.ingredient-card {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;
  position: relative;
}

.ingredient-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.ingredient-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  font-size: 14px;
  display: flex;
  align-items: center;
}

.label {
  color: #666;
  margin-right: 4px;
}

.value {
  color: #333;
}

.risk-level {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.risk-safe {
  background-color: #52c41a;
}

.risk-low {
  background-color: #faad14;
}

.risk-medium {
  background-color: #fa8c16;
}

.risk-high {
  background-color: #f5222d;
}

.risk-unknown {
  background-color: #bfbfbf;
}

.ingredient-card .van-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.related-article-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.article-item-title {
  flex: 1;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 16px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.collect-button {
  border-radius: 4px;
  background-color: #ff6b81;
  color: white;
  border: none;
}

.collect-button.collected {
  background-color: #888;
}
</style> 