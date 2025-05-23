<template>
  <div class="brand-detail">
    <van-nav-bar
      :title="brand.name || '品牌详情'"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <div class="content">
      <van-skeleton title avatar :row="10" :loading="loading">
        <!-- 品牌基本信息 -->
        <div class="brand-info">
          <div class="brand-header">
            <van-image
              width="80"
              height="80"
              fit="contain"
              :src="brand.logo || 'https://img01.yzcdn.cn/vant/cat.jpeg'"
              class="brand-logo"
            />
            <h2 class="name">{{ brand.name }}</h2>
            <div class="country" v-if="brand.country || brand.foundedYear">
              {{ brand.country || '未知国家' }} 
              <span v-if="brand.foundedYear">· {{ brand.foundedYear }}年成立</span>
            </div>
          </div>
          
          <van-divider />
          
          <!-- 品牌描述 -->
          <div class="section" v-if="brand.description">
            <h3>品牌简介</h3>
            <p>{{ brand.description }}</p>
          </div>
          
          <!-- 品牌故事 -->
          <div class="section" v-if="brand.brandStory">
            <h3>品牌故事</h3>
            <p>{{ brand.brandStory }}</p>
          </div>
          
          <!-- 企业资质 -->
          <div class="section" v-if="brand.licenseImg || brand.qualityReport">
            <h3>企业资质</h3>
            <div class="qualification">
              <div class="qualification-item" v-if="brand.licenseImg" @click="previewImage(brand.licenseImg)">
                <van-image
                  width="100"
                  height="100"
                  fit="cover"
                  :src="brand.licenseImg"
                />
                <div class="qualification-name">营业执照</div>
              </div>
              <div class="qualification-item" v-if="brand.qualityReport" @click="previewImage(brand.qualityReport)">
                <van-image
                  width="100"
                  height="100"
                  fit="cover"
                  :src="brand.qualityReport"
                />
                <div class="qualification-name">质检报告</div>
              </div>
            </div>
          </div>
          
          <!-- 品牌产品 -->
          <div class="section" v-if="products.length > 0">
            <h3>品牌产品</h3>
            <div class="product-list">
              <div
                v-for="item in products"
                :key="item.id"
                class="product-item"
                @click="goToProduct(item.id)"
              >
                <van-image
                  width="100"
                  height="100"
                  fit="cover"
                  :src="item.image || 'https://img01.yzcdn.cn/vant/cat.jpeg'"
                />
                <div class="product-name">{{ item.name }}</div>
                <div class="product-price" v-if="item.price">¥{{ item.price.toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </div>
      </van-skeleton>
    </div>
    
    <div class="action-bar">
      <van-button :class="['collect-button', isFavorite ? 'collected' : '']" block @click="toggleFavorite">
        {{ isFavorite ? '已收藏' : '收藏品牌' }}
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showImagePreview, showLoadingToast, closeToast, showDialog } from 'vant'
import { getBrandDetail, getBrandProducts } from '@/api/brand'
import { checkFavorite, addFavorite, cancelFavorite } from '@/api/favorite'
import { addHistory } from '@/api/history'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const brand = ref({})
const products = ref([])
const isFavorite = ref(false)

// 监听路由参数变化
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    fetchBrandDetail()
  }
}, { immediate: false })

// 获取品牌详情
const fetchBrandDetail = async () => {
  const id = route.params.id
  if (!id) {
    showToast('无效的品牌ID')
    router.back()
    return
  }

  // 重置状态，避免显示旧数据
  brand.value = {}
  products.value = []
  loading.value = true

  try {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })

    // 获取品牌详情
    const brandRes = await getBrandDetail(id)
    if (brandRes.success) {
      brand.value = brandRes.data || {}
      
      // 设置文档标题
      document.title = brand.value.name || '品牌详情'
      
      // 记录浏览历史
      recordViewHistory(id, brand.value.name)
      
      // 获取品牌产品
      const productsRes = await getBrandProducts(id)
      if (productsRes.success) {
        products.value = productsRes.data || []
      }

      // 检查是否已收藏
      await checkIsFavorite()
    } else {
      showToast(brandRes.message || '获取品牌详情失败')
    }
  } catch (error) {
    console.error('获取品牌详情失败:', error)
    showToast('获取品牌详情失败，请稍后重试')
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
    searchType: 'brand',
    keyword: keyword || '未知品牌',
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
    const res = await checkFavorite(userId, 'brand', id)
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

// 预览图片
const previewImage = (url) => {
  if (url) {
    showImagePreview([url])
  }
}

// 跳转到产品详情页
const goToProduct = (id) => {
  router.push(`/product/detail/${id}`)
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
        query: { redirect: `/brand/detail/${route.params.id}` }
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
      const res = await cancelFavorite(userId, 'brand', id)
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
        favoriteType: 'brand',
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
  fetchBrandDetail()
})
</script>

<style scoped>
.brand-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 60px;
}

.content {
  padding: 16px;
}

.brand-header {
  background-color: #fff;
  text-align: center;
  margin-bottom: 16px;
  padding: 20px;
  border-radius: 8px;
}

.brand-logo {
  margin-bottom: 12px;
}

.name {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: bold;
}

.country {
  color: #999;
  font-size: 14px;
}

.section {
  background-color: #fff;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
}

.section h3 {
  font-size: 16px;
  margin: 0 0 8px;
  color: #323233;
}

.section p {
  margin: 0;
  color: #646566;
  line-height: 1.6;
}

.qualification {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.qualification-item {
  text-align: center;
}

.qualification-name {
  margin-top: 8px;
  font-size: 14px;
  color: #646566;
}

.product-list {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding: 8px 0;
}

.product-item {
  flex: 0 0 auto;
  width: 100px;
  text-align: center;
}

.product-name {
  margin-top: 8px;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  color: #f44;
  font-size: 14px;
  margin-top: 4px;
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