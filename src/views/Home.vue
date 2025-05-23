<!-- 功能模块 -->
<div class="features">
  <div class="feature-item" @click="router.push('/ingredient')">
    <van-icon name="bulb-o" color="#08c" size="32" />
    <div class="title">成分查询</div>
    <div class="desc">分析护肤品成分安全性</div>
  </div>
  <div class="feature-item" @click="router.push('/product')">
    <van-icon name="bag-o" color="#ff6b81" size="32" />
    <div class="title">产品查询</div>
    <div class="desc">了解产品详细信息</div>
  </div>
  <div class="feature-item" @click="router.push('/review')">
    <van-icon name="comment-o" color="#07c160" size="32" />
    <div class="title">护肤测评</div>
    <div class="desc">分享产品使用体验</div>
  </div>
  <div class="feature-item" @click="router.push('/knowledge')">
    <van-icon name="notes-o" color="#ee0a24" size="32" />
    <div class="title">肌肤知识</div>
    <div class="desc">科学护肤小知识</div>
  </div>
</div> 