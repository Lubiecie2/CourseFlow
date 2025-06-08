<template>
  <div :class="formatClasses">
    <ul
      v-if="type === 'unordered'"
      class="node-list"
    >
      <li
        v-for="(item, index) in items"
        :key="index"
      >
        {{ item }}
      </li>
    </ul>
    <ol
      v-else-if="type === 'ordered'"
      class="node-list"
    >
      <li
        v-for="(item, index) in items"
        :key="index"
      >
        {{ item }}
      </li>
    </ol>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default: "unordered",
  },
  format: {
    type: Array,
    default: () => [],
  },
});

const formatClasses = computed(() => {
  if (!props.format || !Array.isArray(props.format)) return {};

  const classes = {};
  props.format.forEach((fmt) => {
    classes[fmt] = true;
  });

  return classes;
});
</script>

<style>
.node-list {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

ul.node-list {
  list-style-type: disc;
}

ol.node-list {
  list-style-type: decimal;
}

.text-center .node-list {
  list-style-position: inside;
  padding-left: 0;
  text-align: center;
}

.text-right .node-list {
  list-style-position: inside;
  padding-left: 0;
  text-align: right;
}

.text-center .node-list li,
.text-right .node-list li {
  margin-bottom: 0.5em;
}
</style>
