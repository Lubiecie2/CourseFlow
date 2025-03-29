<script setup>
definePageMeta({
  middleware: ["auth", "admin-auth"],
  layout: "login",
  pagePermissions: ["PANEL_SHOW_COURSES"],
});
</script>

<template>
  <AdminNavbar />
  <div class="container">
    <h1 class="page-title">Lista Kursów</h1>
  </div>
</template>

<style scoped>
.container {
  width: 60%;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}
</style>
