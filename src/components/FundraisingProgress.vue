<template>
  <div class="fundraising-progress">
    <div class="fundraising-progress__dates" :style="gridStyle">
      <div
        v-for="(item, index) in normalizedItems"
        :key="`date-${index}`"
        class="fundraising-progress__date"
        :class="alignmentClass(index)"
      >
        {{ item.date }}
      </div>
    </div>

    <div class="fundraising-progress__track-shell">
      <div class="fundraising-progress__track">
        <div class="fundraising-progress__track-line"></div>
        <div
          class="fundraising-progress__track-line fundraising-progress__track-line--active"
          :style="{ width: activeWidth }"
        ></div>
        <div
          v-if="showArrow"
          class="fundraising-progress__track-arrow"
          :style="{ left: activeWidth }"
        ></div>

        <div
          v-for="(item, index) in normalizedItems"
          :key="`node-${index}`"
          class="fundraising-progress__node"
          :class="nodeClass(index)"
          :style="{ left: nodeLeft(index) }"
        >
          <img
            v-if="index === normalizedCurrentIndex"
            class="fundraising-progress__icon"
            :src="currentNodeIcon"
            alt=""
          />
        </div>
      </div>
    </div>

    <div class="fundraising-progress__labels" :style="gridStyle">
      <div
        v-for="(item, index) in normalizedItems"
        :key="`label-${index}`"
        class="fundraising-progress__label"
        :class="[alignmentClass(index), { 'is-current': index === normalizedCurrentIndex }]"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script>
import currentNodeIcon from '../images/naozhong.png'

export default {
  name: 'FundraisingProgress',
  props: {
    items: {
      type: Array,
      default: function () {
        return []
      }
    },
    currentIndex: {
      type: Number,
      default: 0
    },
    progress: {
      type: Number,
      default: null
    }
  },
  computed: {
    currentNodeIcon() {
      return currentNodeIcon
    },
    normalizedItems() {
      return this.items.length
        ? this.items
        : [
            {
              label: '',
              date: ''
            }
          ]
    },
    lastIndex() {
      return this.normalizedItems.length - 1
    },
    normalizedCurrentIndex() {
      return this.clamp(this.currentIndex, 0, this.lastIndex)
    },
    progressValue() {
      if (!Number.isFinite(this.progress)) {
        return this.normalizedCurrentIndex
      }

      return this.clamp(this.progress, this.normalizedCurrentIndex, this.lastIndex)
    },
    gridStyle() {
      return {
        gridTemplateColumns: `repeat(${this.normalizedItems.length}, minmax(0, 1fr))`
      }
    },
    activeWidth() {
      if (this.lastIndex <= 0) {
        return '0%'
      }

      return `${(this.progressValue / this.lastIndex) * 100}%`
    },
    showArrow() {
      return this.progressValue > this.normalizedCurrentIndex && this.progressValue < this.lastIndex
    }
  },
  methods: {
    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max)
    },
    nodeLeft(index) {
      if (this.lastIndex <= 0) {
        return '50%'
      }

      return `${(index / this.lastIndex) * 100}%`
    },
    alignmentClass(index) {
      if (index === 0) {
        return 'is-left'
      }

      if (index === this.lastIndex) {
        return 'is-right'
      }

      return 'is-center'
    },
    nodeClass(index) {
      if (index === this.normalizedCurrentIndex) {
        return 'is-current'
      }

      if (index < this.progressValue) {
        return 'is-finished'
      }

      return 'is-upcoming'
    }
  }
}
</script>

<style scoped lang="less">
.fundraising-progress {
  width: 100%;
}

.fundraising-progress__dates,
.fundraising-progress__labels {
  display: grid;
  column-gap: 16px;
}

.fundraising-progress__date {
  min-height: 22px;
  font-size: 14px;
  line-height: 22px;
  color: #2f3742;
}

.fundraising-progress__track-shell {
  padding: 0 10px;
  margin-top: 8px;
}

.fundraising-progress__track {
  position: relative;
  height: 34px;
}

.fundraising-progress__track-line {
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 999px;
  background: #f9dede;
}

.fundraising-progress__track-line--active {
  right: auto;
  background: #e50012;
}

.fundraising-progress__track-arrow {
  position: absolute;
  top: 10px;
  width: 0;
  height: 0;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 12px solid #e50012;
  transform: translateX(-2px);
}

.fundraising-progress__node {
  position: absolute;
  top: 15px;
  z-index: 1;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.fundraising-progress__node.is-finished {
  width: 14px;
  height: 14px;
  background: #e50012;
  box-shadow: 0 0 0 4px #ffffff;
}

.fundraising-progress__node.is-upcoming {
  width: 14px;
  height: 14px;
  background: #f9dede;
  box-shadow: 0 0 0 4px #ffffff;
}

.fundraising-progress__node.is-current {
  width: 32px;
  height: 32px;
  box-shadow: 0 4px 12px rgba(229, 0, 18, 0.22), 0 0 0 6px #ffffff;
}

.fundraising-progress__icon {
  width: 32px;
  height: 32px;
  display: block;
}

.fundraising-progress__labels {
  margin-top: 12px;
  column-gap: 12px;
}

.fundraising-progress__label {
  font-size: 18px;
  line-height: 26px;
  color: #6e7077;
}

.fundraising-progress__label.is-current {
  font-weight: 600;
  color: #e50012;
}

.is-left {
  text-align: left;
}

.is-center {
  text-align: center;
}

.is-right {
  text-align: right;
}
</style>
