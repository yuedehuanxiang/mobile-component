<template>
  <div class="swipe-carousel">
    <div
      ref="viewport"
      class="swipe-carousel__viewport"
      :style="viewportStyle"
      @mouseenter="pauseAutoplay"
      @mouseleave="resumeAutoplay"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchCancel"
    >
      <div
        class="swipe-carousel__track"
        :style="trackStyle"
        @transitionend="handleTransitionEnd"
      >
        <div
          v-for="(item, renderIndex) in renderedItems"
          :key="slideKey(item, renderIndex)"
          class="swipe-carousel__slide"
        >
          <slot
            name="slide"
            :item="item"
            :index="toLogicalIndex(renderIndex)"
          >
            <div
              class="swipe-carousel__fallback"
              :style="{ background: item.background || fallbackBackground(toLogicalIndex(renderIndex)) }"
            >
              <p v-if="item.eyebrow" class="swipe-carousel__fallback-eyebrow">
                {{ item.eyebrow }}
              </p>
              <strong class="swipe-carousel__fallback-title">
                {{ item.title || `Slide ${toLogicalIndex(renderIndex) + 1}` }}
              </strong>
              <p v-if="item.description" class="swipe-carousel__fallback-desc">
                {{ item.description }}
              </p>
            </div>
          </slot>
        </div>
      </div>

      <div
        v-if="showControls && slideCount > 1"
        class="swipe-carousel__controls"
      >
        <button
          type="button"
          class="swipe-carousel__control"
          aria-label="上一张"
          @click="prev"
        >
          <span>&lsaquo;</span>
        </button>
        <button
          type="button"
          class="swipe-carousel__control"
          aria-label="下一张"
          @click="next"
        >
          <span>&rsaquo;</span>
        </button>
      </div>
    </div>

    <div
      v-if="showIndicators && slideCount > 1"
      class="swipe-carousel__indicators"
      role="tablist"
      aria-label="轮播图分页"
    >
      <button
        v-for="(item, index) in normalizedItems"
        :key="`indicator-${index}`"
        type="button"
        class="swipe-carousel__indicator"
        :class="{ 'is-active': index === activeIndex }"
        :aria-label="`切换到第 ${index + 1} 张`"
        :aria-selected="String(index === activeIndex)"
        @click="goTo(index)"
      ></button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SwipeCarousel',
  props: {
    items: {
      type: Array,
      default: function () {
        return []
      }
    },
    initialIndex: {
      type: Number,
      default: 0
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 3200
    },
    duration: {
      type: Number,
      default: 360
    },
    loop: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      default: '220px'
    },
    showIndicators: {
      type: Boolean,
      default: true
    },
    showControls: {
      type: Boolean,
      default: false
    },
    swipeThreshold: {
      type: Number,
      default: 56
    }
  },
  data() {
    const safeIndex = this.normalizeIndex(this.initialIndex, this.items.length)

    return {
      currentRenderIndex: this.loop && this.items.length > 1 ? safeIndex + 1 : safeIndex,
      slideWidth: 0,
      dragOffset: 0,
      touchStartX: 0,
      touchStartY: 0,
      isDragging: false,
      isHorizontalSwipe: false,
      transitionEnabled: false,
      autoplayTimer: null,
      lastReportedIndex: -1
    }
  },
  computed: {
    normalizedItems() {
      return Array.isArray(this.items) ? this.items : []
    },
    slideCount() {
      return this.normalizedItems.length
    },
    canLoop() {
      return this.loop && this.slideCount > 1
    },
    renderedItems() {
      if (!this.slideCount) {
        return []
      }

      if (!this.canLoop) {
        return this.normalizedItems
      }

      return [
        this.normalizedItems[this.slideCount - 1],
        ...this.normalizedItems,
        this.normalizedItems[0]
      ]
    },
    activeIndex() {
      if (!this.slideCount) {
        return 0
      }

      if (!this.canLoop) {
        return this.clamp(this.currentRenderIndex, 0, this.slideCount - 1)
      }

      if (this.currentRenderIndex === 0) {
        return this.slideCount - 1
      }

      if (this.currentRenderIndex === this.renderedItems.length - 1) {
        return 0
      }

      return this.currentRenderIndex - 1
    },
    trackStyle() {
      const baseOffset = this.slideWidth ? -(this.currentRenderIndex * this.slideWidth) : 0
      const translateX = baseOffset + this.dragOffset

      return {
        width: '100%',
        transform: this.slideWidth
          ? `translate3d(${translateX}px, 0, 0)`
          : `translate3d(${-this.currentRenderIndex * 100}%, 0, 0)`,
        transition:
          this.transitionEnabled && !this.isDragging
            ? `transform ${this.duration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`
            : 'none'
      }
    },
    viewportStyle() {
      return {
        height: this.height
      }
    }
  },
  watch: {
    items: {
      handler() {
        this.resetPosition(this.initialIndex)
      }
    },
    initialIndex(value) {
      this.resetPosition(value)
    },
    autoplay() {
      this.restartAutoplay()
    },
    interval() {
      this.restartAutoplay()
    },
    loop() {
      this.resetPosition(this.activeIndex)
    }
  },
  mounted() {
    this.transitionEnabled = true
    this.updateSlideWidth()
    this.reportChange(true)
    this.startAutoplay()
    window.addEventListener('resize', this.updateSlideWidth)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateSlideWidth)
    this.pauseAutoplay()
  },
  methods: {
    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max)
    },
    normalizeIndex(value, length) {
      const total = Number.isFinite(length) ? length : this.slideCount

      if (!total) {
        return 0
      }

      if (!Number.isFinite(value)) {
        return 0
      }

      return this.clamp(value, 0, total - 1)
    },
    slideKey(item, renderIndex) {
      return item && item.id ? `${item.id}-${renderIndex}` : renderIndex
    },
    toLogicalIndex(renderIndex) {
      if (!this.slideCount) {
        return 0
      }

      if (!this.canLoop) {
        return renderIndex
      }

      if (renderIndex === 0) {
        return this.slideCount - 1
      }

      if (renderIndex === this.renderedItems.length - 1) {
        return 0
      }

      return renderIndex - 1
    },
    fallbackBackground(index) {
      const backgrounds = [
        'linear-gradient(135deg, #0f766e, #14b8a6)',
        'linear-gradient(135deg, #1d4ed8, #38bdf8)',
        'linear-gradient(135deg, #ea580c, #f59e0b)'
      ]

      return backgrounds[index % backgrounds.length]
    },
    updateSlideWidth() {
      if (!this.$refs.viewport) {
        return
      }

      this.slideWidth = this.$refs.viewport.clientWidth
    },
    shouldAutoplay() {
      return this.autoplay && this.slideCount > 1
    },
    startAutoplay() {
      if (!this.shouldAutoplay()) {
        return
      }

      this.pauseAutoplay()
      this.autoplayTimer = window.setInterval(() => {
        this.next()
      }, this.interval)
    },
    pauseAutoplay() {
      if (!this.autoplayTimer) {
        return
      }

      window.clearInterval(this.autoplayTimer)
      this.autoplayTimer = null
    },
    resumeAutoplay() {
      if (this.isDragging) {
        return
      }

      this.startAutoplay()
    },
    restartAutoplay() {
      this.pauseAutoplay()
      this.resumeAutoplay()
    },
    reportChange(force) {
      if (!this.slideCount) {
        return
      }

      if (!force && this.lastReportedIndex === this.activeIndex) {
        return
      }

      this.lastReportedIndex = this.activeIndex
      this.$emit('change', {
        index: this.activeIndex,
        item: this.normalizedItems[this.activeIndex]
      })
    },
    setRenderIndex(index, useTransition) {
      const safeIndex = this.normalizeIndex(index)

      this.transitionEnabled = useTransition
      this.currentRenderIndex = this.canLoop ? safeIndex + 1 : safeIndex
      this.dragOffset = 0
      this.$nextTick(() => {
        this.updateSlideWidth()
        this.reportChange(true)
      })
    },
    resetPosition(index) {
      this.pauseAutoplay()
      this.setRenderIndex(index, false)
      this.$nextTick(() => {
        this.resumeAutoplay()
      })
    },
    goTo(index) {
      if (this.slideCount <= 1) {
        return
      }

      this.pauseAutoplay()
      this.transitionEnabled = true
      this.currentRenderIndex = this.canLoop
        ? this.normalizeIndex(index) + 1
        : this.normalizeIndex(index)
      this.dragOffset = 0
      this.reportChange(true)
      this.resumeAutoplay()
    },
    next() {
      if (this.slideCount <= 1) {
        return
      }

      if (!this.canLoop && this.currentRenderIndex >= this.slideCount - 1) {
        this.pauseAutoplay()
        return
      }

      this.transitionEnabled = true
      this.dragOffset = 0
      this.currentRenderIndex += 1
      this.reportChange(true)
    },
    prev() {
      if (this.slideCount <= 1) {
        return
      }

      if (!this.canLoop && this.currentRenderIndex <= 0) {
        return
      }

      this.transitionEnabled = true
      this.dragOffset = 0
      this.currentRenderIndex -= 1
      this.reportChange(true)
    },
    handleTransitionEnd() {
      if (!this.canLoop) {
        this.resumeAutoplay()
        return
      }

      if (this.currentRenderIndex === 0) {
        this.transitionEnabled = false
        this.currentRenderIndex = this.slideCount
      } else if (this.currentRenderIndex === this.renderedItems.length - 1) {
        this.transitionEnabled = false
        this.currentRenderIndex = 1
      }

      this.$nextTick(() => {
        this.reportChange()
        this.resumeAutoplay()
      })
    },
    handleTouchStart(event) {
      if (this.slideCount <= 1 || !event.touches.length) {
        return
      }

      const touch = event.touches[0]

      this.pauseAutoplay()
      this.isDragging = true
      this.isHorizontalSwipe = false
      this.transitionEnabled = false
      this.dragOffset = 0
      this.touchStartX = touch.clientX
      this.touchStartY = touch.clientY
    },
    handleTouchMove(event) {
      if (!this.isDragging || !event.touches.length) {
        return
      }

      const touch = event.touches[0]
      const deltaX = touch.clientX - this.touchStartX
      const deltaY = touch.clientY - this.touchStartY

      if (!this.isHorizontalSwipe) {
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 6) {
          this.cancelDrag()
          return
        }

        if (Math.abs(deltaX) > 6) {
          this.isHorizontalSwipe = true
        }
      }

      if (!this.isHorizontalSwipe) {
        return
      }

      event.preventDefault()

      const isEdgeDrag =
        !this.canLoop &&
        ((this.currentRenderIndex === 0 && deltaX > 0) ||
          (this.currentRenderIndex === this.slideCount - 1 && deltaX < 0))

      this.dragOffset = isEdgeDrag ? deltaX * 0.35 : deltaX
    },
    handleTouchEnd() {
      if (!this.isDragging) {
        return
      }

      const threshold = this.slideWidth
        ? Math.min(this.swipeThreshold, this.slideWidth * 0.22)
        : this.swipeThreshold
      const movedDistance = Math.abs(this.dragOffset)
      const goNext = this.dragOffset < 0

      this.isDragging = false
      this.isHorizontalSwipe = false
      this.transitionEnabled = true

      if (movedDistance >= threshold) {
        this.dragOffset = 0

        if (goNext) {
          this.next()
        } else {
          this.prev()
        }

        return
      }

      this.dragOffset = 0
      this.resumeAutoplay()
    },
    handleTouchCancel() {
      this.cancelDrag()
    },
    cancelDrag() {
      this.isDragging = false
      this.isHorizontalSwipe = false
      this.transitionEnabled = true
      this.dragOffset = 0
      this.resumeAutoplay()
    }
  }
}
</script>

<style scoped lang="less">
.swipe-carousel {
  width: 100%;
}

.swipe-carousel__viewport {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  touch-action: pan-y;
  user-select: none;
}

.swipe-carousel__track {
  display: flex;
  height: 100%;
  will-change: transform;
}

.swipe-carousel__slide {
  flex: 0 0 100%;
  width: 100%;
  min-width: 0;
  height: 100%;
}

.swipe-carousel__fallback {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
  height: 100%;
  padding: 28px;
  color: #ffffff;
}

.swipe-carousel__fallback-eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  opacity: 0.82;
}

.swipe-carousel__fallback-title {
  font-size: 32px;
  line-height: 1.08;
}

.swipe-carousel__fallback-desc {
  max-width: 280px;
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.88);
}

.swipe-carousel__controls {
  position: absolute;
  top: 18px;
  right: 18px;
  left: 18px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.swipe-carousel__control {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(12px);
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.swipe-carousel__control:hover {
  transform: scale(1.04);
  background: rgba(255, 255, 255, 0.28);
}

.swipe-carousel__control span {
  font-size: 24px;
  line-height: 1;
}

.swipe-carousel__indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}

.swipe-carousel__indicator {
  width: 10px;
  height: 10px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.16);
  cursor: pointer;
  transition: width 0.22s ease, background 0.22s ease;
}

.swipe-carousel__indicator.is-active {
  width: 28px;
  background: #0f766e;
}

@media (max-width: 640px) {
  .swipe-carousel__fallback {
    padding: 24px 20px;
  }

  .swipe-carousel__fallback-title {
    font-size: 28px;
  }

  .swipe-carousel__controls {
    top: 14px;
    right: 14px;
    left: 14px;
  }
}
</style>
