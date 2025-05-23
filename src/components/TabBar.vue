<template>
  <van-tabbar v-model="active" route safe-area-inset-bottom>
    <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
    <van-tabbar-item to="/ingredient" icon="search">成分查询</van-tabbar-item>
    <van-tabbar-item to="/review" icon="comment-o">测评</van-tabbar-item>
    <van-tabbar-item to="/product" icon="gift-o">产品</van-tabbar-item>
    <van-tabbar-item to="/mine" icon="user-o">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

// 当前激活的标签
const active = ref(0)
const route = useRoute()

// 根据当前路由路径设置激活的标签页
watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/home')) {
      active.value = 0
    } else if (path.startsWith('/ingredient')) {
      active.value = 1
    } else if (path.startsWith('/review')) {
      active.value = 2
    } else if (path.startsWith('/product')) {
      active.value = 3
    } else if (path.startsWith('/mine')) {
      active.value = 4
    }
  },
  { immediate: true }
)
</script>

<style scoped>
/* 自定义样式 */
</style> 