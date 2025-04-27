<script lang="ts" setup>
definePageMeta({
  layout: "login",
  middleware: "auth",
});

const router = useRouter();
const { data: user } = await useApiServer("auth/me");

const goToBadges = () => {
  router.push("/profile/badges");
};

const goToLearning = () => {
  router.push("/profile/learning");
};
</script>

<template>
  <UserNavbar></UserNavbar>
  <div class="profile-container">
    <div class="top-section">
      <div class="user-column">
        <div class="avatar-icon">👤</div>
        <h2>Szczegóły użytkownika</h2>
        <p><strong>E-mail</strong><br />{{ user?.email || "Brak" }}</p>
        <p><strong>Imię</strong><br />{{ user?.firstName || "Brak" }}</p>
        <p><strong>Nazwisko</strong><br />{{ user?.lastName || "Brak" }}</p>
      </div>
      <div class="divider-vertical"></div>
      <div class="activity-column">
        <h2>Aktywność konta</h2>
        <p>
          <strong>Pierwszy dostęp do strony:</strong><br />{{
            user?.createdAt || "Brak"
          }}
        </p>
      </div>
    </div>
    <div class="divider-horizontal"></div>
    <div class="navigation-buttons">
      <button
        @click="goToBadges"
        class="red-button"
      >
        Odznaki i certyfikaty
      </button>
      <button
        @click="goToLearning"
        class="red-button"
      >
        Moja nauka
      </button>
    </div>
  </div>
  <foter></foter>
</template>

<style scoped>
.profile-container {
  max-width: 1000px;
  min-height: 609px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: Arial, sans-serif;
}

.top-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
  padding-bottom: 30px;
}

.user-column,
.activity-column {
  flex: 1;
}

.avatar-icon {
  font-size: 48px;
  background-color: #eee;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

h2 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #111;
}

p {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
}

.divider-vertical {
  width: 1px;
  background-color: #ccc;
  height: auto;
}

.divider-horizontal {
  height: 1px;
  background-color: #ccc;
  margin: 30px 0;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}

.red-button {
  background-color: rgba(235, 87, 87, 0.85);
  color: white;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.red-button:hover {
  background-color: rgba(235, 87, 87, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.red-button:active {
  transform: translateY(0);
  background-color: rgba(194, 72, 72, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.red-button::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150px;
  height: 150px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: transform 0.5s, opacity 0.5s;
}

.red-button:active::after {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  transition: 0s;
}

@media (max-width: 768px) {
  .top-section {
    flex-direction: column;
    align-items: center;
  }

  .divider-vertical {
    display: none;
  }

  .navigation-buttons {
    flex-direction: column;
  }

  .nav-button {
    width: 100%;
    max-width: 300px;
  }
}
</style>
