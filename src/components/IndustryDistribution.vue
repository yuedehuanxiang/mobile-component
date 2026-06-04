<template>
  <section class="industry-distribution">
    <header class="industry-distribution__header">
      <div class="industry-distribution__title-group">
        <span class="industry-distribution__dot"></span>
        <h3 class="industry-distribution__title">{{ title }}</h3>
      </div>

      <time
        v-if="date"
        class="industry-distribution__date"
        :datetime="date"
      >
        {{ date }}
      </time>
    </header>

    <div
      v-if="normalizedItems.length"
      class="industry-distribution__content"
    >
      <div
        ref="viewport"
        class="industry-distribution__viewport"
        @scroll="handleScroll"
      >
        <div
          class="industry-distribution__track"
          :style="trackStyle"
        >
          <article
            v-for="(item, index) in normalizedItems"
            :key="item.id || item.name || item.label || index"
            class="industry-distribution__card"
            :style="cardStyle"
          >
            <slot
              name="card"
              :item="item"
              :index="index"
              :share-text="resolveShareText(item)"
              :label="resolveLabel(item, index)"
            >
              <p class="industry-distribution__share">
                {{ resolveShareText(item) }}
              </p>
              <strong class="industry-distribution__label">
                {{ resolveLabel(item, index) }}
              </strong>
            </slot>
          </article>
        </div>
      </div>

      <div class="industry-distribution__scrollbar-shell">
        <div
          class="industry-distribution__scrollbar"
          :class="{ 'is-visible': showScrollbar && canScroll }"
        >
          <div
            class="industry-distribution__scrollbar-thumb"
            :style="thumbStyle"
          ></div>
        </div>
      </div>
    </div>

    <p
      v-else
      class="industry-distribution__empty"
    >
      暂无数据
    </p>
  </section>
</template>

<script>
export default {
  name: 'IndustryDistribution',
  props: {
    title: {
      type: String,
      default: '行业分布'
    },
    date: {
      type: String,
      default: ''
    },
    items: {
      type: Array,
      default: function () {
        return []
      }
    },
    shareLabel: {
      type: String,
      default: '占比'
    },
    cardWidth: {
      type: String,
      default: '168px'
    },
    cardGap: {
      type: Number,
      default: 16
    },
    autoHideDelay: {
      type: Number,
      default: 2000
    }
  },
  data() {
    return {
      viewportWidth: 0,
      scrollWidth: 0,
      scrollLeft: 0,
      showScrollbar: false,
      hideScrollbarTimer: null
    }
  },
  computed: {
    normalizedItems() {
      return Array.isArray(this.items) ? this.items : []
    },
    canScroll() {
      return this.scrollWidth - this.viewportWidth > 1
    },
    trackStyle() {
      return {
        gap: `${this.cardGap}px`
      }
    },
    cardStyle() {
      return {
        width: this.cardWidth
      }
    },
    thumbWidth() {
      if (!this.canScroll || !this.viewportWidth) {
        return 0
      }

      return Math.max((this.viewportWidth / this.scrollWidth) * this.viewportWidth, 36)
    },
    thumbOffset() {
      if (!this.canScroll) {
        return 0
      }

      const maxScrollLeft = this.scrollWidth - this.viewportWidth
      const maxThumbOffset = this.viewportWidth - this.thumbWidth

      if (maxScrollLeft <= 0 || maxThumbOffset <= 0) {
        return 0
      }

      return (this.scrollLeft / maxScrollLeft) * maxThumbOffset
    },
    thumbStyle() {
      return {
        width: `${this.thumbWidth}px`,
        transform: `translate3d(${this.thumbOffset}px, 0, 0)`
      }
    }
  },
  watch: {
    items: {
      deep: true,
      handler() {
        this.$nextTick(this.updateMetrics)
      }
    }
  },
  mounted() {
    this.$nextTick(this.updateMetrics)
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    this.clearHideScrollbarTimer()
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      this.updateMetrics()
    },
    handleScroll() {
      this.updateMetrics()
      this.revealScrollbar()
    },
    updateMetrics() {
      const viewport = this.$refs.viewport

      if (!viewport) {
        return
      }

      this.viewportWidth = viewport.clientWidth
      this.scrollWidth = viewport.scrollWidth
      this.scrollLeft = viewport.scrollLeft

      if (this.scrollWidth - this.viewportWidth <= 1) {
        this.clearHideScrollbarTimer()
        this.showScrollbar = false
      }
    },
    revealScrollbar() {
      if (!this.canScroll) {
        return
      }

      this.showScrollbar = true
      this.clearHideScrollbarTimer()
      this.hideScrollbarTimer = window.setTimeout(() => {
        this.showScrollbar = false
        this.hideScrollbarTimer = null
      }, this.autoHideDelay)
    },
    clearHideScrollbarTimer() {
      if (!this.hideScrollbarTimer) {
        return
      }

      window.clearTimeout(this.hideScrollbarTimer)
      this.hideScrollbarTimer = null
    },
    resolveLabel(item, index) {
      return item.name || item.label || `行业 ${index + 1}`
    },
    resolveShareText(item) {
      const rawValue = item.share !== undefined
        ? item.share
        : item.value !== undefined
          ? item.value
          : item.ratio

      if (rawValue === null || rawValue === undefined || rawValue === '') {
        return this.shareLabel
      }

      if (typeof rawValue === 'number') {
        return `${this.shareLabel}${this.formatNumber(rawValue)}%`
      }

      const text = String(rawValue).trim()

      if (!text) {
        return this.shareLabel
      }

      return `${this.shareLabel}${text.indexOf('%') === -1 ? `${text}%` : text}`
    },
    formatNumber(value) {
      if (!Number.isFinite(value)) {
        return ''
      }

      if (value % 1 === 0) {
        return value.toFixed(0)
      }

      return value.toFixed(2).replace(/\.?0+$/, '')
    }
  }
}
</script>

<style scoped lang="less">
.industry-distribution {
  width: 100%;
}

.industry-distribution__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.industry-distribution__title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.industry-distribution__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a8adb7;
  flex: 0 0 auto;
}

.industry-distribution__title {
  margin: 0;
  font-size: 18px;
  line-height: 26px;
  font-weight: 600;
  color: #2f3137;
}

.industry-distribution__date {
  flex: 0 0 auto;
  font-size: 14px;
  line-height: 22px;
  color: #a0a6b0;
}

.industry-distribution__content {
  margin-top: 18px;
}

.industry-distribution__viewport {
  overflow-x: auto;
  overflow-y: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.industry-distribution__viewport::-webkit-scrollbar {
  display: none;
}

.industry-distribution__track {
  display: flex;
  align-items: stretch;
  width: max-content;
}

.industry-distribution__card {
  flex: 0 0 auto;
  padding: 18px 16px 20px;
  border-radius: 12px;
  background: #f4f7ff;
}

.industry-distribution__share {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #8c9099;
}

.industry-distribution__label {
  display: block;
  margin-top: 16px;
  font-size: 18px;
  line-height: 26px;
  font-weight: 500;
  color: #31343b;
}

.industry-distribution__scrollbar-shell {
  height: 6px;
  margin-top: 10px;
}

.industry-distribution__scrollbar {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  opacity: 0;
  transform: translateY(2px);
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.industry-distribution__scrollbar.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.industry-distribution__scrollbar-thumb {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #b6c3db 0%, #8ea3c7 100%);
}

.industry-distribution__empty {
  margin: 18px 0 0;
  font-size: 14px;
  line-height: 22px;
  color: #94a3b8;
}
</style>
