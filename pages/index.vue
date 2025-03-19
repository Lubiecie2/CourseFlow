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
    <mainPageThirdSection></mainPageThirdSection>
    <mainPageFourthSectionVue></mainPageFourthSectionVue>
    <mainPageOpinions></mainPageOpinions>
    <foter></foter>
  </div>
</template>

<style>
.pause {
  width: 100%;
  height: 700px;
}
</style>
