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
    <mainPageFirstSection></mainPageFirstSection>
    <MainPageThirdSection></MainPageThirdSection>
    <newPageEmailSection></newPageEmailSection>
    <MainPageOpinions></MainPageOpinions>
    <foter></foter>
  </div>
</template>

<style>
.pause {
  width: 100%;
  height: 700px;
}
</style>
