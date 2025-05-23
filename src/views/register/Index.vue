<template>
  <div class="register-container">
    <van-nav-bar title="用户注册" left-arrow @click-left="onClickLeft" />
    
    <div class="register-form">
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
            :rules="[
              { required: true, message: '请填写密码' },
              { validator: validatePassword, message: '密码长度至少6位' }
            ]"
          />
          <van-field
            v-model="confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="[
              { required: true, message: '请确认密码' },
              { validator: validateConfirmPassword, message: '两次输入密码不一致' }
            ]"
          />
          <van-field
            v-model="phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[
              { required: true, message: '请填写手机号' },
              { validator: validatePhone, message: '手机号格式不正确' }
            ]"
          />
          <van-field
            v-model="email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱(选填)"
            :rules="[
              { validator: validateEmail, message: '邮箱格式不正确' }
            ]"
          />
        </van-cell-group>
        
        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit" :loading="loading">注册</van-button>
          <div class="login-link">
            <span @click="toLogin">已有账号？立即登录</span>
          </div>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { register } from '@/api/auth'

const router = useRouter()
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const phone = ref('')
const email = ref('')
const loading = ref(false)

// 密码验证
const validatePassword = val => val.length >= 6
// 确认密码验证
const validateConfirmPassword = val => val === password.value
// 手机号验证
const validatePhone = val => /^1[3-9]\d{9}$/.test(val)
// 邮箱验证
const validateEmail = val => {
  if (!val) return true
  return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(val)
}

const onSubmit = async (values) => {
  try {
    loading.value = true
    showLoadingToast({
      message: '注册中...',
      forbidClick: true,
      duration: 0
    })
    
    console.log('发送注册请求:', values.username)
    
    const res = await register({
      username: values.username,
      password: values.password,
      phone: values.phone,
      email: values.email || null
    })
    
    closeToast()
    
    console.log('注册响应:', res)
    
    if (res.success) {
      showToast({
        type: 'success',
        message: '注册成功'
      })
      
      // 注册成功后跳转到登录页
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      showToast({
        type: 'fail',
        message: res.message || '注册失败'
      })
    }
  } catch (error) {
    console.error('注册失败:', error)
    showToast({
      type: 'fail',
      message: error.message || '注册失败，请稍后重试'
    })
  } finally {
    loading.value = false
    closeToast()
  }
}

const onClickLeft = () => {
  router.back()
}

const toLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  background-color: #f7f8fa;
}

.register-form {
  padding: 20px 0;
}

.login-link {
  margin-top: 16px;
  text-align: center;
  color: #1989fa;
  font-size: 14px;
}
</style> 