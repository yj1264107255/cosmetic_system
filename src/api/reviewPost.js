import request from '../utils/request'

/**
 * 获取测评文章详情
 * @param {Number} id 测评ID
 * @param {Number} userId 当前用户ID（可选）
 * @returns {Promise}
 */
export function getReviewPostDetail(id, userId) {
  return request({
    url: `/review-post/${id}`,
    method: 'get',
    params: {
      userId
    }
  })
}

/**
 * 获取测评文章列表
 * @param {Number} page 页码
 * @param {Number} size 每页条数
 * @param {Number} userId 当前用户ID（可选）
 * @returns {Promise}
 */
export function getReviewPostList(page = 1, size = 10, userId) {
  return request({
    url: '/review-post/list',
    method: 'get',
    params: {
      page,
      size,
      userId
    }
  })
}

/**
 * 根据标签获取测评文章列表
 * @param {String} tag 标签
 * @param {Number} page 页码
 * @param {Number} size 每页条数
 * @param {Number} userId 当前用户ID（可选）
 * @returns {Promise}
 */
export function getReviewPostByTag(tag, page = 1, size = 10, userId) {
  return request({
    url: `/review-post/tag/${tag}`,
    method: 'get',
    params: {
      page,
      size,
      userId
    }
  })
}

/**
 * 搜索测评文章
 * @param {String} keyword 关键词
 * @param {Number} page 页码
 * @param {Number} size 每页条数
 * @param {Number} userId 当前用户ID（可选）
 * @returns {Promise}
 */
export function searchReviewPost(keyword, page = 1, size = 10, userId) {
  return request({
    url: '/review-post/search',
    method: 'get',
    params: {
      keyword,
      page,
      size,
      userId
    }
  })
}

/**
 * 获取热门测评文章
 * @param {Number} limit 获取数量
 * @param {Number} userId 当前用户ID（可选）
 * @returns {Promise}
 */
export function getHotReviewPosts(limit = 5, userId) {
  return request({
    url: '/review-post/hot',
    method: 'get',
    params: {
      limit,
      userId
    }
  })
}

/**
 * 获取用户发布的测评文章
 * @param {Number} userId 用户ID
 * @returns {Promise}
 */
export function getUserReviewPosts(userId) {
  return request({
    url: `/review-post/user/${userId}`,
    method: 'get'
  })
}

/**
 * 获取产品相关的测评文章
 * @param {Number} productId 产品ID
 * @param {Number} userId 当前用户ID（可选）
 * @returns {Promise}
 */
export function getProductReviewPosts(productId, userId) {
  return request({
    url: `/review-post/product/${productId}`,
    method: 'get',
    params: {
      userId
    }
  })
}

/**
 * 发布测评文章
 * @param {Object} data 测评数据
 * @returns {Promise}
 */
export function addReviewPost(data) {
  return request({
    url: '/review-post/add',
    method: 'post',
    data
  })
}

/**
 * 更新测评文章
 * @param {Object} data 测评数据
 * @returns {Promise}
 */
export function updateReviewPost(data) {
  return request({
    url: '/review-post/update',
    method: 'put',
    data
  })
}

/**
 * 删除测评文章
 * @param {Number} id 测评ID
 * @param {Number} userId 用户ID
 * @returns {Promise}
 */
export function deleteReviewPost(id, userId) {
  return request({
    url: `/review-post/delete/${id}`,
    method: 'delete',
    params: {
      userId
    }
  })
}

/**
 * 点赞测评文章
 * @param {Number} id 测评ID
 * @param {Number} userId 用户ID
 * @returns {Promise}
 */
export function likeReviewPost(id, userId) {
  return request({
    url: `/review-post/like/${id}`,
    method: 'post',
    params: {
      userId
    }
  })
}

/**
 * 取消点赞测评文章
 * @param {Number} id 测评ID
 * @param {Number} userId 用户ID
 * @returns {Promise}
 */
export function unlikeReviewPost(id, userId) {
  return request({
    url: `/review-post/unlike/${id}`,
    method: 'delete',
    params: {
      userId
    }
  })
}

/**
 * 检查用户是否点赞过测评文章
 * @param {Number} reviewPostId 测评ID
 * @param {Number} userId 用户ID
 * @returns {Promise}
 */
export function checkReviewPostLiked(reviewPostId, userId) {
  return request({
    url: '/review-post/check-like',
    method: 'get',
    params: {
      reviewPostId,
      userId
    }
  })
}

/**
 * 获取测评文章的评论列表
 * @param {Number} reviewPostId 测评ID
 * @returns {Promise}
 */
export function getReviewComments(reviewPostId) {
  return request({
    url: `/review-post/${reviewPostId}/comments`,
    method: 'get'
  })
}

/**
 * 分页获取测评文章的评论
 * @param {Number} reviewPostId 测评ID
 * @param {Number} page 页码
 * @param {Number} size 每页条数
 * @returns {Promise}
 */
export function getReviewCommentsByPage(reviewPostId, page = 1, size = 10) {
  return request({
    url: `/review-post/${reviewPostId}/comments/page`,
    method: 'get',
    params: {
      page,
      size
    }
  })
}

/**
 * 添加评论
 * @param {Object} data 评论数据
 * @returns {Promise}
 */
export function addReviewComment(data) {
  return request({
    url: '/review-comment/add',
    method: 'post',
    data
  })
}

/**
 * 更新评论
 * @param {Object} data 评论数据
 * @returns {Promise}
 */
export function updateReviewComment(data) {
  return request({
    url: '/review-comment/update',
    method: 'put',
    data
  })
}

/**
 * 删除评论
 * @param {Number} id 评论ID
 * @param {Number} userId 用户ID
 * @returns {Promise}
 */
export function deleteReviewComment(id, userId) {
  return request({
    url: `/review-comment/delete/${id}`,
    method: 'delete',
    params: {
      userId
    }
  })
}

/**
 * 获取评论回复列表
 * @param {Number} parentId 父评论ID
 * @returns {Promise}
 */
export function getReviewCommentReplies(parentId) {
  return request({
    url: `/review-comment/replies/${parentId}`,
    method: 'get'
  })
} 