<template>
  <div class="product-container">
    <van-nav-bar title="产品查询" />
    
    <div class="search-box">
      <van-search
        v-model="searchValue"
        placeholder="搜索产品名称"
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
    
    <div class="filter-bar" v-if="!isSearching">
      <van-dropdown-menu>
        <van-dropdown-item v-model="category" :options="categoryOptions" @change="handleFilterChange" />
        <van-dropdown-item v-model="sort" :options="sortOptions" @change="handleFilterChange" />
      </van-dropdown-menu>
    </div>
    
    <div class="content">
      <van-empty v-if="!loading && products.length === 0" description="暂无数据" />
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-card
            v-for="item in products"
            :key="item.id"
            :price="item.price ? item.price.toFixed(2) : '暂无价格'"
            :desc="item.description || '暂无描述'"
            :title="item.name"
            :thumb="item.image || 'https://img01.yzcdn.cn/vant/ipad.jpeg'"
            @click="goToDetail(item.id)"
          >
            <template #tags>
              <van-tag type="success" v-if="item.safetyScore >= 4">安全</van-tag>
              <van-tag type="warning" v-else-if="item.safetyScore >= 3">一般</van-tag>
              <van-tag type="danger" v-else-if="item.safetyScore">谨慎</van-tag>
            </template>
            <template #footer>
              <van-rate v-if="item.effectivenessScore" v-model="item.effectivenessScore" readonly allow-half />
            </template>
          </van-card>
        </van-list>
      </van-pull-refresh>
    </div>
    
    <!-- 底部导航栏 -->
    <TabBar />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import TabBar from '@/components/TabBar.vue'
import { getProductList, searchProduct, getProductsByCategory } from '@/api/product'

const router = useRouter()
const searchValue = ref('')
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const products = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isSearching = ref(false)

const category = ref('')
const sort = ref('default')

// 分类选项
const categoryOptions = [
  { text: '全部分类', value: '' },
  { text: '洁面', value: '洁面' },
  { text: '爽肤水', value: '爽肤水' },
  { text: '精华', value: '精华' },
  { text: '面霜', value: '面霜' },
  { text: '防晒', value: '防晒' }
]

// 排序选项
const sortOptions = [
  { text: '默认排序', value: 'default' },
  { text: '价格从低到高', value: 'price_asc' },
  { text: '价格从高到低', value: 'price_desc' },
  { text: '评分从高到低', value: 'rating_desc' }
]

// 监听筛选条件变化
watch([category], () => {
  if (!isSearching.value) {
    resetList()
    loadProducts()
  }
})

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

    const res = await searchProduct(searchValue.value.trim())
    closeToast()

    if (res.success) {
      products.value = res.data || []
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
  loadProducts()
}

// 重置列表
const resetList = () => {
  products.value = []
  currentPage.value = 1
  finished.value = false
  loading.value = false
}

// 加载产品列表
const loadProducts = async () => {
  if (loading.value) return

  loading.value = true

  try {
    const res = await getProductList(
      currentPage.value,
      pageSize.value,
      searchValue.value.trim() || null,
      null,
      category.value || null
    )

    if (res.success) {
      const newItems = res.data.list || []
      products.value = [...products.value, ...newItems]
      total.value = res.data.total || 0

      // 执行排序
      sortProducts()

      // 判断是否已加载全部数据
      finished.value = products.value.length >= total.value
      currentPage.value++
    } else {
      showToast(res.message || '获取产品列表失败')
      finished.value = true
    }
  } catch (error) {
    console.error('获取产品列表失败:', error)
    showToast('获取数据失败，请稍后重试')
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 处理排序
const sortProducts = () => {
  switch (sort.value) {
    case 'price_asc':
      products.value.sort((a, b) => {
        if (!a.price) return 1
        if (!b.price) return -1
        return a.price - b.price
      })
      break
    case 'price_desc':
      products.value.sort((a, b) => {
        if (!a.price) return 1
        if (!b.price) return -1
        return b.price - a.price
      })
      break
    case 'rating_desc':
      products.value.sort((a, b) => {
        if (!a.effectivenessScore) return 1
        if (!b.effectivenessScore) return -1
        return b.effectivenessScore - a.effectivenessScore
      })
      break
    default:
      // 默认排序，不做额外处理
      break
  }
}

// 处理筛选条件变化
const handleFilterChange = () => {
  resetList()
  if (sort.value !== 'default') {
    sortProducts()
  } else {
    loadProducts()
  }
}

// 加载更多
const onLoad = () => {
  if (isSearching.value) {
    loading.value = false
    return
  }
  loadProducts()
}

// 下拉刷新
const onRefresh = () => {
  resetList()
  loadProducts()
}

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/product/detail/${id}`)
}

// 组件挂载时加载数据
onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.product-container {
  min-height: 100vh;
  padding-bottom: 50px;
  background-color: #f7f8fa;
}

.search-box {
  position: sticky;
  top: 0;
  z-index: 100;
}

.filter-bar {
  position: sticky;
  top: 54px;
  z-index: 99;
}

.content {
  padding: 8px;
}

.van-card {
  margin-bottom: 8px;
  background-color: #fff;
}
</style> 