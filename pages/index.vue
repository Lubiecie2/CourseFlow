<script lang="ts" setup>
import { onMounted } from "vue";

definePageMeta({
  layout: "login",
});
</script>

<template>
  <div>
    <mainNavbar></mainNavbar>
    <mainPageFirstSection></mainPageFirstSection>
    <mainPageCourse></mainPageCourse>
    <mainPageSecoundSection></mainPageSecoundSection>
    <div class="pause"></div>
    <newPageEmailSection></newPageEmailSection>
    <div class="pause"></div>

    <foter></foter>
  </div>
</template>

<style>
.pause {
  width: 100%;
  height: 700px;
}
</style>
