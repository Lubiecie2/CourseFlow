<script setup>
import { ref } from "vue";

definePageMeta({
  layout: "login",
  middleware: "admin-auth",
});
</script>

<template>
  <AdminNavbar />
  <div class="welcome-section">
    <h1>Witaj w Panelu Administratora!</h1>
    <p class="welcome-text">
      Tutaj masz pełną kontrolę nad platformą. Zarządzaj kursami, użytkownikami
      i innymi ważnymi ustawieniami.
    </p>
  </div>
</template>

<style scoped>
.welcome-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;
  position: relative;
  padding: 0 20px;
  text-align: center;
  background-color: #eb5757;
}

.welcome-section h1 {
  font-size: 50px;
  font-weight: 700;
  color: white;
  margin-bottom: 10px;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.6);
}

.welcome-text {
  font-size: 20px;
  line-height: 1.5;
  color: white;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .welcome-section h1 {
    font-size: 35px;
  }
  .welcome-text {
    font-size: 15px;
  }
}
</style>
