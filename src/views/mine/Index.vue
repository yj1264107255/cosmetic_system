<template>
  <div class="mine-container">
    <van-nav-bar title="个人中心" />
    
    <div class="user-info">
      <van-image
        round
        width="80"
        height="80"
        :src="userInfo.avatar || 'https://img01.yzcdn.cn/vant/cat.jpeg'"
      />
      <div class="user-detail" v-if="isLogin">
        <div class="username">{{ userInfo.username }}</div>
        <div class="email">{{ userInfo.email || userInfo.phone || '未设置' }}</div>
      </div>
      <div class="login-btn" v-else>
        <van-button type="primary" size="small" @click="toLogin">登录/注册</van-button>
      </div>
    </div>
    
    <div class="menu-list">
      <van-cell-group inset>
        <van-cell title="我的收藏" is-link to="/favorite" />
        <van-cell title="我的评价" is-link to="/my-reviews" />
        <van-cell title="浏览历史" is-link to="/history" />
        <van-cell title="账号设置" is-link to="/settings" />
        <van-cell title="关于我们" is-link to="/about" />
      </van-cell-group>
      
      <div class="logout-btn" v-if="isLogin">
        <van-button block @click="confirmLogout">退出登录</van-button>
      </div>
    </div>
    
    <!-- 底部导航栏 -->
    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import TabBar from '@/components/TabBar.vue'
import { getCurrentUser, logout as apiLogout } from '@/api/auth'

const router = useRouter()

// 用户数据
const userInfo = ref({})

// 判断是否登录
const isLogin = computed(() => {
  return localStorage.getItem('token') !== null
})

// 获取用户信息
const getUserInfo = async () => {
  if (!isLogin.value) return
  
  try {
    // 尝试从本地存储获取用户信息
    const localUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    
    if (localUserInfo && localUserInfo.id) {
      userInfo.value = localUserInfo
    } else {
      // 如果本地没有，则从服务器获取
      const res = await getCurrentUser()
      if (res.success) {
        userInfo.value = res.data
        localStorage.setItem('userInfo', JSON.stringify(res.data))
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 跳转到登录页
const toLogin = () => {
  router.push('/login')
}

// 确认退出登录
const confirmLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出登录吗？',
  })
    .then(() => {
      handleLogout()
    })
    .catch(() => {
      // 取消操作
    })
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await apiLogout()
    // 清除本地存储的登录信息
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    
    showToast({
      type: 'success',
      message: '已退出登录'
    })
    
    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    
    // 即使API调用失败，也清除本地信息确保用户可以退出
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    
    showToast('已退出登录')
    router.push('/login')
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  getUserInfo()
})
</script>

<style scoped>
.mine-container {
  padding-bottom: 50px;
  min-height: 100vh;
  background-color: #f7f8fa;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 30px 16px;
  background-color: #fff;
}

.user-detail {
  margin-left: 16px;
}

.username {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.email {
  font-size: 14px;
  color: #999;
}

.login-btn {
  margin-left: 16px;
}

.menu-list {
  margin-top: 12px;
}

.logout-btn {
  margin: 20px 16px;
}
</style> 