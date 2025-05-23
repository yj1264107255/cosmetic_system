<template>
  <div class="review-detail">
    <van-nav-bar
      title="测评详情"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <van-skeleton title avatar :row="15" :loading="loading">
      <div class="review-content" v-if="review">
        <!-- 用户信息 -->
        <div class="author-info">
          <van-image
            round
            width="40"
            height="40"
            :src="review.user?.avatar || 'https://img01.yzcdn.cn/vant/cat.jpeg'"
          />
          <div class="author-details">
            <div class="author-name">{{ review.user?.username || '匿名用户' }}</div>
            <div class="publish-time">{{ formatDate(review.createdAt) }}</div>
          </div>
        </div>
        
        <!-- 测评标题 -->
        <h1 class="review-title">{{ review.title }}</h1>
        
        <!-- 产品信息 -->
        <div class="product-info" v-if="review.product">
          <van-image
            width="60"
            height="60"
            fit="cover"
            :src="review.product.image || 'https://img01.yzcdn.cn/vant/cat.jpeg'"
          />
          <div class="product-details">
            <div class="product-name">{{ review.product.name }}</div>
            <div class="product-brand">{{ review.product.brand ? review.product.brand.name : '' }}</div>
            <div class="product-rating">
              <span>评分：</span>
              <van-rate v-model="review.rating" readonly allow-half />
              <span class="rating-value">{{ review.rating }}</span>
            </div>
          </div>
        </div>
        
        <!-- 测评内容 -->
        <div class="review-text" v-html="formatContent(review.content)"></div>
        
        <!-- 图片展示 -->
        <div class="image-gallery" v-if="review.imageList && review.imageList.length > 0">
          <van-image
            v-for="(img, index) in review.imageList"
            :key="index"
            width="100%"
            fit="cover"
            :src="img"
            @click="previewImage(index)"
          />
        </div>
        
        <!-- 优缺点 -->
        <div class="pros-cons" v-if="review.pros || review.cons">
          <div class="pros" v-if="review.pros">
            <h3>优点</h3>
            <p>{{ review.pros }}</p>
          </div>
          <div class="cons" v-if="review.cons">
            <h3>缺点</h3>
            <p>{{ review.cons }}</p>
          </div>
        </div>
        
        <!-- 标签 -->
        <div class="tags" v-if="review.tagList && review.tagList.length > 0">
          <van-tag
            v-for="(tag, index) in review.tagList"
            :key="index"
            plain
            type="primary"
            size="medium"
            style="margin-right: 8px;"
          >
            {{ tag }}
          </van-tag>
        </div>
        
        <!-- 互动区域 -->
        <div class="interaction-bar">
          <div class="like-btn" @click="toggleLike">
            <van-icon :name="review.isLiked ? 'like' : 'like-o'" :class="{ 'liked': review.isLiked }" size="20" />
            <span>{{ review.likeCount || 0 }}</span>
          </div>
          <div class="comment-btn" @click="focusCommentInput">
            <van-icon name="chat-o" size="20" />
            <span>{{ review.commentCount || 0 }}</span>
          </div>
        </div>
        
        <!-- 评论区 -->
        <div class="comments-section">
          <h3>全部评论 ({{ comments.length }})</h3>
          
          <!-- 评论列表 -->
          <div class="comment-list">
            <div v-if="comments.length === 0" class="no-comments">
              <van-empty description="暂无评论" />
            </div>
            
            <div v-for="(comment, index) in comments" :key="comment.id" class="comment-item">
              <div class="comment-user">
                <van-image
                  round
                  width="30"
                  height="30"
                  :src="comment.user?.avatar || 'https://img01.yzcdn.cn/vant/cat.jpeg'"
                />
                <div class="comment-user-info">
                  <div class="comment-username">{{ comment.user?.username || '匿名用户' }}</div>
                  <div class="comment-time">{{ formatDate(comment.createdAt) }}</div>
                </div>
              </div>
              
              <div class="comment-content">
                <div v-if="comment.replyToUser" class="reply-info">
                  回复 <span class="reply-username">@{{ comment.replyToUser.username }}</span>：
                </div>
                {{ comment.content }}
              </div>
              
              <div class="comment-actions">
                <span class="reply-btn" @click="replyToComment(comment)">回复</span>
                <span v-if="comment.userId === userId" class="delete-btn" @click="deleteComment(comment.id)">删除</span>
              </div>
              
              <!-- 子评论 -->
              <div class="sub-comments" v-if="comment.children && comment.children.length > 0">
                <div v-for="reply in comment.children" :key="reply.id" class="sub-comment-item">
                  <div class="comment-user">
                    <van-image
                      round
                      width="24"
                      height="24"
                      :src="reply.user?.avatar || 'https://img01.yzcdn.cn/vant/cat.jpeg'"
                    />
                    <div class="comment-user-info">
                      <div class="comment-username">{{ reply.user?.username || '匿名用户' }}</div>
                      <div class="comment-time">{{ formatDate(reply.createdAt) }}</div>
                    </div>
                  </div>
                  
                  <div class="comment-content">
                    <div v-if="reply.replyToUser" class="reply-info">
                      回复 <span class="reply-username">@{{ reply.replyToUser.username }}</span>：
                    </div>
                    {{ reply.content }}
                  </div>
                  
                  <div class="comment-actions">
                    <span class="reply-btn" @click="replyToComment(reply)">回复</span>
                    <span v-if="reply.userId === userId" class="delete-btn" @click="deleteComment(reply.id)">删除</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-skeleton>
    
    <!-- 评论输入区 -->
    <div class="comment-input-area">
      <van-field
        v-model="commentContent"
        ref="commentInput"
        rows="1"
        autosize
        type="textarea"
        :placeholder="replyTo ? `回复 @${replyTo.user?.username}：` : '写下你的评论...'"
        @keydown.enter="submitComment"
      >
        <template #button>
          <van-button size="small" type="primary" @click="submitComment" :disabled="!commentContent.trim()">发送</van-button>
        </template>
      </van-field>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog, ImagePreview } from 'vant'
import { 
  getReviewPostDetail, 
  likeReviewPost, 
  unlikeReviewPost 
} from '@/api/reviewPost'
import { 
  getReviewComments, 
  addReviewComment, 
  deleteReviewComment 
} from '@/api/reviewPost'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const review = ref(null)
const comments = ref([])
const commentContent = ref('')
const commentInput = ref(null)
const replyTo = ref(null)
const userId = ref(localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null)

// 获取测评详情
const fetchReviewDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const res = await getReviewPostDetail(id, userId.value)
    if (res.success && res.data) {
      review.value = res.data
    } else {
      showToast(res.message || '获取测评详情失败')
    }
  } catch (error) {
    console.error('获取测评详情失败:', error)
    showToast('获取测评详情失败')
  } finally {
    loading.value = false
  }
}

// 获取评论列表
const fetchComments = async () => {
  try {
    const id = route.params.id
    const res = await getReviewComments(id)
    if (res.success && res.data) {
      comments.value = res.data || []
    } else {
      showToast(res.message || '获取评论失败')
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    showToast('获取评论失败')
  }
}

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  // 一天内显示几小时前
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours === 0) {
      const minutes = Math.floor(diff / (60 * 1000))
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  }
  
  // 一周内显示几天前
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }
  
  // 超过一周显示具体日期
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 格式化内容（添加段落标签）
const formatContent = (content) => {
  if (!content) return ''
  return content.split('\n').map(p => `<p>${p}</p>`).join('')
}

// 预览图片
const previewImage = (index) => {
  if (!review.value || !review.value.imageList) return
  
  ImagePreview({
    images: review.value.imageList,
    startPosition: index,
    closeable: true,
  })
}

// 点赞/取消点赞
const toggleLike = async () => {
  if (!userId.value) {
    showToast('请先登录')
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    return
  }
  
  try {
    const id = review.value.id
    let res
    
    if (review.value.isLiked) {
      // 取消点赞
      res = await unlikeReviewPost(id, userId.value)
      if (res.success) {
        review.value.isLiked = false
        review.value.likeCount--
      }
    } else {
      // 点赞
      res = await likeReviewPost(id, userId.value)
      if (res.success) {
        review.value.isLiked = true
        review.value.likeCount++
      }
    }
    
    if (!res.success) {
      showToast(res.message || '操作失败')
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    showToast('操作失败')
  }
}

// 聚焦评论输入框
const focusCommentInput = () => {
  if (!userId.value) {
    showToast('请先登录')
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    return
  }
  
  nextTick(() => {
    if (commentInput.value) {
      commentInput.value.focus()
    }
  })
}

// 回复评论
const replyToComment = (comment) => {
  if (!userId.value) {
    showToast('请先登录')
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    return
  }
  
  replyTo.value = comment
  commentContent.value = ''
  
  nextTick(() => {
    if (commentInput.value) {
      commentInput.value.focus()
    }
  })
}

// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) {
    return
  }
  
  if (!userId.value) {
    showToast('请先登录')
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    return
  }
  
  try {
    const commentData = {
      reviewPostId: review.value.id,
      userId: userId.value,
      content: commentContent.value.trim(),
      parentId: replyTo.value ? replyTo.value.id : null,
      replyToUserId: replyTo.value ? replyTo.value.userId : null
    }
    
    const res = await addReviewComment(commentData)
    if (res.success) {
      showToast('评论成功')
      commentContent.value = ''
      replyTo.value = null
      
      // 刷新评论列表
      await fetchComments()
      
      // 更新评论数
      if (review.value) {
        review.value.commentCount = (review.value.commentCount || 0) + 1
      }
    } else {
      showToast(res.message || '评论失败')
    }
  } catch (error) {
    console.error('提交评论失败:', error)
    showToast('评论失败')
  }
}

// 删除评论
const deleteComment = async (commentId) => {
  if (!userId.value) {
    showToast('请先登录')
    return
  }
  
  try {
    showDialog({
      title: '提示',
      message: '确定要删除这条评论吗？',
      showCancelButton: true
    }).then(async () => {
      const res = await deleteReviewComment(commentId, userId.value)
      if (res.success) {
        showToast('删除成功')
        
        // 刷新评论列表
        await fetchComments()
        
        // 更新评论数
        if (review.value && review.value.commentCount > 0) {
          review.value.commentCount--
        }
      } else {
        showToast(res.message || '删除失败')
      }
    }).catch(() => {
      // 取消删除
    })
  } catch (error) {
    console.error('删除评论失败:', error)
    showToast('删除失败')
  }
}

onMounted(async () => {
  await fetchReviewDetail()
  await fetchComments()
})
</script>

<style scoped>
.review-detail {
  padding-bottom: 56px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.review-content {
  background-color: #fff;
  padding: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.author-details {
  margin-left: 12px;
}

.author-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.publish-time {
  font-size: 12px;
  color: #999;
}

.review-title {
  font-size: 18px;
  font-weight: bold;
  margin: 16px 0;
  color: #333;
}

.product-info {
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.product-details {
  margin-left: 12px;
  flex: 1;
}

.product-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.product-brand {
  font-size: 12px;
  color: #666;
}

.product-rating {
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-top: 4px;
}

.rating-value {
  margin-left: 4px;
  color: #ff6b81;
}

.review-text {
  margin: 16px 0;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

.review-text p {
  margin-bottom: 12px;
}

.image-gallery {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pros-cons {
  margin: 16px 0;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.pros h3, .cons h3 {
  font-size: 15px;
  margin: 0 0 8px;
}

.pros {
  margin-bottom: 16px;
}

.pros h3 {
  color: #07c160;
}

.cons h3 {
  color: #ee0a24;
}

.tags {
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.interaction-bar {
  display: flex;
  justify-content: space-around;
  margin: 16px 0;
  padding: 12px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.like-btn, .comment-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 20px;
  color: #666;
  cursor: pointer;
}

.like-btn span, .comment-btn span {
  margin-left: 4px;
}

.liked {
  color: #ff6b81;
}

.comments-section {
  margin-top: 24px;
}

.comments-section h3 {
  font-size: 16px;
  margin: 0 0 16px;
  color: #333;
}

.comment-list {
  margin-bottom: 65px;
}

.comment-item {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.comment-user {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment-user-info {
  margin-left: 8px;
}

.comment-username {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-content {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 8px;
  padding-left: 38px;
}

.reply-info {
  color: #999;
  margin-bottom: 4px;
}

.reply-username {
  color: #1989fa;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  font-size: 12px;
  color: #999;
}

.reply-btn, .delete-btn {
  padding: 4px 8px;
  cursor: pointer;
}

.delete-btn {
  color: #ee0a24;
}

.sub-comments {
  margin-left: 38px;
  margin-top: 12px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.sub-comment-item {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.sub-comment-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.comment-input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 8px;
  border-top: 1px solid #eee;
  z-index: 100;
}

.no-comments {
  padding: 40px 0;
}
</style> 