import { createRouter, createWebHistory } from 'vue-router'
import { showToast } from 'vant'

// 导入测评相关组件
const ReviewIndex = () => import('@/views/review/Index.vue')
const ReviewDetail = () => import('@/views/review/Detail.vue')
const ReviewPublish = () => import('@/views/review/Publish.vue')

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/Index.vue'),
    meta: { title: '首页', keepAlive: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Index.vue'),
    meta: { title: '登录', keepAlive: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/Index.vue'),
    meta: { title: '注册', keepAlive: false }
  },
  {
    path: '/ingredient',
    name: 'Ingredient',
    component: () => import('@/views/ingredient/Index.vue'),
    meta: { title: '成分查询', keepAlive: true }
  },
  {
    path: '/ingredient/detail/:id',
    name: 'IngredientDetail',
    component: () => import('@/views/ingredient/Detail.vue'),
    meta: { title: '成分详情', keepAlive: false }
  },
  {
    path: '/product',
    name: 'Product',
    component: () => import('@/views/product/Index.vue'),
    meta: { title: '产品查询', keepAlive: true }
  },
  {
    path: '/product/detail/:id',
    name: 'ProductDetail',
    component: () => import('@/views/product/Detail.vue'),
    meta: { title: '产品详情', keepAlive: false }
  },
  {
    path: '/brand',
    name: 'Brand',
    component: () => import('@/views/brand/Index.vue'),
    meta: { title: '品牌查询', keepAlive: true }
  },
  {
    path: '/brand/detail/:id',
    name: 'BrandDetail',
    component: () => import('@/views/brand/Detail.vue'),
    meta: { title: '品牌详情', keepAlive: false }
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('@/views/knowledge/Index.vue'),
    meta: { title: '成分科普', keepAlive: true }
  },
  {
    path: '/knowledge/detail/:id',
    name: 'KnowledgeDetail',
    component: () => import('@/views/knowledge/Detail.vue'),
    meta: { title: '科普详情', keepAlive: false }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/history/Index.vue'),
    meta: { title: '历史记录', keepAlive: true, requireAuth: true }
  },
  {
    path: '/favorite',
    name: 'Favorite',
    component: () => import('@/views/favorite/Index.vue'),
    meta: { title: '我的收藏', keepAlive: true, requireAuth: true }
  },
  {
    path: '/my-reviews',
    name: 'MyReviews',
    component: () => import('@/views/my-reviews/Index.vue'),
    meta: { title: '我的评价', keepAlive: true, requireAuth: true }
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('@/views/mine/Index.vue'),
    meta: { title: '个人中心', keepAlive: true }
  },
  {
    path: '/review',
    name: 'Review',
    component: ReviewIndex,
    meta: { requiresAuth: false }
  },
  {
    path: '/review/detail/:id',
    name: 'ReviewDetail',
    component: ReviewDetail,
    meta: { requiresAuth: false }
  },
  {
    path: '/review/publish',
    name: 'ReviewPublish',
    component: ReviewPublish,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { title: '页面不存在', keepAlive: false }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '护肤品成分查询系统'
  
  // 权限验证
  if (to.meta.requireAuth) {
    const token = localStorage.getItem('token')
    if (token) {
      next()
    } else {
      showToast('请先登录')
      next({ 
        path: '/login', 
        query: { redirect: to.fullPath } 
      })
    }
  } else {
    // 如果是登录页面且已登录，直接跳转到首页
    if ((to.path === '/login' || to.path === '/register') && localStorage.getItem('token')) {
      next('/mine')
    } else {
      next()
    }
  }
})

export default router 