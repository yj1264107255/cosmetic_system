<template>
  <div class="brand-container">
    <van-nav-bar title="品牌查询" />
    
    <div class="search-box">
      <van-search
        v-model="searchValue"
        placeholder="搜索品牌名称"
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
        <van-dropdown-item v-model="country" :options="countryOptions" @change="handleFilterChange" />
        <van-dropdown-item v-model="sort" :options="sortOptions" @change="handleFilterChange" />
      </van-dropdown-menu>
    </div>
    
    <div class="content">
      <van-empty v-if="!loading && brands.length === 0" description="暂无数据" />
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div class="brand-list">
            <div
              v-for="item in brands"
              :key="item.id"
              class="brand-item"
              @click="goToDetail(item.id)"
            >
              <div class="brand-logo">
                <van-image
                  width="60"
                  height="60"
                  fit="contain"
                  :src="item.logo || 'https://img01.yzcdn.cn/vant/cat.jpeg'"
                />
              </div>
              <div class="brand-info">
                <div class="brand-name">{{ item.name }}</div>
                <div class="brand-country" v-if="item.country">{{ item.country }} <span v-if="item.foundedYear">· {{ item.foundedYear }}年成立</span></div>
                <div class="brand-desc">{{ item.description || '暂无描述' }}</div>
              </div>
              <van-icon name="arrow" />
            </div>
          </div>
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
import { getBrandList, searchBrand } from '@/api/brand'

const router = useRouter()
const searchValue = ref('')
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const brands = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isSearching = ref(false)

const country = ref('')
const sort = ref('default')

// 国家选项
const countryOptions = [
  { text: '全部国家', value: '' },
  { text: '中国', value: '中国' },
  { text: '日本', value: '日本' },
  { text: '韩国', value: '韩国' },
  { text: '法国', value: '法国' },
  { text: '美国', value: '美国' }
]

// 排序选项
const sortOptions = [
  { text: '默认排序', value: 'default' },
  { text: '成立时间升序', value: 'year_asc' },
  { text: '成立时间降序', value: 'year_desc' },
  { text: '名称排序', value: 'name' }
]

// 监听国家筛选条件变化
watch([country], () => {
  if (!isSearching.value) {
    resetList()
    loadBrands()
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

    const res = await searchBrand(searchValue.value.trim())
    closeToast()

    if (res.success) {
      brands.value = res.data || []
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
  loadBrands()
}

// 重置列表
const resetList = () => {
  brands.value = []
  currentPage.value = 1
  finished.value = false
  loading.value = false
}

// 加载品牌列表
const loadBrands = async () => {
  if (loading.value) return

  loading.value = true

  try {
    const res = await getBrandList(
      currentPage.value,
      pageSize.value,
      searchValue.value.trim() || null
    )

    if (res.success) {
      const newItems = res.data.list || []
      brands.value = [...brands.value, ...newItems]
      total.value = res.data.total || 0

      // 执行筛选和排序
      filterAndSortBrands()

      // 判断是否已加载全部数据
      finished.value = brands.value.length >= total.value
      currentPage.value++
    } else {
      showToast(res.message || '获取品牌列表失败')
      finished.value = true
    }
  } catch (error) {
    console.error('获取品牌列表失败:', error)
    showToast('获取数据失败，请稍后重试')
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 根据条件筛选和排序品牌
const filterAndSortBrands = () => {
  // 先根据国家筛选
  if (country.value) {
    brands.value = brands.value.filter(brand => brand.country === country.value)
  }

  // 再进行排序
  switch (sort.value) {
    case 'year_asc':
      brands.value.sort((a, b) => {
        if (!a.foundedYear) return 1
        if (!b.foundedYear) return -1
        return a.foundedYear - b.foundedYear
      })
      break
    case 'year_desc':
      brands.value.sort((a, b) => {
        if (!a.foundedYear) return 1
        if (!b.foundedYear) return -1
        return b.foundedYear - a.foundedYear
      })
      break
    case 'name':
      brands.value.sort((a, b) => a.name.localeCompare(b.name))
      break
    default:
      // 默认排序，不做额外处理
      break
  }
}

// 处理筛选条件变化
const handleFilterChange = () => {
  resetList()
  loadBrands()
}

// 加载更多
const onLoad = () => {
  if (isSearching.value) {
    loading.value = false
    return
  }
  loadBrands()
}

// 下拉刷新
const onRefresh = () => {
  resetList()
  loadBrands()
}

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/brand/detail/${id}`)
}

// 组件挂载时加载数据
onMounted(() => {
  loadBrands()
})
</script>

<style scoped>
.brand-container {
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

.brand-list {
  padding: 8px 0;
}

.brand-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 8px;
}

.brand-info {
  flex: 1;
  margin-left: 12px;
}

.brand-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.brand-country {
  font-size: 14px;
  color: #999;
  margin-bottom: 4px;
}

.brand-desc {
  font-size: 14px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 