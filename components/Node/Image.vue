<template>
  <div
    class="image-container"
    :class="format"
  >
    <img
      :src="src"
      :alt="alt"
      class="chapter-image"
    />
    <div
      v-if="caption"
      class="image-caption"
    >
      {{ caption }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  src: String,
  alt: String,
  caption: String,
  format: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
.image-container {
  margin: 15px 0;
  text-align: center;
}

.chapter-image {
  max-width: 100%;
  height: auto;
}

.image-caption {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  font-style: italic;
}
</style>
