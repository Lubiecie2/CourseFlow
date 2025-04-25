<template>
  <div
    class="video-container"
    :class="format"
  >
    <video
      class="video-player"
      controls
    >
      <source
        :src="src"
        :type="videoType"
      />
      Twoja przeglądarka nie obsługuje odtwarzania wideo.
    </video>
    <p
      v-if="caption"
      class="video-caption"
    >
      {{ caption }}
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  caption: String,
  format: {
    type: [Array, String],
    default: () => [],
  },
});

const videoType = computed(() => {
  const src = props.src || "";
  if (src.endsWith(".mp4")) return "video/mp4";
  if (src.endsWith(".webm")) return "video/webm";
  if (src.endsWith(".ogg")) return "video/ogg";
  if (src.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
});
</script>

<style scoped>
.video-container {
  margin: 20px 0;
  width: 100%;
}

.video-player {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.video-caption {
  margin-top: 10px;
  font-style: italic;
  color: #555;
  text-align: center;
}

.video-sm {
  max-width: 25%;
}

.video-md {
  max-width: 50%;
}

.video-lg {
  max-width: 75%;
}

.video-full {
  width: 100%;
}
</style>
