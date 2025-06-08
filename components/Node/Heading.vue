<template>
  <component
    :is="`h${level}`"
    :class="$attrs.format"
  >
    {{ content }}
  </component>
</template>

<script setup lang="ts">
defineProps({
  content: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    default: 1,
    validate: (value: number) => {
      return value >= 1 && value <= 6;
    },
  },
});
</script>
