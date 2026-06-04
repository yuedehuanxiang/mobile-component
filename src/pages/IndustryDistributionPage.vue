<template>
  <section class="industry-page">
    <div class="industry-page__card">
      <p class="industry-page__tag">IndustryDistribution</p>
      <h2>行业分布组件</h2>
      <p class="industry-page__desc">
        横向滚动时显示底部滚动条，停止滚动 2 秒后自动隐藏。组件默认适合这种“标题 + 日期 + 指标卡片”的移动端布局。
      </p>

      <div class="industry-page__panel">
        <IndustryDistribution
          title="行业分布"
          date="2025-12-30"
          :items="industries"
        />
      </div>
    </div>
  </section>
</template>

<script>
import IndustryDistribution from '../components/IndustryDistribution.vue'

export default {
  name: 'IndustryDistributionPage',
  components: {
    IndustryDistribution
  },
  data() {
    return {
      industries: [
        {
          name: '科技',
          share: '59.22%'
        },
        {
          name: '医药生物',
          share: '32.13%'
        },
        {
          name: '制造',
          share: '21.12%'
        },
        {
          name: '消费',
          share: '15.28%'
        },
        {
          name: '新能源',
          share: '12.66%'
        },
        {
          name: '金融',
          share: '8.45%'
        }
      ]
    }
  }
}
</script>

<style scoped lang="less">
.industry-page {
  display: flex;
  justify-content: center;
}

.industry-page__card {
  width: min(100%, 375px);
  padding: 24px 16px 32px;
  border-radius: 32px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(245, 247, 255, 0.92));
  box-shadow: 0 18px 60px rgba(19, 36, 70, 0.12);
}

.industry-page__tag {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #0f766e;
}

.industry-page h2 {
  margin: 0;
  font-size: 30px;
  line-height: 38px;
  color: #0f172a;
}

.industry-page__desc {
  margin: 12px 0 24px;
  font-size: 15px;
  line-height: 24px;
  color: #475569;
}

.industry-page__panel {
  padding: 16px 12px 18px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}
</style>
