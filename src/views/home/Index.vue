<template>
  <div class="home-container">
    <van-nav-bar title="护肤品成分查询系统" fixed />
    
    <div class="content">
      <!-- 搜索框 -->
      <div class="search-box">
        <van-search
          v-model="searchValue"
          placeholder="搜索成分、产品或品牌"
          shape="round"
          @search="onSearch"
        />
      </div>
      
      <!-- 轮播图 -->
      <div class="banner">
        <van-swipe :autoplay="3000" indicator-color="#ff6b81" :show-indicators="true" :duration="500">
          <van-swipe-item v-for="(item, index) in banners" :key="index">
            <div class="banner-item">
              <img :src="item.img" class="banner-img" />
              <div class="banner-info">
                <div class="banner-title">{{ item.title }}</div>
                <div class="banner-desc">{{ item.desc }}</div>
              </div>
            </div>
          </van-swipe-item>
        </van-swipe>
      </div>
      
      <!-- 功能导航 -->
      <div class="nav-grid">
        <van-grid :column-num="4" icon-size="40">
          <van-grid-item icon="search" text="成分查询" to="/ingredient" />
          <van-grid-item icon="comment-o" text="护肤测评" to="/review" />
          <van-grid-item icon="gift-o" text="产品查询" to="/product" />
          <van-grid-item icon="guide-o" text="成分科普" to="/knowledge" />
        </van-grid>
      </div>
      
      <!-- 测评推荐 -->
      <div class="review-section">
        <div class="section-title">
          <span>测评推荐</span>
          <van-button type="primary" size="mini" plain to="/review">更多</van-button>
        </div>
        <div class="review-list">
          <van-card
            v-for="(item, index) in reviewList.slice(0, 2)"
            :key="index"
            :desc="item.summary"
            :title="item.title"
            :thumb="item.image"
            @click="goToReview(item.id)"
          >
            <template #tags>
              <van-tag plain type="primary">{{ item.user?.username || '匿名用户' }}</van-tag>
            </template>
          </van-card>
        </div>
      </div>
      
      <!-- 成分科普 -->
      <div class="knowledge-section">
        <div class="section-title">
          <span>成分科普</span>
          <van-button type="primary" size="mini" plain to="/knowledge">更多</van-button>
        </div>
        <div class="knowledge-list">
          <van-card
            v-for="(item, index) in knowledgeList"
            :key="index"
            :desc="item.summary"
            :title="item.title"
            :thumb="item.image"
            @click="goToKnowledge(item.id)"
          />
        </div>
      </div>
      
      <!-- 热门产品 -->
      <div class="product-section">
        <div class="section-title">
          <span>热门产品</span>
          <van-button type="primary" size="mini" plain to="/product">更多</van-button>
        </div>
        <div class="product-list">
          <van-card
            v-for="(item, index) in productList"
            :key="index"
            :price="item.price"
            :desc="item.description"
            :title="item.name"
            :thumb="item.image"
            @click="goToProduct(item.id)"
          >
            <template #tags>
              <van-tag type="success" v-if="item.safetyScore && item.safetyScore >= 4">安全</van-tag>
              <van-tag type="warning" v-else-if="item.safetyScore && item.safetyScore >= 3">一般</van-tag>
              <van-tag type="danger" v-else-if="item.safetyScore">谨慎</van-tag>
              <van-tag plain type="primary" style="margin-left: 5px;" v-if="item.brand">{{ item.brand.name }}</van-tag>
            </template>
            <template #footer>
              <div class="product-rating" v-if="item.safetyScore">
                <span>安全评分:</span>
                <van-rate v-model="item.safetyScore" readonly allow-half :size="12" />
              </div>
            </template>
          </van-card>
        </div>
      </div>
    </div>
    
    <!-- 底部导航栏 -->
    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { get } from '@/utils/request'
import TabBar from '@/components/TabBar.vue'
import { getPublishedKnowledge } from '@/api/knowledge'
import { getHotReviewPosts } from '@/api/reviewPost'
import { getHotProducts } from '@/api/product'

const router = useRouter()
const searchValue = ref('')

// 模拟数据
const banners = ref([
  { 
    img: 'https://img0.baidu.com/it/u=575447844,3853459851&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=767',
    title: '科学护肤',
    desc: '了解成分，科学护肤'
  },
  { 
    img: 'https://imgpp.ztupic.com/bup/so/20210330/1b15eaa37bf39eedc7ab18f156e8d955-1.jpg?x-oss-process=image/resize,w_1024/quality,q_85/watermark,image_d2F0ZXIucG5n,type_ZmFuZ3poZW5naGVpdGk',
    title: '产品测评',
    desc: '真实用户体验分享'
  },
  { 
    img: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw1%2Fc88de1d8-d17d-4cd0-b170-46f74c7e4406%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1750579943&t=a14bf8dde36da7c5ecf30de90f1bda0c',
    title: '成分查询',
    desc: '安全有效的护肤品推荐'
  },
])

const knowledgeList = ref([])
const reviewList = ref([])
const productList = ref([])

// 获取科普文章列表
const fetchKnowledgeList = async () => {
  try {
    const res = await getPublishedKnowledge()
    if (res.success) {
      // 获取前2条科普文章
      const list = res.data || []
      knowledgeList.value = list.slice(0, 2).map(item => ({
        id: item.id,
        title: item.title,
        summary: getSummary(item.content),
        image: item.image || 'https://img01.yzcdn.cn/vant/ipad.jpeg'
      }))
    }
  } catch (error) {
    console.error('获取科普文章失败:', error)
  }
}

// 获取内容摘要
const getSummary = (content) => {
  if (!content) return ''
  // 去除HTML标签
  const plainText = content.replace(/<[^>]+>/g, '')
  // 截取前50个字符
  return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText
}

// 获取热门测评
const fetchReviewList = async () => {
  try {
    const userId = localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null
    const res = await getHotReviewPosts(4, userId)
    if (res.success && res.data) {
      reviewList.value = res.data.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.content ? (item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content) : '',
        image: item.imageList && item.imageList.length > 0 ? item.imageList[0] : 'https://bkimg.cdn.bcebos.com/pic/37d3d539b6003af33a878e36e961d15c10385343181b',
        user: item.user
      }))
      console.log('获取的测评图片:', reviewList.value.map(item => item.image))
    }
  } catch (error) {
    console.error('获取热门测评失败:', error)
  }
}

// 获取热门产品
const fetchHotProducts = async () => {
  try {
    const res = await getHotProducts(5)
    if (res.success && res.data) {
      productList.value = res.data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price ? `¥${item.price}` : '价格未知',
        description: item.description || '暂无描述',
        image: item.image || 'https://img01.yzcdn.cn/vant/ipad.jpeg',
        brand: item.brand || null,
        safetyScore: item.safetyScore || 3,
        effectivenessScore: item.effectivenessScore
      }))
      console.log('热门产品列表:', productList.value)
    } else {
      console.error('获取热门产品失败:', res.message)
    }
  } catch (error) {
    console.error('获取热门产品失败:', error)
  }
}

// 页面加载时获取数据
onMounted(async () => {
  try {
    // 获取科普文章数据
    await fetchKnowledgeList()
    // 获取热门测评数据
    await fetchReviewList()
    // 获取热门产品数据
    await fetchHotProducts()
    
    // 实际项目中，这里会调用API获取其他数据
    // const res = await get('/api/home/banners')
    // banners.value = res.data
  } catch (error) {
    console.error('获取首页数据失败', error)
  }
})

// 搜索处理
const onSearch = () => {
  if (!searchValue.value) return
  router.push({
    path: '/search',
    query: { keyword: searchValue.value }
  })
}

// 成分科普详情
const goToKnowledge = (id) => {
  router.push(`/knowledge/detail/${id}`)
}

// 跳转到测评详情
const goToReview = (id) => {
  router.push(`/review/detail/${id}`)
}

// 产品详情
const goToProduct = (id) => {
  router.push(`/product/detail/${id}`)
}
</script>

<style scoped>
.home-container {
  padding-top: 46px;
  padding-bottom: 50px;
}

.content {
  padding: 10px;
}

.search-box {
  margin-bottom: 10px;
}

.banner {
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.banner-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.banner-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  object-position: center;
  border-radius: 8px;
}

.banner-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 15px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  border-radius: 0 0 8px 8px;
}

.banner-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.banner-desc {
  font-size: 14px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.nav-grid {
  margin-bottom: 15px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0 10px;
  padding: 0 5px;
}

.section-title span {
  font-size: 16px;
  font-weight: bold;
}

.knowledge-list, .product-list, .review-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-rating {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.product-rating span {
  margin-right: 5px;
  color: #666;
}

:deep(.van-card) {
  background: #f8f8f8;
  border-radius: 8px;
}

:deep(.van-card__title) {
  font-weight: bold;
}

:deep(.van-card__thumb) {
  width: 90px;
  height: 90px;
}

:deep(.van-card__thumb img) {
  border-radius: 4px;
  object-fit: cover;
}
</style> 