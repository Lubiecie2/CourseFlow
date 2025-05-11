<script lang="ts" setup>
definePageMeta({
  layout: "login",
  middleware: "auth",
});

import { ref, onMounted } from "vue";
const router = useRouter();
const courses = ref([]);
const isLoading = ref(true);
const error = ref("");

const checkUserCourses = async () => {
  try {
    isLoading.value = true;
    error.value = "";

    const { data, error: apiError } = await useApiServer(
      "/userCourse/registeredForCourse"
    );

    if (apiError.value) {
      throw new Error(
        apiError.value.message || "Błąd podczas pobierania danych."
      );
    }

    courses.value = data.value || [];
  } catch (err) {
    console.error("Błąd podczas pobierania kursów:", err);
    error.value = "Nie udało się załadować kursów. Spróbuj odświeżyć stronę.";
  } finally {
    isLoading.value = false;
  }
};

const goToProfile = () => {
  router.push("/profile/profil");
};

const goToBadges = () => {
  router.push("/profile/badges");
};

onMounted(checkUserCourses);
</script>

<template>
  <UserNavbar></UserNavbar>
  <h2>Moje kursy</h2>
  <div
    v-if="isLoading"
    class="loading-state"
  >
    <div class="spinner"></div>
    <p>Wczytywanie kursów...</p>
  </div>

  <div
    v-else-if="error"
    class="error-state"
  >
    <p>{{ error }}</p>
    <button
      @click="checkUserCourses"
      class="retry-btn"
    >
      Spróbuj ponownie
    </button>
  </div>

  <div
    v-else-if="courses.length === 0"
    class="empty-state"
  >
    <div class="empty-icon">🔍</div>
    <h3>Nie masz jeszcze żadnych kursów</h3>
    <p>Zapisz się na kursy, aby rozpocząć naukę.</p>
    <NuxtLink
      to="/courses"
      class="browse-courses-btn"
    >
      Przeglądaj kursy
    </NuxtLink>
  </div>

  <courseCardList
    v-else
    userCoursesOnly
  ></courseCardList>

  <div class="navigation-buttons">
    <button
      @click="goToProfile"
      class="red-button"
    >
      Powrót do profilu
    </button>

    <button
      @click="goToBadges"
      class="red-button"
    >
      Odznaki i certyfikaty
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

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 50px 20px;
  margin: 30px auto;
  max-width: 600px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(235, 87, 87, 0.2);
  border-top-color: #eb5757;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.empty-state p {
  margin-bottom: 25px;
  color: #666;
}

.browse-courses-btn {
  display: inline-block;
  background-color: #eb5757;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s;
}

.browse-courses-btn:hover {
  background-color: #d63031;
}

.retry-btn {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px;
  font-weight: 500;
}
</style>
