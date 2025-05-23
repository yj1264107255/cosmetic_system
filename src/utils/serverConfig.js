/**
 * 服务器配置管理工具
 * 用于存储和管理服务器地址配置
 */

// 默认服务器地址配置
const DEFAULT_SERVER = {
  protocol: 'http',
  host: 'localhost',
  port: '8080',
  prefix: '/api'
}

/**
 * 获取完整的服务器基础URL
 * @returns {string} 完整的服务器URL
 */
export function getBaseUrl() {
  // 从本地存储获取设置，如果没有则使用默认值
  const serverConfig = getServerConfig()
  const { protocol, host, port, prefix } = serverConfig
  
  // 构建基础URL
  if (port) {
    return `${protocol}://${host}:${port}${prefix}`
  } else {
    return `${protocol}://${host}${prefix}`
  }
}

/**
 * 获取服务器配置
 * @returns {Object} 服务器配置对象
 */
export function getServerConfig() {
  const storedConfig = localStorage.getItem('serverConfig')
  return storedConfig ? JSON.parse(storedConfig) : DEFAULT_SERVER
}

/**
 * 设置服务器配置
 * @param {Object} config 配置对象
 * @param {string} config.protocol 协议 (http/https)
 * @param {string} config.host 主机名或IP
 * @param {string} config.port 端口号
 * @param {string} config.prefix API前缀
 */
export function setServerConfig(config) {
  // 合并配置，确保所有字段都存在
  const newConfig = { ...DEFAULT_SERVER, ...config }
  localStorage.setItem('serverConfig', JSON.stringify(newConfig))
  return newConfig
}

/**
 * 重置服务器配置为默认值
 */
export function resetServerConfig() {
  localStorage.removeItem('serverConfig')
  return DEFAULT_SERVER
}

// 导出默认配置以供参考
export const defaultConfig = DEFAULT_SERVER 