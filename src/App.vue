<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <component 
        :is="Component" 
        v-if="Component" 
        :key="$route.path"
      />
    </router-view>
  </div>
</template>

<script setup>
// 组件逻辑代码
import { useRoute } from 'vue-router'

const $route = useRoute()
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f7f8fa;
  color: #323233;
}

.app-container {
  width: 100%;
  height: 100%;
}
</style> 