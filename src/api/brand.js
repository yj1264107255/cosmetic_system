import request from '../utils/request'

/**
 * 获取品牌列表
 * @param {Number} page 页码
 * @param {Number} size 每页条数
 * @param {String} keyword 搜索关键词
 * @returns {Promise}
 */
export function getBrandList(page = 1, size = 10, keyword) {
  return request({
    url: '/brand/list',
    method: 'get',
    params: {
      page,
      size,
      keyword
    }
  })
}

/**
 * 获取品牌详情
 * @param {Number} id 品牌ID
 * @returns {Promise}
 */
export function getBrandDetail(id) {
  return request({
    url: `/brand/${id}`,
    method: 'get'
  })
}

/**
 * 搜索品牌
 * @param {String} keyword 搜索关键词
 * @returns {Promise}
 */
export function searchBrand(keyword) {
  return request({
    url: '/brand/search',
    method: 'get',
    params: {
      keyword
    }
  })
}

/**
 * 获取品牌下的产品
 * @param {Number} id 品牌ID
 * @returns {Promise}
 */
export function getBrandProducts(id) {
  return request({
    url: `/brand/${id}/products`,
    method: 'get'
  })
}

/**
 * 获取所有品牌
 * @returns {Promise}
 */
export function getAllBrands() {
  return request({
    url: '/brand/all',
    method: 'get'
  })
} 