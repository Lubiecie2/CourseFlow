<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
});

const { data: user } = useAPI("auth/me");
</script>

<template>
  <div>
    <pre>{{ user }}</pre>
  </div>
</template>

<style scoped></style>
