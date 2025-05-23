import request from '../utils/request'

/**
 * 添加浏览历史
 * @param {Object} data 历史记录数据
 * @returns {Promise}
 */
export function addHistory(data) {
  return request({
    url: '/search-history/add',
    method: 'post',
    data
  })
}

/**
 * 获取用户浏览历史列表
 * @param {Number} userId 用户ID
 * @returns {Promise}
 */
export function getHistoryList(userId) {
  return request({
    url: '/search-history/list',
    method: 'get',
    params: {
      userId
    }
  })
}

/**
 * 获取用户指定类型的浏览历史
 * @param {Number} userId 用户ID
 * @param {String} searchType 浏览类型：ingredient-成分，product-产品，brand-品牌
 * @returns {Promise}
 */
export function getHistoryByType(userId, searchType) {
  return request({
    url: '/search-history/byType',
    method: 'get',
    params: {
      userId,
      searchType
    }
  })
}

/**
 * 删除单条浏览历史
 * @param {Number} id 历史ID
 * @returns {Promise}
 */
export function deleteHistory(id) {
  return request({
    url: `/search-history/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 清空用户所有浏览历史
 * @param {Number} userId 用户ID
 * @returns {Promise}
 */
export function clearHistory(userId) {
  return request({
    url: '/search-history/clear',
    method: 'delete',
    params: {
      userId
    }
  })
}

/**
 * 清空用户指定类型的浏览历史
 * @param {Number} userId 用户ID
 * @param {String} searchType 浏览类型
 * @returns {Promise}
 */
export function clearHistoryByType(userId, searchType) {
  return request({
    url: '/search-history/clearByType',
    method: 'delete',
    params: {
      userId,
      searchType
    }
  })
} 