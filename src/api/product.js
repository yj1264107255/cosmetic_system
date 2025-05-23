import request from '../utils/request'

/**
 * 获取产品列表
 * @param {Number} page 页码
 * @param {Number} size 每页条数
 * @param {String} keyword 搜索关键词
 * @param {Number} brandId 品牌ID
 * @param {String} category 产品类别
 * @returns {Promise}
 */
export function getProductList(page = 1, size = 10, keyword, brandId, category) {
  return request({
    url: '/product/list',
    method: 'get',
    params: {
      page,
      size,
      name: keyword,
      brandId,
      category
    }
  })
}

/**
 * 获取产品详情
 * @param {Number} id 产品ID
 * @returns {Promise}
 */
export function getProductDetail(id) {
  return request({
    url: `/product/${id}`,
    method: 'get'
  })
}

/**
 * 搜索产品
 * @param {String} keyword 搜索关键词
 * @returns {Promise}
 */
export function searchProduct(keyword) {
  return request({
    url: '/product/search',
    method: 'get',
    params: {
      keyword
    }
  })
}

/**
 * 获取按品牌分类的产品
 * @param {Number} brandId 品牌ID
 * @returns {Promise}
 */
export function getProductsByBrand(brandId) {
  return request({
    url: `/product/byBrand/${brandId}`,
    method: 'get'
  })
}

/**
 * 获取按分类的产品
 * @param {String} category 产品类别
 * @returns {Promise}
 */
export function getProductsByCategory(category) {
  return request({
    url: '/product/byCategory',
    method: 'get',
    params: {
      category
    }
  })
}

/**
 * 获取产品成分列表
 * @param {Number} id 产品ID
 * @returns {Promise}
 */
export function getProductIngredients(id) {
  return request({
    url: `/product/${id}/ingredients`,
    method: 'get'
  })
}

/**
 * 比较多个产品
 * @param {Array} productIds 产品ID数组
 * @returns {Promise}
 */
export function compareProducts(productIds) {
  return request({
    url: '/product/compare',
    method: 'get',
    params: {
      productIds
    }
  })
}

/**
 * 获取热门产品
 * @param {Number} limit 获取数量
 * @returns {Promise}
 */
export function getHotProducts(limit = 5) {
  return request({
    url: '/product/list/hot',
    method: 'get',
    params: {
      limit
    }
  })
} 