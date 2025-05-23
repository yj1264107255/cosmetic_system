<template>
  <div class="ingredient-detail">
    <van-nav-bar
      :title="ingredient.name || '成分详情'"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <div class="content">
      <van-skeleton title avatar :row="10" :loading="loading">
        <div class="header">
          <div class="product-info">
            <div class="product-name">{{ ingredient.name }}</div>
            <div class="en-name">{{ ingredient.enName }}</div>
          </div>
        </div>
        
        <van-tabs v-model:active="activeTab" sticky>
          <van-tab title="成分分析">
            <!-- 风险评级区域 -->
            <div class="risk-section">
              <div class="risk-header">
                <span>风险等级：</span>
                <van-tag class="risk-tag" :type="getRiskTagType(ingredient.riskLevel)">{{ getRiskText(ingredient.riskLevel) }}</van-tag>
              </div>
            </div>
            
            <!-- 功效区域 -->
            <div class="section effect-section">
              <h3 class="section-title">功效</h3>
              <p>{{ ingredient.effect || '暂无数据' }}</p>
            </div>
            
            <!-- 功效分类区域 -->
            <div class="section function-section">
              <h3 class="section-title">按功效分类</h3>
              <div class="function-grid">
                <div v-for="(value, key) in functionScores" :key="key" class="function-item">
                  <div class="function-name">{{ key }}</div>
                  <div class="function-score">
                    <span v-for="n in 5" :key="n" 
                      :class="['score-dot', n <= value ? 'active' : '']"></span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 适用肤质 -->
            <div class="section">
              <h3 class="section-title">适用肤质</h3>
              <p>{{ ingredient.suitableSkin || '暂无数据' }}</p>
            </div>
            
            <!-- 禁忌 -->
            <div class="section">
              <h3 class="section-title">禁忌</h3>
              <p>{{ ingredient.contraindication || '暂无数据' }}</p>
            </div>
            
            <!-- 成分冲突 -->
            <div class="section conflict-section">
              <h3 class="section-title">成分冲突</h3>
              <div v-if="conflicts.length > 0" class="conflict-list">
                <div v-for="(conflict, index) in conflicts" :key="index" class="conflict-item">
                  <div class="conflict-header">
                    <van-tag type="danger" class="conflict-tag">不建议</van-tag>
                    <span class="conflict-name">{{ getConflictIngredientName(conflict) }}</span>
                  </div>
                  <div class="conflict-desc">{{ conflict.conflictDescription }}</div>
                  <div class="conflict-solution" v-if="conflict.solution">
                    <strong>解决方案：</strong> {{ conflict.solution }}
                  </div>
                </div>
              </div>
              <div v-else class="no-conflict">
                <van-icon name="passed" color="#07c160" size="20" />
                <span>暂无已知成分冲突</span>
              </div>
            </div>
            
            <!-- 注意事项 -->
            <div class="section">
              <h3 class="section-title">注意事项</h3>
              <p>{{ ingredient.precautions || '暂无数据' }}</p>
            </div>
          </van-tab>
          
          <van-tab title="知识详解">
            <div v-if="knowledgeArticles.length > 0">
              <div v-for="(article, index) in knowledgeArticles" :key="index" class="section knowledge-section">
                <h3 class="section-title">{{ article.title }}</h3>
                <div class="knowledge-content">
                  {{ article.content }}
                </div>
                <div class="knowledge-footer">
                  <div class="knowledge-author" v-if="article.author">
                    <span>作者：{{ article.author }}</span>
                  </div>
                  <van-button 
                    class="read-more-btn" 
                    size="small" 
                    type="primary" 
                    @click="goToKnowledge(article.id)"
                  >
                    阅读全文
                  </van-button>
                </div>
              </div>
            </div>
            <div v-else class="section">
              <div class="knowledge-content">
                {{ ingredient.knowledge || '暂无相关知识' }}
              </div>
            </div>
          </van-tab>
          
          <van-tab title="用户评价">
            <!-- 评价统计 -->
            <div class="section review-stats-section">
              <div class="review-header">
                <span>{{ reviews.length }}条评价</span>
                <van-button 
                  size="small" 
                  type="primary" 
                  plain 
                  @click="openReviewDialog"
                  :disabled="isReviewed"
                >
                  {{ isReviewed ? '已评价' : '写评价' }}
                </van-button>
              </div>
              
              <div class="review-stats" v-if="reviews.length > 0">
                <div class="avg-rating">
                  <span class="avg-rating-value">{{ avgRating }}</span>
                  <van-rate v-model="avgRatingValue" readonly allow-half :size="20" />
                </div>
                <div class="rating-details">
                  <div class="rating-item" v-for="(percentage, rating) in ratingPercentages" :key="rating">
                    <span class="rating-label">{{ rating }}星</span>
                    <div class="rating-bar-wrapper">
                      <div class="rating-bar" :style="{ width: percentage + '%' }"></div>
                    </div>
                    <span class="rating-percentage">{{ percentage.toFixed(0) }}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 评价列表 -->
            <div v-if="reviews.length > 0" class="section review-list-section">
              <div 
                v-for="(review, index) in reviews" 
                :key="index"
                class="review-item"
              >
                <div class="review-user">
                  <van-image
                    round
                    width="40"
                    height="40"
                    :src="review.user && review.user.avatar ? review.user.avatar : 'https://img01.yzcdn.cn/vant/cat.jpeg'"
                  />
                  <div class="review-user-info">
                    <div class="review-username">{{ review.user ? review.user.username : '匿名用户' }}</div>
                    <div class="review-date">{{ formatDate(review.createdAt) }}</div>
                  </div>
                </div>
                
                <div class="review-ratings">
                  <div class="review-rating">
                    <span class="rating-label">综合评分：</span>
                    <van-rate v-model="review.rating" readonly :size="16" />
                  </div>
                  <div class="review-rating" v-if="review.effectiveness">
                    <span class="rating-label">功效评分：</span>
                    <van-rate v-model="review.effectiveness" readonly :size="16" />
                  </div>
                  <div class="review-rating" v-if="review.tolerance">
                    <span class="rating-label">耐受性：</span>
                    <van-rate v-model="review.tolerance" readonly :size="16" />
                  </div>
                </div>
                
                <div class="review-content">{{ review.content }}</div>
                
                <div class="review-skin-type" v-if="review.skinType">
                  <span class="skin-type-label">肤质：</span>
                  <van-tag type="primary" size="medium">{{ review.skinType }}</van-tag>
                </div>
                
                <div class="review-experience" v-if="review.experience">
                  <div class="experience-title">使用体验：</div>
                  <div class="experience-content">{{ review.experience }}</div>
                </div>
                
                <!-- 仅显示自己可删除的按钮 -->
                <div class="review-actions" v-if="review.userId === userId">
                  <van-button 
                    size="mini" 
                    type="danger" 
                    plain 
                    @click="deleteReview(review.id)"
                  >
                    删除
                  </van-button>
                </div>
              </div>
            </div>
            
            <!-- 无评价时显示 -->
            <van-empty v-else description="暂无评价" />
          </van-tab>
          
          <van-tab title="相关产品" v-if="relatedProducts.length > 0">
            <div class="section">
              <div class="product-list">
                <van-cell 
                  v-for="product in relatedProducts" 
                  :key="product.id" 
                  :title="product.name"
                  :label="product.brand ? `品牌: ${product.brand}` : ''"
                  is-link
                  @click="goToProduct(product.id)"
                >
                  <template #right-icon>
                    <van-rate 
                      v-if="product.safetyScore" 
                      :value="product.safetyScore" 
                      :size="12" 
                      color="#ff6b81"
                      void-icon="star"
                      void-color="#eee"
                      readonly 
                    />
                  </template>
                </van-cell>
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </van-skeleton>
    </div>
    
    <div class="action-bar">
      <van-button :class="['collect-button', isFavorite ? 'collected' : '']" block @click="toggleFavorite">
        {{ isFavorite ? '已收藏' : '收藏' }}
      </van-button>
    </div>
    
    <!-- 评价弹窗 -->
    <van-dialog
      v-model:show="showReviewDialog"
      title="发表评价"
      show-cancel-button
      @cancel="onDialogCancel"
      @confirm="onDialogConfirm"
    >
      <div class="review-form">
        <div class="review-rating-form">
          <span>综合评分：</span>
          <van-rate v-model="newReview.rating" />
        </div>
        <div class="review-rating-form">
          <span>功效评分：</span>
          <van-rate v-model="newReview.effectiveness" />
        </div>
        <div class="review-rating-form">
          <span>耐受性：</span>
          <van-rate v-model="newReview.tolerance" />
        </div>
        <van-field
          v-model="newReview.content"
          rows="3"
          autosize
          type="textarea"
          placeholder="请输入您的评价"
        />
        <div class="skin-type-select">
          <span>您的肤质：</span>
          <van-field
            v-model="newReview.skinType"
            placeholder="例如：油性肌肤、干性肌肤"
          />
        </div>
        <van-field
          v-model="newReview.experience"
          rows="3"
          autosize
          type="textarea"
          placeholder="使用体验（可选）"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showDialog } from 'vant'
import { 
  getIngredientDetail, 
  getIngredientConflicts, 
  getIngredientProducts, 
  getIngredientKnowledge 
} from '@/api/ingredient'
import { getKnowledgeByIngredient } from '@/api/knowledge'
import { checkFavorite, addFavorite, cancelFavorite } from '@/api/favorite'
import { addHistory } from '@/api/history'
import { 
  getIngredientReviews, 
  addIngredientReview, 
  checkIngredientReviewed, 
  deleteIngredientReview,
  getIngredientAverageRating
} from '@/api/ingredientReview'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const activeTab = ref(0)
const isFavorite = ref(false)
const ingredient = ref({})
const conflicts = ref([])
const relatedProducts = ref([])
const knowledgeArticles = ref([])
const reviews = ref([])
const isReviewed = ref(false)
const showReviewDialog = ref(false)
const reviewLoading = ref(false)
const avgRating = ref('0.0')
const avgRatingValue = ref(0)
const userId = ref(localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null)

// 模拟功效分数数据 - 实际项目可能需要从成分数据中提取
const functionScores = ref({
  '保湿': 5,
  '抗氧化': 4,
  '抗衰老': 3,
  '防晒': 0,
  '舒缓': 2,
  '美白': 5,
  '抗痘': 1,
  '抗敏': 0
})

// 评分百分比
const ratingPercentages = ref({
  5: 0,
  4: 0,
  3: 0,
  2: 0,
  1: 0
})

// 新评价
const newReview = ref({
  rating: 5,
  effectiveness: 5,
  tolerance: 5,
  content: '',
  skinType: '',
  experience: ''
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

// 获取冲突成分名称
const getConflictIngredientName = (conflict) => {
  // 判断哪个是当前成分，显示另一个
  const currentId = Number(route.params.id)
  return conflict.ingredientId1 === currentId 
    ? conflict.ingredient2Name 
    : conflict.ingredient1Name
}

// 获取成分详情
const fetchIngredientDetail = async () => {
  try {
    const id = route.params.id
    if (!id) {
      showToast('无效的成分ID')
      router.back()
      return
    }

    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })

    const res = await getIngredientDetail(id)

    if (res.success) {
      ingredient.value = res.data || {}
      document.title = ingredient.value.name || '成分详情'
      
      // 记录浏览历史
      recordViewHistory(id, ingredient.value.name)
      
      // 获取更多数据
      await Promise.all([
        fetchConflicts(),
        fetchProducts(),
        fetchKnowledge(),
        checkIsFavorite(),
        fetchReviews()
      ])
    } else {
      showToast(res.message || '获取成分详情失败')
    }
  } catch (error) {
    console.error('获取成分详情失败:', error)
    showToast('获取成分详情失败，请稍后重试')
  } finally {
    loading.value = false
    closeToast()
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
    searchType: 'ingredient',
    keyword: keyword || '未知成分',
    resultId: Number(resultId)
  }

  addHistory(historyData).catch(error => {
    console.error('记录浏览历史失败:', error)
  })
}

// 获取成分冲突信息
const fetchConflicts = async () => {
  try {
    const id = route.params.id
    const res = await getIngredientConflicts(id)
    if (res.success) {
      conflicts.value = res.data || []
    }
  } catch (error) {
    console.error('获取成分冲突信息失败:', error)
  }
}

// 获取相关产品
const fetchProducts = async () => {
  try {
    const id = route.params.id
    const res = await getIngredientProducts(id)
    if (res.success) {
      relatedProducts.value = res.data || []
    }
  } catch (error) {
    console.error('获取相关产品失败:', error)
  }
}

// 获取知识文章
const fetchKnowledge = async () => {
  try {
    const id = route.params.id
    const res = await getKnowledgeByIngredient(id)
    if (res.success) {
      knowledgeArticles.value = res.data || []
    }
  } catch (error) {
    console.error('获取知识文章失败:', error)
  }
}

// 获取评价列表
const fetchReviews = async () => {
  try {
    const id = route.params.id
    const res = await getIngredientReviews(id)
    if (res.success && res.data) {
      reviews.value = res.data.list || []
      
      // 确保评论数据的完整性
      reviews.value = reviews.value.map(review => {
        if (!review.user) {
          review.user = { username: '匿名用户' }
        }
        return review
      })
      
      // 计算评分统计数据
      calculateRatingStats()
      // 检查用户是否已评价
      checkIsReviewed()
    }
  } catch (error) {
    console.error('获取评价列表失败:', error)
  }
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
    const res = await checkFavorite(userId, 'ingredient', id)
    if (res.success) {
      isFavorite.value = res.data
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
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
        query: { redirect: `/ingredient/detail/${route.params.id}` }
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
      const res = await cancelFavorite(userId, 'ingredient', id)
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
        favoriteType: 'ingredient',
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

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 跳转到产品页面
const goToProduct = (id) => {
  router.push(`/product/detail/${id}`)
}

// 跳转到成分科普详情页
const goToKnowledge = (id) => {
  router.push(`/knowledge/detail/${id}`)
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 检查用户是否已评价
const checkIsReviewed = async () => {
  const id = route.params.id
  // 获取当前登录用户ID
  const userId = localStorage.getItem('userId')
  if (!userId) {
    // 未登录用户没有评价过
    isReviewed.value = false
    return
  }

  try {
    const res = await checkIngredientReviewed(userId, id)
    if (res.success) {
      isReviewed.value = res.data
    }
  } catch (error) {
    console.error('检查评价状态失败:', error)
  }
}

// 计算评价统计数据
const calculateRatingStats = async () => {
  // 获取平均评分
  try {
    const id = route.params.id
    const res = await getIngredientAverageRating(id)
    if (res.success && res.data !== null) {
      avgRating.value = parseFloat(res.data).toFixed(1)
      avgRatingValue.value = parseFloat(res.data)
    } else {
      avgRating.value = '0.0'
      avgRatingValue.value = 0
    }
  } catch (error) {
    console.error('获取平均评分失败:', error)
    avgRating.value = '0.0'
    avgRatingValue.value = 0
  }
  
  // 计算评分分布
  const ratings = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  }
  
  if (reviews.value.length === 0) {
    ratingPercentages.value = ratings
    return
  }
  
  // 统计各评分数量
  reviews.value.forEach(review => {
    if (review.rating && ratings[review.rating] !== undefined) {
      ratings[review.rating]++
    }
  })
  
  // 计算百分比
  const total = reviews.value.length
  Object.keys(ratings).forEach(rating => {
    ratingPercentages.value[rating] = (ratings[rating] / total) * 100
  })
}

// 打开评价弹窗
const openReviewDialog = () => {
  // 获取当前登录用户ID
  const userId = localStorage.getItem('userId')
  if (!userId) {
    showDialog({
      title: '提示',
      message: '登录后才能评价成分',
      showCancelButton: true,
      confirmButtonText: '去登录',
      cancelButtonText: '取消'
    }).then(() => {
      // 跳转到登录页，并设置返回到当前页面
      router.push({
        path: '/login',
        query: { redirect: `/ingredient/detail/${route.params.id}` }
      })
    }).catch(() => {
      // 用户取消操作
    })
    return
  }

  // 已评价不能再次评价
  if (isReviewed.value) {
    showToast('您已经评价过该成分')
    return
  }

  // 重置评价表单
  newReview.value = {
    rating: 5,
    effectiveness: 5,
    tolerance: 5,
    content: '',
    skinType: '',
    experience: ''
  }
  
  // 显示评价弹窗
  showReviewDialog.value = true
}

// 取消评价弹窗
const onDialogCancel = () => {
  // 重置评价表单
  newReview.value = {
    rating: 5,
    effectiveness: 5,
    tolerance: 5,
    content: '',
    skinType: '',
    experience: ''
  }
  showReviewDialog.value = false
}

// 确认评价
const onDialogConfirm = async () => {
  if (!newReview.value.content) {
    showToast('请输入评价内容')
    return false
  }

  // 获取当前登录用户ID
  const userId = localStorage.getItem('userId')
  if (!userId) {
    showToast('请先登录')
    return false
  }

  reviewLoading.value = true

  try {
    const reviewData = {
      userId: Number(userId),
      ingredientId: Number(route.params.id),
      rating: newReview.value.rating,
      effectiveness: newReview.value.effectiveness,
      tolerance: newReview.value.tolerance,
      content: newReview.value.content,
      skinType: newReview.value.skinType || null,
      experience: newReview.value.experience || null
    }
    
    const res = await addIngredientReview(reviewData)
    
    if (res.success) {
      showToast('评价成功')
      isReviewed.value = true
      
      // 重置评价表单
      newReview.value = {
        rating: 5,
        effectiveness: 5,
        tolerance: 5,
        content: '',
        skinType: '',
        experience: ''
      }
      
      // 刷新评价列表
      await fetchReviews()
    } else {
      showToast(res.message || '评价失败')
    }
  } catch (error) {
    console.error('提交评价失败:', error)
    showToast('评价失败，请稍后重试')
  } finally {
    reviewLoading.value = false
  }
}

// 删除评价
const deleteReview = async (id) => {
  const userId = localStorage.getItem('userId')
  if (!userId) {
    showToast('请先登录')
    return
  }

  showDialog({
    title: '提示',
    message: '确定要删除该评价吗？',
    showCancelButton: true
  }).then(async () => {
    try {
      const res = await deleteIngredientReview(id, userId)
      if (res.success) {
        showToast('评价已删除')
        isReviewed.value = false
        
        // 刷新评价列表
        await fetchReviews()
      } else {
        showToast(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除评价失败:', error)
      showToast('删除失败，请稍后重试')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 组件挂载时获取数据
onMounted(() => {
  fetchIngredientDetail()
})
</script>

<style scoped>
.ingredient-detail {
  min-height: 100vh;
  background-color: #f5f6fa;
  padding-bottom: 60px;
}

.content {
  padding-bottom: 60px;
}

.header {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 8px;
}

.product-info {
  text-align: left;
}

.product-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.en-name {
  color: #666;
  font-size: 14px;
}

.risk-section {
  background-color: #fff;
  padding: 12px 16px;
  margin-bottom: 8px;
}

.risk-header {
  display: flex;
  align-items: center;
}

.risk-tag {
  font-size: 14px;
  padding: 2px 8px;
  border-radius: 4px;
}

.section {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 12px;
  color: #333;
}

.effect-section p {
  line-height: 1.6;
  color: #444;
}

.function-section {
  background-color: #fff;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.function-name {
  margin-bottom: 8px;
  font-size: 14px;
  color: #444;
}

.function-score {
  display: flex;
  gap: 4px;
}

.score-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #eee;
}

.score-dot.active {
  background-color: #4caf50;
}

.knowledge-section {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 8px;
}

.knowledge-content {
  line-height: 1.6;
  color: #444;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.knowledge-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.knowledge-author {
  font-size: 14px;
  color: #999;
}

.read-more-btn {
  background-color: #30b8c4;
  border: none;
}

.conflict-section {
  background-color: #fff;
}

.conflict-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.conflict-item {
  padding: 12px;
  background-color: #fff9fa;
  border-radius: 8px;
  border-left: 4px solid #ff6b81;
}

.conflict-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.conflict-tag {
  margin-right: 8px;
}

.conflict-name {
  font-weight: bold;
  color: #333;
}

.conflict-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 8px;
}

.conflict-solution {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  padding-top: 8px;
  border-top: 1px dashed #eee;
}

.no-conflict {
  display: flex;
  align-items: center;
  color: #07c160;
  gap: 8px;
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

.product-list {
  margin-top: 12px;
}

/* 修改van-tabs样式 */
:deep(.van-tabs__nav) {
  background-color: #fff;
}

:deep(.van-tab--active) {
  color: #ff6b81;
}

:deep(.van-tabs__line) {
  background-color: #ff6b81;
}

.review-stats-section {
  background-color: #fff;
  padding: 12px 16px;
  margin-bottom: 8px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-stats {
  margin-top: 12px;
  display: flex;
}

.avg-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 24px;
  min-width: 80px;
}

.avg-rating-value {
  font-size: 28px;
  font-weight: bold;
  color: #ff6b81;
  margin-bottom: 4px;
}

.rating-details {
  flex: 1;
}

.rating-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.rating-label {
  width: 40px;
}

.rating-bar-wrapper {
  flex: 1;
  height: 12px;
  background-color: #eee;
  border-radius: 6px;
  margin: 0 8px;
  overflow: hidden;
}

.rating-bar {
  height: 100%;
  background-color: #ff6b81;
  border-radius: 6px;
}

.rating-percentage {
  width: 40px;
  text-align: right;
  font-size: 12px;
  color: #999;
}

.review-list-section {
  padding: 0;
}

.review-item {
  padding: 16px;
  border-bottom: 1px solid #f2f2f2;
}

.review-item:last-child {
  border-bottom: none;
}

.review-user {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.review-user-info {
  margin-left: 12px;
}

.review-username {
  font-weight: bold;
  font-size: 14px;
}

.review-date {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.review-ratings {
  margin-bottom: 12px;
}

.review-rating {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.rating-label {
  font-size: 12px;
  color: #666;
  margin-right: 4px;
}

.review-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
}

.review-skin-type {
  margin-bottom: 8px;
}

.skin-type-label {
  font-size: 12px;
  color: #666;
  margin-right: 4px;
}

.review-experience {
  background-color: #f9f9f9;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.experience-title {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.experience-content {
  font-size: 13px;
  line-height: 1.5;
  color: #333;
}

.review-actions {
  display: flex;
  justify-content: flex-end;
}

.review-form {
  padding: 16px;
}

.review-rating-form {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.skin-type-select {
  display: flex;
  align-items: center;
  margin: 16px 0;
}
</style> 