<template>
  <div class="code-block">
    <div
      class="code-container"
      :class="{ 'with-line-numbers': showLineNumbers }"
    >
      <div
        v-if="showLineNumbers"
        class="line-numbers"
        contenteditable="false"
      >
        <div
          v-for="i in contentLines.length"
          :key="i"
          class="line-number"
        >
          {{ i }}
        </div>
      </div>
      <pre><code :class="language">{{ content }}</code></pre>
    </div>
    <div
      v-if="caption"
      class="code-caption"
    >
      {{ caption }}
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
  language: {
    type: String,
    default: "",
  },
  caption: {
    type: String,
    default: "",
  },
  format: {
    type: Array,
    default: () => [],
  },
  showLineNumbers: {
    type: Boolean,
    default: false,
  },
});

const contentLines = computed(() => {
  return props.content ? props.content.split("\n") : [];
});
</script>

<style scoped>
.code-block {
  margin: 1rem 0;
  position: relative;
}

.code-container {
  position: relative;
  display: flex;
}

pre {
  margin: 0;
  flex-grow: 1;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  padding-top: 1rem;
  overflow-x: auto;
  font-family: "Courier New", Courier, monospace;
  white-space: pre;
  line-height: 1.5;
  font-size: 16px;
}

.with-line-numbers pre {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: none;
}

.line-numbers {
  display: flex;
  flex-direction: column;
  pointer-events: none;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-right: none;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  padding: 1rem 0.5rem;
  padding-top: 1rem;
  text-align: right;
  user-select: none;
  color: #666;
  font-size: 16px;
  font-family: "Courier New", Courier, monospace;
  line-height: 1.5;
  min-width: 2.5rem;
  font-weight: 500;
}

.line-number {
  height: 1.5em;
  padding-top: 0;
  padding-bottom: 0;
}

code {
  line-height: 1.5;
  display: block;
  font-size: 16px;
}

.code-caption {
  font-style: italic;
  color: #666;
  text-align: center;
  margin-top: 0.5rem;
}
</style>
