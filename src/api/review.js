import request from '../utils/request'

/**
 * 添加产品评价
 * @param {Object} data 评价数据
 * @returns {Promise}
 */
export function addProductReview(data) {
  return request({
    url: '/product-review/add',
    method: 'post',
    data
  })
}

/**
 * 获取产品评价列表
 * @param {Number} productId 产品ID
 * @param {Number} page 页码
 * @param {Number} size 每页条数
 * @returns {Promise}
 */
export function getProductReviews(productId, page = 1, size = 10) {
  return request({
    url: '/product-review/list',
    method: 'get',
    params: {
      productId,
      page,
      size
    }
  })
}

/**
 * 获取用户的评价列表
 * @param {Number} userId 用户ID
 * @returns {Promise}
 */
export function getUserReviews(userId) {
  return request({
    url: '/product-review/listByUser',
    method: 'get',
    params: {
      userId
    }
  })
}

/**
 * 获取评价详情
 * @param {Number} id 评价ID
 * @returns {Promise}
 */
export function getReviewDetail(id) {
  return request({
    url: `/product-review/${id}`,
    method: 'get'
  })
}

/**
 * 删除评价
 * @param {Number} id 评价ID
 * @param {Number} userId 用户ID
 * @returns {Promise}
 */
export function deleteReview(id, userId) {
  return request({
    url: `/product-review/delete/${id}`,
    method: 'delete',
    params: {
      userId
    }
  })
}

/**
 * 检查用户是否已经评价过产品
 * @param {Number} userId 用户ID
 * @param {Number} productId 产品ID
 * @returns {Promise}
 */
export function checkReviewed(userId, productId) {
  return request({
    url: '/product-review/check',
    method: 'get',
    params: {
      userId,
      productId
    }
  })
}

/**
 * 获取产品的平均评分
 * @param {Number} productId 产品ID
 * @returns {Promise}
 */
export function getAverageRating(productId) {
  return request({
    url: `/product-review/avgRating/${productId}`,
    method: 'get'
  })
}

/**
 * 获取产品的评价数量
 * @param {Number} productId 产品ID
 * @returns {Promise}
 */
export function getReviewCount(productId) {
  return request({
    url: `/product-review/count/${productId}`,
    method: 'get'
  })
} 