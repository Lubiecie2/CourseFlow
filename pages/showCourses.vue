<script setup>
import { ref } from "vue";

definePageMeta({
  layout: "login",
  middleware: ["auth", "admin-auth"],
  pagePermissions: ["PANEL_SHOW_ADMIN_PANEL"],
});
</script>
<template>
  <div>
    <mainNavbar></mainNavbar>
    <h1>Nasza oferta kursów</h1>

    <courseCardList></courseCardList>
  </div>
</template>

<style scoped></style>
