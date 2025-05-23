import request from '../utils/request'

/**
 * 添加成分评价
 * @param {Object} data 评价数据
 * @returns {Promise}
 */
export function addIngredientReview(data) {
  return request({
    url: '/ingredient-review/add',
    method: 'post',
    data
  })
}

/**
 * 获取成分评价列表
 * @param {Number} ingredientId 成分ID
 * @param {Number} page 页码
 * @param {Number} size 每页条数
 * @returns {Promise}
 */
export function getIngredientReviews(ingredientId, page = 1, size = 10) {
  return request({
    url: '/ingredient-review/list',
    method: 'get',
    params: {
      ingredientId,
      page,
      size
    }
  })
}

/**
 * 获取用户的成分评价列表
 * @param {Number} userId 用户ID
 * @returns {Promise}
 */
export function getUserIngredientReviews(userId) {
  return request({
    url: '/ingredient-review/listByUser',
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
export function getIngredientReviewDetail(id) {
  return request({
    url: `/ingredient-review/${id}`,
    method: 'get'
  })
}

/**
 * 更新成分评价
 * @param {Object} data 评价数据
 * @returns {Promise}
 */
export function updateIngredientReview(data) {
  return request({
    url: '/ingredient-review/update',
    method: 'put',
    data
  })
}

/**
 * 删除成分评价
 * @param {Number} id 评价ID
 * @param {Number} userId 用户ID
 * @returns {Promise}
 */
export function deleteIngredientReview(id, userId) {
  return request({
    url: `/ingredient-review/delete/${id}`,
    method: 'delete',
    params: {
      userId
    }
  })
}

/**
 * 检查用户是否已经评价过成分
 * @param {Number} userId 用户ID
 * @param {Number} ingredientId 成分ID
 * @returns {Promise}
 */
export function checkIngredientReviewed(userId, ingredientId) {
  return request({
    url: '/ingredient-review/check',
    method: 'get',
    params: {
      userId,
      ingredientId
    }
  })
}

/**
 * 获取成分的平均评分
 * @param {Number} ingredientId 成分ID
 * @returns {Promise}
 */
export function getIngredientAverageRating(ingredientId) {
  return request({
    url: `/ingredient-review/avgRating/${ingredientId}`,
    method: 'get'
  })
}

/**
 * 获取成分的评价数量
 * @param {Number} ingredientId 成分ID
 * @returns {Promise}
 */
export function getIngredientReviewCount(ingredientId) {
  return request({
    url: `/ingredient-review/count/${ingredientId}`,
    method: 'get'
  })
} 