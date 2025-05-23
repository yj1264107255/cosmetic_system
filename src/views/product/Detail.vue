<template>
  <div class="product-detail">
    <van-nav-bar
      :title="product.name || '产品详情'"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <div class="content">
      <van-skeleton title avatar :row="10" :loading="loading">
        <!-- 产品基本信息 -->
        <div class="product-info">
          <van-swipe class="product-swipe">
            <van-swipe-item>
              <van-image
                width="100%"
                height="300"
                fit="cover"
                :src="product.image || 'https://img01.yzcdn.cn/vant/ipad.jpeg'"
              />
            </van-swipe-item>
          </van-swipe>
          
          <div class="product-header">
            <h2 class="name">{{ product.name }}</h2>
            <div class="price" v-if="product.price">¥{{ product.price.toFixed(2) }}</div>
            <div class="brand" v-if="brand">品牌：{{ brand }}</div>
            <div class="rating" v-if="product.effectivenessScore">
              <span>功效评分：</span>
              <van-rate v-model="product.effectivenessScore" readonly allow-half />
              <span class="score">{{ product.effectivenessScore }}</span>
            </div>
            <div class="actions">
              <van-button size="small" type="primary" icon="description" plain @click="scrollToIngredients">
                查看全成分表
              </van-button>
            </div>
          </div>
          
          <van-divider />
          
          <!-- 产品描述 -->
          <div class="section">
            <h3>产品描述</h3>
            <p>{{ product.description || '暂无描述' }}</p>
          </div>
          
          <!-- 安全分析 -->
          <div class="section">
            <h3>安全分析</h3>
            <div class="safety">
              <van-circle
                v-model:current="safetyPercentage"
                :rate="safetyPercentage"
                :speed="100"
                :color="getSafetyColor"
                size="80px"
                layer-color="#ebedf0"
                :text="getSafetyText"
              />
              <div class="safety-info">
                <p>安全评分：{{ product.safetyScore || '暂无' }}</p>
                <p>{{ getSafetyDescription }}</p>
              </div>
            </div>
          </div>
          
          <!-- 成分列表 -->
          <div class="section" id="ingredients-section">
            <h3>成分列表</h3>
            <van-tabs v-model:active="activeIngredientTab" sticky>
              <van-tab title="按功能分析">
                <div class="function-analysis">
                  <div class="function-item" v-for="(value, key) in ingredientFunctions" :key="key">
                    <div class="function-title">{{ key }}</div>
                    <div class="function-value">{{ value }}</div>
                  </div>
                </div>
              </van-tab>
              <van-tab title="全成分表">
                <div v-if="ingredients.length > 0">
                  <ingredient-table :ingredients="formattedIngredients" />
                </div>
                <van-empty v-else description="暂无成分信息" />
              </van-tab>
            </van-tabs>
          </div>
          
          <!-- 用户评价 -->
          <div class="section">
            <h3>用户评价</h3>
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
            
            <!-- 评价列表 -->
            <div v-if="reviews.length > 0" class="review-list">
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
                <div class="review-rating">
                  <van-rate v-model="review.rating" readonly />
                </div>
                <div class="review-content">{{ review.content }}</div>
              </div>
            </div>
            
            <!-- 无评价时显示 -->
            <van-empty v-else description="暂无评价" />
          </div>
        </div>
      </van-skeleton>
    </div>
    
    <!-- 底部操作栏 -->
    <div class="action-bar">
      <van-action-bar>
        <van-action-bar-icon icon="star" :color="isFavorite ? '#ff5000' : ''" :text="isFavorite ? '已收藏' : '收藏'" @click="toggleFavorite" />
        <van-action-bar-icon icon="comment-o" :text="isReviewed ? '已评价' : '评价'" @click="openReviewDialog" />
        <van-action-bar-icon icon="share" text="分享" @click="onClickShare" />
        <van-action-bar-button type="danger" text="查看成分" @click="scrollToIngredients" />
      </van-action-bar>
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
          <span>评分：</span>
          <van-rate v-model="newReview.rating" />
        </div>
        <van-field
          v-model="newReview.content"
          rows="3"
          autosize
          type="textarea"
          placeholder="请输入您的评价"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showDialog } from 'vant'
import IngredientTable from '@/components/IngredientTable.vue'
import { getProductDetail, getProductIngredients } from '@/api/product'
import { checkFavorite, addFavorite, cancelFavorite } from '@/api/favorite'
import { addProductReview, checkReviewed, getProductReviews } from '@/api/review'
import { addHistory } from '@/api/history'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const activeIngredientTab = ref(0)
const isFavorite = ref(false)
const showReviewDialog = ref(false)
const isReviewed = ref(false)
const reviewLoading = ref(false)

// 产品数据
const product = ref({})
const ingredients = ref([])
const reviews = ref([])
const brand = ref('')

// 成分功效分析数据
const ingredientFunctions = ref({
  '保湿': 0,
  '抗氧化': 0,
  '皮肤调理': 0,
  '舒缓': 0,
  '抗衰': 0,
  '祛痘': 0,
  '祛屑': 0,
  '美白': 0
})

// 新评价
const newReview = ref({
  rating: 5,
  content: ''
})

// 格式化成分列表数据
const formattedIngredients = computed(() => {
  return ingredients.value.map(ingredient => ({
    name: ingredient.name,
    score: ingredient.score || determineScore(ingredient.effect),
    isActive: ingredient.isActive || determineIsActive(ingredient.effect),
    usage: determineUsage(ingredient.effect)
  }))
})

// 安全评分百分比
const safetyPercentage = computed(() => {
  return product.value.safetyScore ? (product.value.safetyScore / 5) * 100 : 0
})

// 安全评分颜色
const getSafetyColor = computed(() => {
  const score = product.value.safetyScore
  if (!score) return '#999'
  if (score >= 4) return '#07c160'
  if (score >= 3) return '#ff976a'
  return '#ee0a24'
})

// 安全评分文本
const getSafetyText = computed(() => {
  return product.value.safetyScore ? `${product.value.safetyScore}/5` : '无'
})

// 安全评分描述
const getSafetyDescription = computed(() => {
  const score = product.value.safetyScore
  if (!score) return '暂无安全评分'
  if (score >= 4.5) return '非常安全，适合所有肤质使用'
  if (score >= 4) return '安全，大多数人可以使用'
  if (score >= 3) return '一般，敏感肌慎用'
  if (score >= 2) return '风险较高，不建议长期使用'
  return '不建议使用'
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 根据成分效果确定分数
const determineScore = (effect) => {
  if (!effect) return 0
  // 简单判断，实际可能需要更复杂的逻辑
  if (effect.includes('抗氧化') || effect.includes('抗老化') || effect.includes('保湿')) {
    return 4
  } else if (effect.includes('美白') || effect.includes('舒缓')) {
    return 3
  } else if (effect.includes('清洁') || effect.includes('控油')) {
    return 2
  }
  return 1
}

// 根据成分效果确定是否活性成分
const determineIsActive = (effect) => {
  if (!effect) return false
  // 活性成分判断
  const activeKeywords = ['抗氧化', '抗老化', '美白', '抗衰老', '维生素C', '视黄醇', '烟酰胺', '透明质酸']
  return activeKeywords.some(keyword => effect.includes(keyword))
}

// 根据成分效果判断用途
const determineUsage = (effect) => {
  if (!effect) return '未知'
  if (effect.includes('保湿')) return '保湿'
  if (effect.includes('抗氧化')) return '抗氧化'
  if (effect.includes('美白')) return '美白'
  if (effect.includes('抗老化') || effect.includes('抗衰老')) return '抗衰'
  if (effect.includes('舒缓')) return '舒缓'
  if (effect.includes('清洁')) return '清洁'
  if (effect.includes('控油')) return '控油'
  if (effect.includes('祛痘')) return '祛痘'
  return '其他'
}

// 分析成分功效
const analyzeIngredientFunctions = () => {
  ingredientFunctions.value = {
    '保湿': 0,
    '抗氧化': 0,
    '皮肤调理': 0,
    '舒缓': 0,
    '抗衰': 0,
    '祛痘': 0,
    '祛屑': 0,
    '美白': 0
  }

  ingredients.value.forEach(ingredient => {
    if (!ingredient.effect) return
    const effect = ingredient.effect.toLowerCase()
    
    if (effect.includes('保湿')) ingredientFunctions.value['保湿']++
    if (effect.includes('抗氧化')) ingredientFunctions.value['抗氧化']++
    if (effect.includes('调理')) ingredientFunctions.value['皮肤调理']++
    if (effect.includes('舒缓')) ingredientFunctions.value['舒缓']++
    if (effect.includes('抗衰') || effect.includes('抗老')) ingredientFunctions.value['抗衰']++
    if (effect.includes('祛痘') || effect.includes('抗痘')) ingredientFunctions.value['祛痘']++
    if (effect.includes('祛屑')) ingredientFunctions.value['祛屑']++
    if (effect.includes('美白')) ingredientFunctions.value['美白']++
  })
}

// 检查用户是否已评价该产品
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
    const res = await checkReviewed(userId, id)
    if (res.success) {
      isReviewed.value = res.data
    }
  } catch (error) {
    console.error('检查评价状态失败:', error)
  }
}

// 获取产品评论
const fetchProductReviews = async () => {
  const id = route.params.id
  try {
    const res = await getProductReviews(id)
    if (res.success && res.data && res.data.list) {
      reviews.value = res.data.list
      
      // 确保评论数据的完整性
      reviews.value = reviews.value.map(review => {
        if (!review.user) {
          review.user = { username: '匿名用户' }
        }
        return review
      })
    }
  } catch (error) {
    console.error('获取产品评论失败:', error)
  }
}

// 获取产品详情
const fetchProductDetail = async () => {
  const id = route.params.id
  if (!id) {
    showToast('无效的产品ID')
    router.back()
    return
  }

  // 重置所有状态，避免显示旧数据
  product.value = {}
  ingredients.value = []
  reviews.value = []
  brand.value = ''
  ingredientFunctions.value = {
    '保湿': 0,
    '抗氧化': 0,
    '皮肤调理': 0,
    '舒缓': 0,
    '抗衰': 0,
    '祛痘': 0,
    '祛屑': 0,
    '美白': 0
  }

  loading.value = true

  try {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })

    const res = await getProductDetail(id)
    
    if (res.success) {
      const data = res.data || {}
      product.value = data.product || {}
      ingredients.value = data.ingredients || []
      
      // 设置标题
      document.title = product.value.name || '产品详情'
      
      // 分析成分功效
      analyzeIngredientFunctions()
      
      // 设置品牌名称
      if (product.value.brand) {
        brand.value = product.value.brand.name
      }

      // 记录浏览历史
      recordViewHistory(id, product.value.name)

      // 获取评论列表
      await fetchProductReviews()

      // 检查是否已收藏和评价
      await Promise.all([
        checkIsFavorite(),
        checkIsReviewed()
      ])
    } else {
      showToast(res.message || '获取产品详情失败')
    }
  } catch (error) {
    console.error('获取产品详情失败:', error)
    showToast('获取产品详情失败，请稍后重试')
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
    searchType: 'product',
    keyword: keyword || '未知产品',
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
    const res = await checkFavorite(userId, 'product', id)
    if (res.success) {
      isFavorite.value = res.data
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 返回上一页
const onClickLeft = () => {
  router.back()
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
        query: { redirect: `/product/detail/${route.params.id}` }
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
      const res = await cancelFavorite(userId, 'product', id)
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
        favoriteType: 'product',
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

// 分享
const onClickShare = () => {
  showToast('分享功能尚未实现')
}

// 打开评价弹窗
const openReviewDialog = () => {
  // 获取当前登录用户ID
  const userId = localStorage.getItem('userId')
  if (!userId) {
    showDialog({
      title: '提示',
      message: '登录后才能评价产品',
      showCancelButton: true,
      confirmButtonText: '去登录',
      cancelButtonText: '取消'
    }).then(() => {
      // 跳转到登录页，并设置返回到当前页面
      router.push({
        path: '/login',
        query: { redirect: `/product/detail/${route.params.id}` }
      })
    }).catch(() => {
      // 用户取消操作
    })
    return
  }

  // 已评价不能再次评价
  if (isReviewed.value) {
    showToast('您已经评价过该产品')
    return
  }

  // 重置评价表单
  newReview.value.content = ''
  newReview.value.rating = 5
  
  // 显示评价弹窗
  showReviewDialog.value = true
}

// 对话框取消按钮点击处理
const onDialogCancel = () => {
  // 重置评价表单
  newReview.value.content = '';
  newReview.value.rating = 5;
};

// 对话框确认按钮点击处理
const onDialogConfirm = async () => {
  if (!newReview.value.content) {
    showToast('请输入评价内容');
    return false;
  }

  // 获取当前登录用户ID
  const userId = localStorage.getItem('userId');
  if (!userId) {
    showToast('请先登录');
    return false;
  }

  reviewLoading.value = true;

  try {
    const reviewData = {
      userId: Number(userId),
      productId: Number(route.params.id),
      rating: newReview.value.rating,
      content: newReview.value.content
    };
    
    const res = await addProductReview(reviewData);
    
    if (res.success) {
      showToast('评价成功');
      isReviewed.value = true;
      
      // 重置评价表单
      newReview.value.content = '';
      
      // 刷新评价列表
      await fetchProductReviews();
    } else {
      showToast(res.message || '评价失败');
    }
  } catch (error) {
    console.error('提交评价失败:', error);
    showToast('评价失败，请稍后重试');
  } finally {
    reviewLoading.value = false;
  }
};

// 滚动到成分列表部分
const scrollToIngredients = () => {
  // 切换到全成分表选项卡
  activeIngredientTab.value = 1
  
  // 使用setTimeout确保DOM更新后再滚动
  setTimeout(() => {
    const section = document.getElementById('ingredients-section')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }, 100)
}

// 在组件挂载和路由参数变化时获取数据
onMounted(() => {
  fetchProductDetail()
})

// 监听路由参数变化
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    fetchProductDetail()
  }
}, { immediate: false })
</script>

<style scoped>
.product-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 50px;
}

.content {
  padding-bottom: 50px;
}

.product-swipe {
  height: 300px;
}

.product-header {
  padding: 16px;
  background-color: #fff;
}

.name {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: bold;
}

.price {
  color: #f44;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}

.brand {
  color: #999;
  font-size: 14px;
  margin-bottom: 8px;
}

.rating {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.score {
  margin-left: 5px;
  color: #f44;
}

.actions {
  margin-top: 12px;
}

.section {
  margin-top: 12px;
  padding: 16px;
  background-color: #fff;
}

.section h3 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: bold;
}

.safety {
  display: flex;
  align-items: center;
}

.safety-info {
  margin-left: 16px;
  flex: 1;
}

.function-analysis {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.function-item {
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.function-title {
  font-weight: bold;
}

.function-value {
  font-size: 14px;
  color: #ff6b81;
  font-weight: bold;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-item {
  padding: 12px 0;
  border-bottom: 1px solid #ebedf0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-user {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.review-user-info {
  margin-left: 8px;
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

.review-rating {
  margin-bottom: 8px;
}

.review-content {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.review-form {
  padding: 16px;
}

.review-rating-form {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
</style> 