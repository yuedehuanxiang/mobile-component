<template>
  <section class="rating-preview">
    <div class="rating-preview__stage">
      <RatingStars
        v-model="rating"
        :size="42"
        :gap="17"
        active-color="#ffd21f"
        inactive-color="#f1f2f5"
      />
    </div>
  </section>
</template>

<script>
import RatingStars from '../components/RatingStars.vue'

export default {
  name: 'RatingPreviewPage',
  components: {
    RatingStars
  },
  data() {
    return {
      rating: 3
    }
  }
}
</script>

<style scoped lang="less">
.rating-preview {
  display: flex;
  justify-content: center;
}

.rating-preview__stage {
  width: min(100%, 438px);
  min-height: 160px;
  padding: 38px 20px;
}
</style>
