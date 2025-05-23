import request from '../utils/request'

/**
 * 获取科普知识详情
 * @param {Number} id 知识ID
 * @returns {Promise}
 */
export function getKnowledgeDetail(id) {
  return request({
    url: `/ingredient-knowledge/${id}`,
    method: 'get'
  })
}

/**
 * 获取已发布的科普知识列表
 * @returns {Promise}
 */
export function getPublishedKnowledge() {
  return request({
    url: '/ingredient-knowledge/published',
    method: 'get'
  })
}

/**
 * 分页获取科普知识
 * @param {Number} page 页码
 * @param {Number} size 每页条数
 * @param {String} keyword 搜索关键词
 * @returns {Promise}
 */
export function getKnowledgeList(page = 1, size = 10, keyword) {
  return request({
    url: '/ingredient-knowledge/list',
    method: 'get',
    params: {
      page,
      size,
      keyword
    }
  })
}

/**
 * 搜索科普知识
 * @param {String} keyword 搜索关键词
 * @returns {Promise}
 */
export function searchKnowledge(keyword) {
  return request({
    url: '/ingredient-knowledge/search',
    method: 'get',
    params: {
      keyword
    }
  })
}

/**
 * 根据成分ID获取科普知识
 * @param {Number} ingredientId 成分ID
 * @returns {Promise}
 */
export function getKnowledgeByIngredient(ingredientId) {
  return request({
    url: `/ingredient/${ingredientId}/knowledge`,
    method: 'get'
  })
} 