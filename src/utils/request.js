import axios from 'axios'
import { showToast, showFailToast } from 'vant'
import { getBaseUrl } from './serverConfig'

// 判断当前环境
const isDevelopment = process.env.NODE_ENV === 'development'

// 创建axios实例
const service = axios.create({
  // 使用动态baseURL
  baseURL: isDevelopment ? '/api' : getBaseUrl(),
  timeout: 15000 // 请求超时时间
})

// 更新服务器地址的方法
export function updateBaseUrl() {
  if (!isDevelopment) {
    service.defaults.baseURL = getBaseUrl()
    console.log('API基础地址已更新为:', service.defaults.baseURL)
  }
}

// 初始调用一次，确保启动时使用正确的配置
updateBaseUrl()

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从本地存储获取token
    const token = localStorage.getItem('token')
    // 如果有token则附带在请求头中
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    console.log('发送请求:', config.method.toUpperCase(), config.url, '参数:', config.params || config.data)
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    console.log('收到响应:', response.status, response.config.url, response.data)
    const res = response.data
    
    // 处理二进制数据直接返回
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response.data
    }
    
    // 接口成功标识，直接返回数据
    if (res.success) {
      return res
    }
    
    // 处理错误情况
    if (res.code === 401) {
      // 未登录或token过期
      showFailToast('登录已过期，请重新登录')
      // 清除本地token
      localStorage.removeItem('token')
      // 跳转到登录页面
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
      return Promise.reject(new Error(res.message || '登录已过期'))
    }
    
    // 其他错误情况
    showFailToast(res.message || '服务器错误')
    return Promise.reject(new Error(res.message || '未知错误'))
  },
  error => {
    console.error('响应错误:', error)
    let message = '连接服务器失败'
    
    if (error.response) {
      console.log('错误响应状态:', error.response.status)
      console.log('错误响应数据:', error.response.data)
      console.log('请求URL:', error.config.url)
      console.log('请求方法:', error.config.method)
      console.log('请求参数:', error.config.params || error.config.data)
      
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          // 清除本地token
          localStorage.removeItem('token')
          // 跳转到登录页面
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `请求错误 (${error.response.status})`
      }
    } else if (error.request) {
      message = '服务器未响应'
      console.log('无响应，请求信息:', error.request)
      console.log('请求URL:', error.config.url)
    } else {
      message = error.message
      console.log('请求配置错误:', error.message)
    }
    
    showFailToast(message)
    return Promise.reject(error)
  }
)

// 封装GET请求
export function get(url, params) {
  return service.get(url, { params })
}

// 封装POST请求
export function post(url, data) {
  return service.post(url, data)
}

// 封装PUT请求
export function put(url, data) {
  return service.put(url, data)
}

// 封装DELETE请求
export function del(url, params) {
  return service.delete(url, { params })
}

export default service 