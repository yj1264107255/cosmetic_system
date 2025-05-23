<template>
  <div class="not-found">
    <van-empty description="页面不存在" />
    <van-button type="primary" block @click="goHome">返回首页</van-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
}

.van-button {
  margin-top: 20px;
  width: 200px;
}
</style> 