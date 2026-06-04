<template>
  <div
    class="rating-stars"
    role="radiogroup"
    :aria-label="ariaLabel"
    :style="ratingStyle"
  >
    <button
      v-for="index in max"
      :key="index"
      class="rating-stars__item"
      :class="{ 'is-active': index <= normalizedValue }"
      type="button"
      role="radio"
      :aria-checked="index === normalizedValue ? 'true' : 'false'"
      :aria-label="`${index} 星`"
      :disabled="readonly"
      @click="setValue(index)"
    >
      <svg
        class="rating-stars__shape"
        viewBox="0 0 100 100"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M50 10 L61.8 36.6 L90 39.4 L68.8 58.2 L75 86 L50 71.5 L25 86 L31.2 58.2 L10 39.4 L38.2 36.6 Z"
        />
      </svg>
    </button>
  </div>
</template>

<script>
export default {
  name: 'RatingStars',
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 5
    },
    readonly: {
      type: Boolean,
      default: false
    },
    size: {
      type: Number,
      default: 42
    },
    gap: {
      type: Number,
      default: 17
    },
    activeColor: {
      type: String,
      default: '#ffd21f'
    },
    inactiveColor: {
      type: String,
      default: '#f3f4f7'
    },
    ariaLabel: {
      type: String,
      default: '评分'
    }
  },
  computed: {
    normalizedValue() {
      return this.clamp(Math.round(this.value), 0, this.max)
    },
    ratingStyle() {
      return {
        '--rating-size': `${this.size}px`,
        '--rating-gap': `${this.gap}px`,
        '--rating-active': this.activeColor,
        '--rating-inactive': this.inactiveColor
      }
    }
  },
  methods: {
    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max)
    },
    setValue(index) {
      if (this.readonly) {
        return
      }

      this.$emit('input', index)
      this.$emit('change', index)
    }
  }
}
</script>

<style scoped lang="less">
.rating-stars {
  display: inline-flex;
  align-items: center;
  gap: var(--rating-gap);
}

.rating-stars__item {
  width: var(--rating-size);
  height: var(--rating-size);
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--rating-inactive);
  cursor: pointer;
  transition: transform 0.16s ease, color 0.16s ease;
}

.rating-stars__item.is-active {
  color: var(--rating-active);
}

.rating-stars__item:disabled {
  cursor: default;
}

.rating-stars__item:not(:disabled):hover {
  transform: translateY(-2px) scale(1.03);
}

.rating-stars__item:focus-visible {
  outline: 2px solid rgba(255, 210, 31, 0.72);
  outline-offset: 6px;
}

.rating-stars__shape {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 8;
  stroke-linejoin: round;
  stroke-linecap: round;
}
</style>
