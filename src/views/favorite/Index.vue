<template>
  <div class="favorite-container">
    <van-nav-bar
      title="我的收藏"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <div class="content">
      <!-- 未登录时显示提示 -->
      <div v-if="!isLoggedIn" class="not-logged-in">
        <van-empty description="登录后才能查看收藏">
          <template #bottom>
            <van-button round type="primary" size="small" @click="goToLogin">
              去登录
            </van-button>
          </template>
        </van-empty>
      </div>
      
      <!-- 已登录时显示收藏列表 -->
      <van-tabs v-else v-model:active="activeTab" sticky>
        <van-tab title="全部">
          <van-empty v-if="!loading && allFavorites.length === 0" description="暂无收藏内容" />
          <van-list
            v-else
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div class="favorite-list">
              <div
                v-for="item in allFavorites"
                :key="item.id"
                class="favorite-item"
              >
                <div class="favorite-content" @click="goToDetail(item)">
                  <van-image
                    width="60"
                    height="60"
                    fit="cover"
                    :src="item.image"
                  />
                  <div class="favorite-info">
                    <div class="favorite-name">{{ item.name }}</div>
                    <div class="favorite-type">{{ getTypeName(item.type) }}</div>
                    <div class="favorite-time">{{ item.time }}</div>
                  </div>
                  <van-icon name="arrow" />
                </div>
                <div class="favorite-action">
                  <van-button
                    type="danger"
                    size="small"
                    icon="delete"
                    @click="removeFavorite(item)"
                  >
                    取消收藏
                  </van-button>
                </div>
              </div>
            </div>
          </van-list>
        </van-tab>
        <van-tab title="成分">
          <van-empty v-if="!ingredientLoading && ingredientFavorites.length === 0" description="暂无收藏成分" />
          <van-list
            v-else
            v-model:loading="ingredientLoading"
            :finished="ingredientFinished"
            finished-text="没有更多了"
            @load="onLoadIngredient"
          >
            <div class="favorite-list">
              <div
                v-for="item in ingredientFavorites"
                :key="item.id"
                class="favorite-item"
              >
                <div class="favorite-content" @click="goToDetail(item)">
                  <van-image
                    width="60"
                    height="60"
                    fit="cover"
                    :src="item.image || 'https://img01.yzcdn.cn/vant/cat.jpeg'"
                  />
                  <div class="favorite-info">
                    <div class="favorite-name">{{ item.name }}</div>
                    <div class="favorite-time">{{ item.time }}</div>
                  </div>
                  <van-icon name="arrow" />
                </div>
                <div class="favorite-action">
                  <van-button
                    type="danger"
                    size="small"
                    icon="delete"
                    @click="removeFavorite(item)"
                  >
                    取消收藏
                  </van-button>
                </div>
              </div>
            </div>
          </van-list>
        </van-tab>
        <van-tab title="产品">
          <van-empty v-if="!productLoading && productFavorites.length === 0" description="暂无收藏产品" />
          <van-list
            v-else
            v-model:loading="productLoading"
            :finished="productFinished"
            finished-text="没有更多了"
            @load="onLoadProduct"
          >
            <div class="favorite-list">
              <div
                v-for="item in productFavorites"
                :key="item.id"
                class="favorite-item"
              >
                <div class="favorite-content" @click="goToDetail(item)">
                  <van-image
                    width="60"
                    height="60"
                    fit="cover"
                    :src="item.image"
                  />
                  <div class="favorite-info">
                    <div class="favorite-name">{{ item.name }}</div>
                    <div class="favorite-time">{{ item.time }}</div>
                  </div>
                  <van-icon name="arrow" />
                </div>
                <div class="favorite-action">
                  <van-button
                    type="danger"
                    size="small"
                    icon="delete"
                    @click="removeFavorite(item)"
                  >
                    取消收藏
                  </van-button>
                </div>
              </div>
            </div>
          </van-list>
        </van-tab>
        <van-tab title="品牌">
          <van-empty v-if="!brandLoading && brandFavorites.length === 0" description="暂无收藏品牌" />
          <van-list
            v-else
            v-model:loading="brandLoading"
            :finished="brandFinished"
            finished-text="没有更多了"
            @load="onLoadBrand"
          >
            <div class="favorite-list">
              <div
                v-for="item in brandFavorites"
                :key="item.id"
                class="favorite-item"
              >
                <div class="favorite-content" @click="goToDetail(item)">
                  <van-image
                    width="60"
                    height="60"
                    fit="contain"
                    :src="item.image"
                  />
                  <div class="favorite-info">
                    <div class="favorite-name">{{ item.name }}</div>
                    <div class="favorite-time">{{ item.time }}</div>
                  </div>
                  <van-icon name="arrow" />
                </div>
                <div class="favorite-action">
                  <van-button
                    type="danger"
                    size="small"
                    icon="delete"
                    @click="removeFavorite(item)"
                  >
                    取消收藏
                  </van-button>
                </div>
              </div>
            </div>
          </van-list>
        </van-tab>
        <van-tab title="科普">
          <van-empty v-if="!knowledgeLoading && knowledgeFavorites.length === 0" description="暂无收藏科普文章" />
          <van-list
            v-else
            v-model:loading="knowledgeLoading"
            :finished="knowledgeFinished"
            finished-text="没有更多了"
            @load="onLoadKnowledge"
          >
            <div class="favorite-list">
              <div
                v-for="item in knowledgeFavorites"
                :key="item.id"
                class="favorite-item"
              >
                <div class="favorite-content" @click="goToDetail(item)">
                  <van-image
                    width="60"
                    height="60"
                    fit="cover"
                    :src="item.image"
                  />
                  <div class="favorite-info">
                    <div class="favorite-name">{{ item.name }}</div>
                    <div class="favorite-time">{{ item.time }}</div>
                  </div>
                  <van-icon name="arrow" />
                </div>
                <div class="favorite-action">
                  <van-button
                    type="danger"
                    size="small"
                    icon="delete"
                    @click="removeFavorite(item)"
                  >
                    取消收藏
                  </van-button>
                </div>
              </div>
            </div>
          </van-list>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog, showLoadingToast, closeToast } from 'vant'
import { getFavoriteList, getFavoriteByType, deleteFavorite, cancelFavorite } from '@/api/favorite'
import { getIngredientDetail } from '@/api/ingredient'
import { getProductDetail } from '@/api/product'
import { getBrandDetail } from '@/api/brand'
import { getKnowledgeDetail } from '@/api/knowledge'

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

// 收藏数据
const allFavorites = ref([])
const ingredientFavorites = ref([])
const productFavorites = ref([])
const brandFavorites = ref([])
const knowledgeFavorites = ref([])

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
    query: { redirect: '/favorite' }
  })
}

// 格式化时间
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

// 加载所有收藏
const loadAllFavorites = async () => {
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

    const res = await getFavoriteList(userId)
    if (res.success) {
      // 处理返回的收藏数据
      const favorites = res.data || []
      const detailedFavorites = []

      // 依次获取收藏项的详细信息
      for (const fav of favorites) {
        // 根据收藏类型获取详细信息
        let detailRes
        try {
          switch (fav.favoriteType) {
            case 'ingredient':
              detailRes = await getIngredientDetail(fav.favoriteId)
              if (detailRes.success) {
                detailedFavorites.push({
                  id: fav.id,
                  favoriteId: fav.favoriteId,
                  type: fav.favoriteType,
                  name: detailRes.data.name,
                  image: detailRes.data.image || 'https://img01.yzcdn.cn/vant/cat.jpeg',
                  time: formatDate(fav.createdAt)
                })
              }
              break
            case 'product':
              detailRes = await getProductDetail(fav.favoriteId)
              if (detailRes.success && detailRes.data.product) {
                detailedFavorites.push({
                  id: fav.id,
                  favoriteId: fav.favoriteId,
                  type: fav.favoriteType,
                  name: detailRes.data.product.name,
                  image: detailRes.data.product.image || 'https://img01.yzcdn.cn/vant/cat.jpeg',
                  time: formatDate(fav.createdAt)
                })
              }
              break
            case 'brand':
              detailRes = await getBrandDetail(fav.favoriteId)
              if (detailRes.success) {
                detailedFavorites.push({
                  id: fav.id,
                  favoriteId: fav.favoriteId,
                  type: fav.favoriteType,
                  name: detailRes.data.name,
                  image: detailRes.data.logo || 'https://img01.yzcdn.cn/vant/cat.jpeg',
                  time: formatDate(fav.createdAt)
                })
              }
              break
            case 'knowledge':
              detailRes = await getKnowledgeDetail(fav.favoriteId)
              if (detailRes.success && detailRes.data.knowledge) {
                detailedFavorites.push({
                  id: fav.id,
                  favoriteId: fav.favoriteId,
                  type: fav.favoriteType,
                  name: detailRes.data.knowledge.title,
                  image: detailRes.data.knowledge.image || 'https://img01.yzcdn.cn/vant/cat.jpeg',
                  time: formatDate(fav.createdAt)
                })
              }
              break
          }
        } catch (error) {
          console.error(`获取收藏详情失败:`, error)
        }
      }

      allFavorites.value = detailedFavorites

      // 按类型过滤收藏
      updateFilteredFavorites()
    } else {
      showToast(res.message || '获取收藏列表失败')
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    showToast('获取收藏列表失败，请稍后重试')
  } finally {
    loading.value = false
    closeToast()
    finished.value = true
  }
}

// 更新过滤后的收藏列表
const updateFilteredFavorites = () => {
  ingredientFavorites.value = allFavorites.value.filter(item => item.type === 'ingredient')
  productFavorites.value = allFavorites.value.filter(item => item.type === 'product')
  brandFavorites.value = allFavorites.value.filter(item => item.type === 'brand')
  knowledgeFavorites.value = allFavorites.value.filter(item => item.type === 'knowledge')
}

// 加载按类型收藏
const loadFavoritesByType = async (type) => {
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
    const res = await getFavoriteByType(userId, type)
    if (res.success) {
      // 处理返回的收藏数据
      const favorites = res.data || []
      const detailedFavorites = []

      // 依次获取收藏项的详细信息
      for (const fav of favorites) {
        let detailRes
        try {
          switch (type) {
            case 'ingredient':
              detailRes = await getIngredientDetail(fav.favoriteId)
              if (detailRes.success) {
                detailedFavorites.push({
                  id: fav.id,
                  favoriteId: fav.favoriteId,
                  type: fav.favoriteType,
                  name: detailRes.data.name,
                  image: detailRes.data.image || 'https://img01.yzcdn.cn/vant/cat.jpeg',
                  time: formatDate(fav.createdAt)
                })
              }
              break
            case 'product':
              detailRes = await getProductDetail(fav.favoriteId)
              if (detailRes.success && detailRes.data.product) {
                detailedFavorites.push({
                  id: fav.id,
                  favoriteId: fav.favoriteId,
                  type: fav.favoriteType,
                  name: detailRes.data.product.name,
                  image: detailRes.data.product.image || 'https://img01.yzcdn.cn/vant/cat.jpeg',
                  time: formatDate(fav.createdAt)
                })
              }
              break
            case 'brand':
              detailRes = await getBrandDetail(fav.favoriteId)
              if (detailRes.success) {
                detailedFavorites.push({
                  id: fav.id,
                  favoriteId: fav.favoriteId,
                  type: fav.favoriteType,
                  name: detailRes.data.name,
                  image: detailRes.data.logo || 'https://img01.yzcdn.cn/vant/cat.jpeg',
                  time: formatDate(fav.createdAt)
                })
              }
              break
            case 'knowledge':
              detailRes = await getKnowledgeDetail(fav.favoriteId)
              if (detailRes.success && detailRes.data.knowledge) {
                detailedFavorites.push({
                  id: fav.id,
                  favoriteId: fav.favoriteId,
                  type: fav.favoriteType,
                  name: detailRes.data.knowledge.title,
                  image: detailRes.data.knowledge.image || 'https://img01.yzcdn.cn/vant/cat.jpeg',
                  time: formatDate(fav.createdAt)
                })
              }
              break
          }
        } catch (error) {
          console.error(`获取收藏详情失败:`, error)
        }
      }

      // 更新对应类型的收藏列表
      switch (type) {
        case 'ingredient':
          ingredientFavorites.value = detailedFavorites
          break
        case 'product':
          productFavorites.value = detailedFavorites
          break
        case 'brand':
          brandFavorites.value = detailedFavorites
          break
        case 'knowledge':
          knowledgeFavorites.value = detailedFavorites
          break
      }
    } else {
      showToast(res.message || `获取${getTypeName(type)}收藏列表失败`)
    }
  } catch (error) {
    console.error(`获取${getTypeName(type)}收藏列表失败:`, error)
    showToast(`获取${getTypeName(type)}收藏列表失败，请稍后重试`)
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
  loadAllFavorites()
}

// 加载更多 - 成分
const onLoadIngredient = () => {
  loadFavoritesByType('ingredient')
}

// 加载更多 - 产品
const onLoadProduct = () => {
  loadFavoritesByType('product')
}

// 加载更多 - 品牌
const onLoadBrand = () => {
  loadFavoritesByType('brand')
}

// 加载更多 - 科普
const onLoadKnowledge = () => {
  loadFavoritesByType('knowledge')
}

// 跳转到详情页
const goToDetail = (item) => {
  switch (item.type) {
    case 'ingredient':
      router.push(`/ingredient/detail/${item.favoriteId}`)
      break
    case 'product':
      router.push(`/product/detail/${item.favoriteId}`)
      break
    case 'brand':
      router.push(`/brand/detail/${item.favoriteId}`)
      break
    case 'knowledge':
      router.push(`/knowledge/detail/${item.favoriteId}`)
      break
  }
}

// 取消收藏
const removeFavorite = (item) => {
  showDialog({
    title: '取消收藏',
    message: `确定要取消收藏"${item.name}"吗？`,
    showCancelButton: true,
  })
    .then(async () => {
      try {
        // 调用API删除收藏
        const res = await deleteFavorite(item.id)
        if (res.success) {
          // 更新UI
          allFavorites.value = allFavorites.value.filter(i => i.id !== item.id)
          // 更新分类收藏列表
          updateFilteredFavorites()
          showToast('已取消收藏')
        } else {
          showToast(res.message || '取消收藏失败')
        }
      } catch (error) {
        console.error('取消收藏失败:', error)
        showToast('取消收藏失败，请稍后重试')
      }
    })
    .catch(() => {
      // 取消操作
    })
}

const onClickLeft = () => {
  router.back()
}

// 组件挂载时加载数据
onMounted(() => {
  // 检查登录状态
  const userId = getUserId()
  isLoggedIn.value = !!userId
  
  if (isLoggedIn.value) {
    loadAllFavorites()
  }
})
</script>

<style scoped>
.favorite-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding-bottom: 20px;
}

.favorite-list {
  padding: 8px;
}

.favorite-item {
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.favorite-content {
  display: flex;
  align-items: center;
  padding: 12px;
}

.favorite-info {
  flex: 1;
  margin-left: 12px;
}

.favorite-name {
  font-size: 16px;
  margin-bottom: 4px;
}

.favorite-type {
  font-size: 14px;
  color: #999;
  margin-bottom: 4px;
}

.favorite-time {
  font-size: 12px;
  color: #999;
}

.favorite-action {
  display: flex;
  justify-content: flex-end;
  padding: 0 12px 12px;
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