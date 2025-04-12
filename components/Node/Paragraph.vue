<template>
  <p
    :class="$attrs.format"
    v-html="content"
  />
</template>

<script setup lang="ts">
defineProps({
  content: {
    type: String,
    required: true,
  },
});
</script>
