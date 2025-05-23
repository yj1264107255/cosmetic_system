<template>
  <div class="server-settings-overlay" v-if="show">
    <div class="server-settings-container">
      <div class="server-settings-header">
        <h3>服务器设置</h3>
        <span class="close-btn" @click="$emit('close')">×</span>
      </div>
      
      <div class="server-settings-content">
        <div class="form-item">
          <label>协议:</label>
          <input 
            v-model="config.protocol" 
            placeholder="例如: http 或 https"
          />
        </div>
        
        <div class="form-item">
          <label>服务器IP/域名:</label>
          <input 
            v-model="config.host" 
            placeholder="例如: 192.168.1.100" 
            required
          />
        </div>
        
        <div class="form-item">
          <label>端口:</label>
          <input 
            v-model="config.port" 
            placeholder="例如: 8080" 
            required
          />
        </div>
        
        <div class="form-item">
          <label>接口前缀:</label>
          <input 
            v-model="config.prefix" 
            placeholder="例如: /api"
          />
        </div>
        
        <div class="current-url">
          当前服务器地址: {{ currentUrl }}
        </div>
      </div>
      
      <div class="server-settings-buttons">
        <div class="action-buttons">
          <button class="test-btn" @click="testConnection">测试连接</button>
          <button class="reset-btn" @click="resetConfig">恢复默认</button>
        </div>
        
        <div class="dialog-buttons">
          <button class="cancel-btn" @click="$emit('close')">取消</button>
          <button class="save-btn" @click="saveConfig">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { showToast, showLoadingToast, closeToast, showSuccessToast } from 'vant'
import { getServerConfig, setServerConfig, resetServerConfig, defaultConfig } from '@/utils/serverConfig'
import { updateBaseUrl } from '@/utils/request'
import axios from 'axios'

// 组件属性
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

// 组件事件
const emit = defineEmits(['close', 'save'])

// 初始化服务器配置
const config = reactive({...getServerConfig()})

// 计算当前完整的服务器URL
const currentUrl = computed(() => {
  const { protocol, host, port, prefix } = config
  if (port) {
    return `${protocol}://${host}:${port}${prefix}`
  } else {
    return `${protocol}://${host}${prefix}`
  }
})

// 保存服务器配置
const saveConfig = () => {
  try {
    if (!config.host) {
      showToast('服务器地址不能为空')
      return
    }
    
    setServerConfig({
      protocol: config.protocol,
      host: config.host,
      port: config.port,
      prefix: config.prefix
    })
    
    // 更新请求基础地址
    updateBaseUrl()
    
    showSuccessToast('服务器设置已保存')
    emit('save')
    emit('close')
  } catch (error) {
    console.error('保存服务器配置失败:', error)
    showToast('保存设置失败')
  }
}

// 重置服务器配置
const resetConfig = () => {
  const defaults = resetServerConfig()
  Object.keys(defaults).forEach(key => {
    config[key] = defaults[key]
  })
  updateBaseUrl()
  showToast('已恢复默认设置')
}

// 测试服务器连接
const testConnection = async () => {
  try {
    if (!config.host) {
      showToast('请先填写服务器地址')
      return
    }
    
    showLoadingToast({
      message: '测试连接中...',
      forbidClick: true
    })
    
    const url = currentUrl.value + '/auth/ping'
    const timeout = 5000 // 5秒超时
    
    const res = await axios.get(url, { timeout })
    
    closeToast()
    
    if (res.status === 200) {
      showSuccessToast('连接成功！')
    } else {
      showToast('连接失败: ' + res.statusText)
    }
  } catch (error) {
    closeToast()
    console.error('测试连接失败:', error)
    showToast('连接失败: ' + (error.message || '未知错误'))
  }
}
</script>

<style scoped>
.server-settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.server-settings-container {
  width: 90%;
  max-width: 500px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.server-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.server-settings-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #323233;
}

.close-btn {
  font-size: 24px;
  color: #969799;
  cursor: pointer;
}

.server-settings-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  font-size: 14px;
  color: #323233;
  margin-bottom: 8px;
}

.form-item input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  font-size: 14px;
  background-color: #f7f8fa;
  border: 1px solid #ebedf0;
  border-radius: 4px;
  box-sizing: border-box;
}

.current-url {
  margin-top: 16px;
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 4px;
  font-size: 14px;
  color: #646566;
  word-break: break-all;
}

.server-settings-buttons {
  padding: 16px;
  border-top: 1px solid #ebedf0;
}

.action-buttons {
  display: flex;
  margin-bottom: 16px;
}

.test-btn, .reset-btn {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #fff;
}

.test-btn {
  background-color: #1989fa;
  margin-right: 8px;
}

.reset-btn {
  background-color: #ff976a;
}

.dialog-buttons {
  display: flex;
}

.cancel-btn, .save-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 22px;
  font-size: 16px;
}

.cancel-btn {
  background-color: #f7f8fa;
  color: #323233;
  margin-right: 8px;
}

.save-btn {
  background-color: #07c160;
  color: #fff;
}
</style> 