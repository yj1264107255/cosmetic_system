<template>
  <div class="publish-review">
    <van-nav-bar
      title="发布测评"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <div class="form-container">
      <van-form @submit="onSubmit">
        <!-- 标题 -->
        <van-field
          v-model="formData.title"
          name="title"
          label="标题"
          placeholder="请输入测评标题"
          :rules="[{ required: true, message: '请填写标题' }]"
        />
        
        <!-- 产品选择 -->
        <van-field
          v-model="productName"
          is-link
          readonly
          name="product"
          label="关联产品"
          placeholder="选择产品（可选）"
          @click="showProductPicker = true"
        />
        
        <!-- 评分 -->
        <van-field name="rating" label="评分">
          <template #input>
            <van-rate v-model="formData.rating" allow-half />
          </template>
        </van-field>
        
        <!-- 内容 -->
        <van-field
          v-model="formData.content"
          name="content"
          label="内容"
          type="textarea"
          rows="6"
          autosize
          placeholder="分享你的使用体验和心得..."
          :rules="[{ required: true, message: '请填写测评内容' }]"
        />
        
        <!-- 优点 -->
        <van-field
          v-model="formData.pros"
          name="pros"
          label="优点"
          type="textarea"
          rows="2"
          autosize
          placeholder="产品的优点..."
        />
        
        <!-- 缺点 -->
        <van-field
          v-model="formData.cons"
          name="cons"
          label="缺点"
          type="textarea"
          rows="2"
          autosize
          placeholder="产品的缺点..."
        />
        
        <!-- 肤质 -->
        <van-field
          v-model="formData.skinType"
          name="skinType"
          label="肤质"
          placeholder="请输入你的肤质"
        />
        
        <!-- 使用时长 -->
        <van-field
          v-model="formData.usageDuration"
          name="usageDuration"
          label="使用时长"
          placeholder="例如：1个月"
        />
        
        <!-- 标签 -->
        <van-field
          v-model="tagsText"
          name="tags"
          label="标签"
          placeholder="多个标签用逗号分隔"
        />
        
        <!-- 图片上传 -->
        <div class="uploader-container">
          <div class="uploader-label">添加图片</div>
          <van-uploader
            v-model="fileList"
            multiple
            :max-count="9"
            :after-read="afterRead"
            :before-delete="beforeDelete"
          />
        </div>
        
        <!-- 状态 -->
        <van-field name="status" label="状态">
          <template #input>
            <van-radio-group v-model="formData.status" direction="horizontal">
              <van-radio :name="1">立即发布</van-radio>
              <van-radio :name="0">保存草稿</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        
        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit" :loading="submitting">
            {{ formData.status === 1 ? '发布测评' : '保存草稿' }}
          </van-button>
        </div>
      </van-form>
    </div>
    
    <!-- 产品选择弹窗 -->
    <van-popup v-model:show="showProductPicker" position="bottom" :style="{ height: '50%' }">
      <div class="picker-wrapper">
        <div class="picker-header">
          <div class="picker-title">选择产品</div>
          <div class="picker-close" @click="closeProductPicker">
            <van-icon name="cross" />
          </div>
        </div>
        <div class="product-search">
          <van-search
            v-model="productSearchKeyword"
            placeholder="搜索产品名称"
            @search="searchProducts"
            @update:model-value="searchProducts"
          />
        </div>
        <div class="product-list">
          <div v-if="filteredProducts.length === 0" class="empty-tip">暂无匹配产品</div>
          <van-cell
            v-for="item in filteredProducts"
            :key="item.id"
            :title="item.name"
            :label="item.description || item.brandName || '暂无描述'"
            clickable
            @click="selectProduct(item)"
          >
            <template #icon>
              <van-image
                v-if="item.image"
                :src="item.image"
                width="40"
                height="40"
                style="margin-right: 10px;"
              />
            </template>
          </van-cell>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { addReviewPost } from '@/api/reviewPost'
import { getProductList } from '@/api/product'  // 假设有此API

const router = useRouter()
const submitting = ref(false)
const showProductPicker = ref(false)
const products = ref([])
const productSearchKeyword = ref('')
const fileList = ref([])
const userId = ref(localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null)

// 表单数据
const formData = ref({
  title: '',
  productId: null,
  rating: 5,
  content: '',
  pros: '',
  cons: '',
  skinType: '',
  usageDuration: '',
  tags: '',
  images: '',
  status: 1
})

// 产品选择器列
const productColumns = computed(() => {
  return products.value.map(item => ({
    text: item.name,
    value: item.id
  }))
})

// 产品名称
const productName = computed(() => {
  if (!formData.value.productId) return ''
  const product = products.value.find(item => item.id === formData.value.productId)
  console.log('当前选中的产品ID:', formData.value.productId)
  console.log('匹配到的产品:', product)
  return product ? product.name : ''
})

// 标签文本
const tagsText = computed({
  get() {
    return formData.value.tags || ''
  },
  set(val) {
    formData.value.tags = val
  }
})

// 过滤后的产品列表
const filteredProducts = computed(() => {
  if (!productSearchKeyword.value) {
    return products.value
  }
  const keyword = productSearchKeyword.value.toLowerCase()
  return products.value.filter(item => 
    item.name.toLowerCase().includes(keyword) || 
    (item.description && item.description.toLowerCase().includes(keyword)) ||
    (item.brandName && item.brandName.toLowerCase().includes(keyword))
  )
})

// 返回上一页
const onClickLeft = () => {
  if (formData.value.title || formData.value.content || fileList.value.length > 0) {
    showDialog({
      title: '提示',
      message: '是否放弃编辑？',
      showCancelButton: true,
    }).then(() => {
      router.back()
    }).catch(() => {
      // 取消操作
    })
  } else {
    router.back()
  }
}

// 获取产品列表
const fetchProducts = async () => {
  try {
    const res = await getProductList(1, 100) // 获取更多产品，以便显示完整列表
    if (res.success && res.data) {
      products.value = res.data.list || []
      console.log('获取到产品列表:', products.value)
    } else {
      console.error('获取产品列表失败:', res.message)
      showToast('获取产品列表失败')
    }
  } catch (error) {
    console.error('获取产品列表失败:', error)
    showToast('获取产品列表失败')
  }
}

// 确认选择产品
const onProductConfirm = (value) => {
  console.log('选中产品:', value)
  if (value && value.value) {
    formData.value.productId = value.value
    showProductPicker.value = false
  }
}

// 直接选择产品
const selectProduct = (product) => {
  console.log('选中产品:', product)
  if (product && product.id) {
    formData.value.productId = product.id
    showProductPicker.value = false
    productSearchKeyword.value = '' // 清空搜索关键词
  }
}

// 关闭产品选择器
const closeProductPicker = () => {
  showProductPicker.value = false
  productSearchKeyword.value = '' // 清空搜索关键词
}

// 上传图片后处理
const afterRead = (file) => {
  // 实际项目中应该调用上传API
  // 这里简化处理，直接使用本地URL
  console.log('文件上传成功', file)
  
  // 提示：实际项目应该实现文件上传逻辑
  showToast('图片上传中...')
}

// 删除图片前确认
const beforeDelete = () => {
  return new Promise((resolve) => {
    showDialog({
      title: '提示',
      message: '是否删除这张图片？',
      showCancelButton: true,
    }).then(() => {
      resolve(true)
    }).catch(() => {
      resolve(false)
    })
  })
}

// 搜索产品
const searchProducts = () => {
  // 直接通过计算属性filteredProducts过滤
  console.log('搜索关键词:', productSearchKeyword.value)
}

// 提交表单
const onSubmit = async () => {
  if (!userId.value) {
    showToast('请先登录')
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    return
  }
  
  submitting.value = true
  
  try {
    // 处理图片上传结果
    const imageUrls = fileList.value.map(item => {
      // 实际项目中应该返回服务器保存的URL
      return item.content || item.url || ''
    }).filter(Boolean)
    
    // 构建提交数据
    const postData = {
      ...formData.value,
      userId: userId.value,
      images: imageUrls.join(',')
    }
    
    const res = await addReviewPost(postData)
    if (res.success) {
      showToast(formData.value.status === 1 ? '发布成功' : '草稿已保存')
      
      // 跳转到详情页或列表页
      if (formData.value.status === 1 && res.data) {
        setTimeout(() => {
          router.push(`/review/detail/${res.data}`)
        }, 1500)
      } else {
        setTimeout(() => {
          router.push('/review')
        }, 1500)
      }
    } else {
      showToast(res.message || '发布失败')
    }
  } catch (error) {
    console.error('发布测评失败:', error)
    showToast('发布失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // 检查登录状态
  if (!userId.value) {
    showToast('请先登录')
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    return
  }
  
  // 获取产品列表
  fetchProducts()
})
</script>

<style scoped>
.publish-review {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40px;
}

.form-container {
  padding: 16px;
  background-color: #fff;
}

.uploader-container {
  padding: 16px;
}

.uploader-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #646566;
}

:deep(.van-uploader__preview) {
  margin: 0 8px 8px 0;
}

:deep(.van-cell__title) {
  width: 80px;
  flex: none;
}

/* 产品选择器样式 */
.picker-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.picker-title {
  font-size: 16px;
  font-weight: bold;
}

.picker-close {
  padding: 4px;
}

.product-search {
  padding: 16px;
}

.product-list {
  flex: 1;
  overflow-y: auto;
}

.empty-tip {
  padding: 40px 0;
  text-align: center;
  color: #999;
}
</style> 