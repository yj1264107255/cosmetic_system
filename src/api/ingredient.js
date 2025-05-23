import request from '../utils/request'

/**
 * 获取成分列表
 * @param {Number} page 页码
 * @param {Number} size 每页条数
 * @param {String} keyword 搜索关键词
 * @param {Number} riskLevel 风险等级
 * @param {String} suitableSkin 适用肤质
 * @returns {Promise}
 */
export function getIngredientList(page = 1, size = 10, keyword, riskLevel, suitableSkin) {
  return request({
    url: '/ingredient/list',
    method: 'get',
    params: {
      page,
      size,
      name: keyword,
      riskLevel,
      suitableSkin
    }
  })
}

/**
 * 获取成分详情
 * @param {Number} id 成分ID
 * @returns {Promise}
 */
export function getIngredientDetail(id) {
  return request({
    url: `/ingredient/${id}`,
    method: 'get'
  })
}

/**
 * 搜索成分
 * @param {String} keyword 搜索关键词
 * @returns {Promise}
 */
export function searchIngredient(keyword) {
  return request({
    url: '/ingredient/search',
    method: 'get',
    params: {
      keyword
    }
  })
}

/**
 * 获取成分冲突信息
 * @param {Number} id 成分ID
 * @returns {Promise}
 */
export function getIngredientConflicts(id) {
  return request({
    url: `/ingredient/${id}/conflicts`,
    method: 'get'
  })
}

/**
 * 获取包含此成分的产品
 * @param {Number} id 成分ID
 * @returns {Promise}
 */
export function getIngredientProducts(id) {
  return request({
    url: `/ingredient/${id}/products`,
    method: 'get'
  })
}

/**
 * 获取按风险等级分类的成分
 * @param {Number} level 风险等级
 * @returns {Promise}
 */
export function getIngredientsByRiskLevel(level) {
  return request({
    url: `/ingredient/byRiskLevel/${level}`,
    method: 'get'
  })
}

/**
 * 获取成分知识库文章
 * @param {Number} id 成分ID
 * @returns {Promise}
 */
export function getIngredientKnowledge(id) {
  return request({
    url: `/ingredient/${id}/knowledge`,
    method: 'get'
  })
} 