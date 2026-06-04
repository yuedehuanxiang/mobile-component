<template>
  <section class="swipe-page">
    <div class="swipe-page__card">
      <div class="swipe-page__header">
        <div>
          <p class="swipe-page__tag">SwipeCarousel</p>
          <h2>Swipe 轮播图组件</h2>
        </div>
        <div class="swipe-page__status">
          <span>当前页</span>
          <strong>{{ currentSlideIndex + 1 }} / {{ slides.length }}</strong>
        </div>
      </div>

      <p class="swipe-page__desc">
        这个版本支持触摸滑动、自动播放、指示器、左右控制按钮，以及自定义 slide 内容插槽，适合作为组件测试页和业务轮播基础组件。
      </p>

      <div class="swipe-page__panel">
        <SwipeCarousel
          :items="slides"
          height="320px"
          :interval="3600"
          :show-controls="true"
          @change="handleSlideChange"
        >
          <template #slide="{ item, index }">
            <article
              class="swipe-demo-slide"
              :style="{ background: item.background }"
            >
              <div class="swipe-demo-slide__top">
                <p>{{ item.eyebrow }}</p>
                <span>{{ item.badge }}</span>
              </div>

              <div class="swipe-demo-slide__body">
                <strong>{{ item.title }}</strong>
                <p>{{ item.description }}</p>
              </div>

              <div class="swipe-demo-slide__footer">
                <div>
                  <small>主指标</small>
                  <b>{{ item.metric }}</b>
                </div>
                <button type="button">
                  查看第 {{ index + 1 }} 张
                </button>
              </div>
            </article>
          </template>
        </SwipeCarousel>
      </div>

      <div class="swipe-page__meta">
        <div class="swipe-page__meta-card">
          <span>激活标题</span>
          <strong>{{ activeSlide.title }}</strong>
          <p>{{ activeSlide.description }}</p>
        </div>
        <div class="swipe-page__meta-card">
          <span>推荐 props</span>
          <div class="swipe-page__chips">
            <em>`items`</em>
            <em>`height`</em>
            <em>`interval`</em>
            <em>`show-controls`</em>
            <em>`show-indicators`</em>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import SwipeCarousel from '../components/SwipeCarousel.vue'

export default {
  name: 'SwipeCarouselPage',
  components: {
    SwipeCarousel
  },
  data() {
    return {
      currentSlideIndex: 0,
      slides: [
        {
          id: 'alpha',
          eyebrow: 'Alpha Selection',
          badge: 'Auto Play',
          title: '高净值客户策略看板',
          description: '用横向卡片承接高价值内容，首屏就能带出重点主题和行动入口。',
          metric: '7.2%',
          background:
            'radial-gradient(circle at top right, rgba(255, 255, 255, 0.22), transparent 32%), linear-gradient(135deg, #0f766e 0%, #14b8a6 54%, #99f6e4 100%)'
        },
        {
          id: 'beta',
          eyebrow: 'Campaign Focus',
          badge: 'Touch Swipe',
          title: '活动会场头图轮播',
          description: '适合营销会场、首页焦点位、产品集锦等需要手势滑动和自动轮播的区域。',
          metric: '24H',
          background:
            'radial-gradient(circle at top left, rgba(255, 255, 255, 0.18), transparent 28%), linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #7dd3fc 100%)'
        },
        {
          id: 'gamma',
          eyebrow: 'Editorial Story',
          badge: 'Scoped Slot',
          title: '内容运营专题封面',
          description: '通过作用域插槽自定义 slide 内容，不把组件绑死在某一种卡片结构上。',
          metric: '3 Slides',
          background:
            'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.2), transparent 24%), linear-gradient(135deg, #7c2d12 0%, #ea580c 48%, #fdba74 100%)'
        }
      ]
    }
  },
  computed: {
    activeSlide() {
      return this.slides[this.currentSlideIndex] || this.slides[0] || {}
    }
  },
  methods: {
    handleSlideChange(payload) {
      this.currentSlideIndex = payload.index
    }
  }
}
</script>

<style scoped lang="less">
.swipe-page {
  display: flex;
  justify-content: center;
}

.swipe-page__card {
  width: min(100%, 780px);
  padding: 28px;
  border-radius: 34px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(245, 247, 255, 0.92));
  box-shadow: 0 18px 60px rgba(19, 36, 70, 0.12);
}

.swipe-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.swipe-page__tag {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #0f766e;
}

.swipe-page h2 {
  margin: 0;
  font-size: 32px;
  line-height: 1.15;
  color: #0f172a;
}

.swipe-page__status {
  min-width: 120px;
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(15, 118, 110, 0.08);
  text-align: right;
}

.swipe-page__status span {
  display: block;
  font-size: 12px;
  line-height: 1.4;
  color: #0f766e;
}

.swipe-page__status strong {
  display: block;
  margin-top: 6px;
  font-size: 22px;
  line-height: 1.2;
  color: #0f172a;
}

.swipe-page__desc {
  max-width: 620px;
  margin: 14px 0 24px;
  font-size: 15px;
  line-height: 1.8;
  color: #475569;
}

.swipe-page__panel {
  padding: 14px;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.05), 0 12px 32px rgba(15, 23, 42, 0.08);
}

.swipe-demo-slide {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 26px;
  color: #ffffff;
}

.swipe-demo-slide__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.swipe-demo-slide__top p,
.swipe-demo-slide__body p {
  margin: 0;
}

.swipe-demo-slide__top p {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  opacity: 0.82;
}

.swipe-demo-slide__top span {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(10px);
  font-size: 12px;
  line-height: 1;
}

.swipe-demo-slide__body {
  max-width: 440px;
}

.swipe-demo-slide__body strong {
  display: block;
  font-size: 38px;
  line-height: 1.06;
}

.swipe-demo-slide__body p {
  margin-top: 14px;
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.86);
}

.swipe-demo-slide__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.swipe-demo-slide__footer small {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.72);
}

.swipe-demo-slide__footer b {
  font-size: 32px;
  line-height: 1;
}

.swipe-demo-slide__footer button {
  padding: 12px 16px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  backdrop-filter: blur(10px);
}

.swipe-page__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.swipe-page__meta-card {
  padding: 18px 18px 20px;
  border-radius: 22px;
  background: rgba(248, 250, 252, 0.95);
}

.swipe-page__meta-card span {
  display: block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #0f766e;
}

.swipe-page__meta-card strong {
  display: block;
  margin-top: 10px;
  font-size: 20px;
  line-height: 1.3;
  color: #0f172a;
}

.swipe-page__meta-card p {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: #64748b;
}

.swipe-page__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.swipe-page__chips em {
  padding: 8px 10px;
  border-radius: 999px;
  background: #ffffff;
  font-style: normal;
  font-family: "SFMono-Regular", "Consolas", monospace;
  font-size: 12px;
  color: #0f172a;
}

@media (max-width: 900px) {
  .swipe-page__header {
    flex-direction: column;
  }

  .swipe-page__status {
    text-align: left;
  }

  .swipe-demo-slide__body strong {
    font-size: 32px;
  }
}

@media (max-width: 640px) {
  .swipe-page__card {
    padding: 22px 16px;
  }

  .swipe-page__panel {
    padding: 10px;
  }

  .swipe-demo-slide {
    padding: 22px 18px;
  }

  .swipe-demo-slide__footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .swipe-page__meta {
    grid-template-columns: 1fr;
  }
}
</style>
