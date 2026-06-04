// 在这里登记组件测试页，导航和路由会自动同步。
export const componentPages = [
  {
    path: '/industry-distribution',
    name: 'industry-distribution',
    label: '行业分布',
    description: 'IndustryDistribution 组件测试页',
    component: () => import('./IndustryDistributionPage.vue')
  },
  {
    path: '/fundraising-progress',
    name: 'fundraising-progress',
    label: '募集进度条',
    description: 'FundraisingProgress 组件测试页',
    component: () => import('./FundraisingProgressPage.vue')
  },
  {
    path: '/swipe-carousel',
    name: 'swipe-carousel',
    label: 'Swipe 轮播图',
    description: 'SwipeCarousel 组件测试页',
    component: () => import('./SwipeCarouselPage.vue')
  },
  {
    path: '/rating-preview',
    name: 'rating-preview',
    label: '评分组件',
    description: 'RatingStars 组件预览页',
    component: () => import('./RatingPreviewPage.vue')
  }
]

export const pageNavItems = componentPages.map(page => ({
  path: page.path,
  name: page.name,
  label: page.label,
  description: page.description
}))

export const defaultPagePath = componentPages.length ? componentPages[0].path : '/'
