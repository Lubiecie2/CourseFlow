<template>
  <p v-html="content" />
</template>

<script setup lang="ts">
defineProps({
  content: {
    type: String,
    required: true,
  },
});
</script>
