import request from '../utils/request'

/**
 * 添加收藏
 * @param {Object} data 收藏数据 {userId, favoriteType, favoriteId}
 * @returns {Promise}
 */
export function addFavorite(data) {
  return request({
    url: '/favorite/add',
    method: 'post',
    data
  })
}

/**
 * 删除收藏
 * @param {Number} id 收藏ID
 * @returns {Promise}
 */
export function deleteFavorite(id) {
  return request({
    url: `/favorite/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 取消收藏
 * @param {Number} userId 用户ID
 * @param {String} favoriteType 收藏类型
 * @param {Number} favoriteId 收藏对象ID
 * @returns {Promise}
 */
export function cancelFavorite(userId, favoriteType, favoriteId) {
  return request({
    url: '/favorite/cancel',
    method: 'post',
    params: {
      userId,
      favoriteType,
      favoriteId
    }
  })
}

/**
 * 获取用户收藏列表
 * @param {Number} userId 用户ID
 * @returns {Promise}
 */
export function getFavoriteList(userId) {
  return request({
    url: '/favorite/list',
    method: 'get',
    params: {
      userId
    }
  })
}

/**
 * 按类型获取用户收藏
 * @param {Number} userId 用户ID
 * @param {String} favoriteType 收藏类型
 * @returns {Promise}
 */
export function getFavoriteByType(userId, favoriteType) {
  return request({
    url: '/favorite/byType',
    method: 'get',
    params: {
      userId,
      favoriteType
    }
  })
}

/**
 * 检查是否已收藏
 * @param {Number} userId 用户ID
 * @param {String} favoriteType 收藏类型
 * @param {Number} favoriteId 收藏对象ID
 * @returns {Promise}
 */
export function checkFavorite(userId, favoriteType, favoriteId) {
  return request({
    url: '/favorite/check',
    method: 'get',
    params: {
      userId,
      favoriteType,
      favoriteId
    }
  })
}

/**
 * 清空用户收藏
 * @param {Number} userId 用户ID
 * @returns {Promise}
 */
export function clearFavorites(userId) {
  return request({
    url: '/favorite/clear',
    method: 'post',
    params: {
      userId
    }
  })
} 