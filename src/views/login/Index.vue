<template>
  <div class="login-container">
    <van-nav-bar title="用户登录" left-arrow @click-left="onClickLeft" />
    
    <div class="login-form">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
          <van-field
            v-model="password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
        </van-cell-group>
        
        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit" :loading="loading">登录</van-button>
          <div class="register-link">
            <span @click="toRegister">没有账号？立即注册</span>
            <span class="server-setting" @click="showSettings = true">设置服务器</span>
          </div>
        </div>
      </van-form>
    </div>
    
    <!-- 使用独立组件来显示服务器设置 -->
    <ServerSettings 
      v-if="showSettings" 
      :show="showSettings" 
      @close="showSettings = false"
      @save="onServerSettingsSaved"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { login } from '@/api/auth'
import ServerSettings from '@/components/ServerSettings.vue'

const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const loading = ref(false)
const showSettings = ref(false)

const onSubmit = async (values) => {
  try {
    loading.value = true
    showLoadingToast({
      message: '登录中...',
      forbidClick: true,
      duration: 0
    })
    
    console.log('发送登录请求:', values.username)
    
    const res = await login({
      username: values.username,
      password: values.password
    })
    
    closeToast()
    
    console.log('登录响应:', res)
    
    if (res.success) {
      showToast({
        type: 'success',
        message: '登录成功'
      })
      
      // 保存登录信息
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
      localStorage.setItem('userId', res.data.userInfo.id)
      
      // 获取重定向地址或默认跳转到首页
      const redirect = route.query.redirect || '/mine'
      router.replace(redirect)
    } else {
      showToast({
        type: 'fail',
        message: res.message || '登录失败'
      })
    }
  } catch (error) {
    console.error('登录失败:', error)
    showToast({
      type: 'fail',
      message: error.message || '登录失败，请稍后重试'
    })
  } finally {
    loading.value = false
    closeToast()
  }
}

// 服务器设置保存成功的回调
const onServerSettingsSaved = () => {
  showToast('服务器设置已更新')
}

const onClickLeft = () => {
  router.back()
}

const toRegister = () => {
  router.push('/register')
}
</script>

<style>
/* 登录页样式 */
.login-container {
  height: 100vh;
  background-color: #f7f8fa;
}

.login-form {
  padding: 20px 0;
}

.register-link {
  margin-top: 16px;
  text-align: center;
  color: #1989fa;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}

.server-setting {
  color: #1989fa;
}
</style> 