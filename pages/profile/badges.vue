<script lang="ts" setup>
definePageMeta({
  layout: "login",
  middleware: "auth",
});

const { data: user } = await useApiServer("auth/me");
const router = useRouter();

const goToProfile = () => {
  router.push("/profile/profil");
};

const goToLearning = () => {
  router.push("/profile/learning");
};
</script>

<template>
  <UserNavbar></UserNavbar>
  <h2>Odznaki i certyfikaty</h2>
  <div class="navigation-buttons">
    <button
      @click="goToProfile"
      class="nav-button profile-button"
    >
      Powrót do profilu
    </button>
    <button
      @click="goToLearning"
      class="nav-button learning-button"
    >
      Moja nauka
    </button>
  </div>
  <foter></foter>
</template>

<style scoped>
h2 {
  text-align: center;
  font-size: 50px;
  margin-bottom: 16px;
  color: #333;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px 25px;
  background-color: #eb5757;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 220px;
  box-shadow: 0 4px 6px rgba(235, 87, 87, 0.15);
}

.nav-button:hover {
  background-color: #d63031;
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(235, 87, 87, 0.2);
}
</style>
