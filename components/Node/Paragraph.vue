<template>
  <p
    :class="format"
    v-html="content"
  />
</template>

<script setup lang="ts">
defineProps({
  content: {
    type: String,
    required: true,
  },
  format: { type: Array, default: () => [] },
});
</script>
