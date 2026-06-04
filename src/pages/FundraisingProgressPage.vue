<template>
  <section class="component-page">
    <div class="component-page__card">
      <p class="component-page__tag">FundraisingProgress</p>
      <h2>募集进度条组件</h2>
      <p class="component-page__desc">
        独立测试页用于验证阶段名称、日期、当前节点和进行中的箭头位置。后续你新增组件时，可以照这个 page
        的结构继续扩展。
      </p>

      <div class="component-page__panel">
        <FundraisingProgress
          :items="steps"
          :current-index="currentIndex"
          :progress="progress"
        />
      </div>
    </div>
  </section>
</template>

<script>
import FundraisingProgress from '../components/FundraisingProgress.vue'

export default {
  name: 'FundraisingProgressPage',
  components: {
    FundraisingProgress
  },
  data() {
    return {
      currentIndex: 1,
      progress: 1.62,
      steps: [
        {
          label: '等待开售',
          date: ''
        },
        {
          label: '开始募集',
          date: '2026.01.10'
        },
        {
          label: '募集结束',
          date: '2026.01.24'
        }
      ]
    }
  }
}
</script>

<style scoped lang="less">
.component-page {
  display: flex;
  justify-content: center;
}

.component-page__card {
  width: min(100%, 375px);
  padding: 24px 16px 32px;
  border-radius: 32px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(245, 247, 255, 0.92));
  box-shadow: 0 18px 60px rgba(19, 36, 70, 0.12);
}

.component-page__tag {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #0f766e;
}

.component-page h2 {
  margin: 0;
  font-size: 30px;
  line-height: 38px;
  color: #0f172a;
}

.component-page__desc {
  margin: 12px 0 24px;
  font-size: 15px;
  line-height: 24px;
  color: #475569;
}

.component-page__panel {
  padding: 24px 12px 18px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}
</style>
