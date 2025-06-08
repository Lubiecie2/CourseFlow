<script setup>
import { ref, onMounted } from "vue";

definePageMeta({
  layout: "login",
  middleware: ["auth", "admin-auth"],
  pagePermissions: ["PANEL_SHOW_ADMIN_PANEL"],
});

const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  totalCourses: 0,
  totalTests: 0,
  totalChapters: 0,
  totalCertificates: 0,
  newUsers: 0,
});

const isLoading = ref(true);
const error = ref(null);

const fetchStats = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await useApiFrontend("admin/stats");

    if (response && response.success) {
      stats.value = response.data;
    } else {
      throw new Error("Nie udało się pobrać statystyk platformy");
    }
  } catch (err) {
    console.error("Błąd podczas pobierania statystyk:", err);
    error.value = "Wystąpił problem podczas ładowania statystyk platformy";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchStats);
</script>

<template>
  <AdminNavbar />

  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>Panel Administracyjny CourseFlow</h1>
      <p class="welcome-text">
        Tutaj masz kontrolę nad platformą. Zarządzaj kursami, użytkownikami i
        innymi ważnymi ustawieniami.
      </p>
    </div>

    <div class="stats-container">
      <h2>Statystyki platformy</h2>

      <div
        v-if="isLoading"
        class="loading-state"
      >
        <div class="spinner"></div>
        <p>Ładowanie statystyk...</p>
      </div>

      <div
        v-else-if="error"
        class="error-state"
      >
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button
          @click="fetchStats"
          class="refresh-button"
        >
          Odśwież dane
        </button>
      </div>

      <div
        v-else
        class="stats-grid"
      >
        <div class="stat-card">
          <div class="stat-icon users-icon">👥</div>
          <div class="stat-details">
            <h3>Użytkownicy</h3>
            <p class="stat-number">{{ stats.totalUsers }}</p>
            <p class="stat-caption">zarejestrowanych</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon active-icon">🔥</div>
          <div class="stat-details">
            <h3>Aktywni</h3>
            <p class="stat-number">{{ stats.activeUsers }}</p>
            <p class="stat-caption">w ostatnim miesiącu</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon new-users-icon">🆕</div>
          <div class="stat-details">
            <h3>Nowi użytkownicy</h3>
            <p class="stat-number">{{ stats.newUsers }}</p>
            <p class="stat-caption">w ostatnim miesiącu</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon courses-icon">📚</div>
          <div class="stat-details">
            <h3>Kursy</h3>
            <p class="stat-number">{{ stats.totalCourses }}</p>
            <p class="stat-caption">dostępnych</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon tests-icon">✍️</div>
          <div class="stat-details">
            <h3>Testy</h3>
            <p class="stat-number">{{ stats.totalTests }}</p>
            <p class="stat-caption">utworzonych</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon chapters-icon">📝</div>
          <div class="stat-details">
            <h3>Rozdziały</h3>
            <p class="stat-number">{{ stats.totalChapters }}</p>
            <p class="stat-caption">we wszystkich kursach</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon certs-icon">🏆</div>
          <div class="stat-details">
            <h3>Certyfikaty</h3>
            <p class="stat-number">{{ stats.totalCertificates }}</p>
            <p class="stat-caption">wydanych</p>
          </div>
        </div>
      </div>
    </div>

    <div class="quick-access">
      <h2>Szybki dostęp</h2>
      <div class="quick-links">
        <NuxtLink
          to="/courseList"
          class="quick-link-card"
        >
          <div class="quick-link-icon">📋</div>
          <div class="quick-link-text">
            <h3>Lista kursów</h3>
            <p>Przeglądaj i zarządzaj kursami</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/users"
          class="quick-link-card"
          v-if="usePermissionGuard('PANEL_SHOW_USERS')"
        >
          <div class="quick-link-icon">👤</div>
          <div class="quick-link-text">
            <h3>Użytkownicy</h3>
            <p>Zarządzaj użytkownikami</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/users/role"
          class="quick-link-card"
          v-if="usePermissionGuard('PANEL_SHOW_USERS')"
        >
          <div class="quick-link-icon">🔑</div>
          <div class="quick-link-text">
            <h3>Role i uprawnienia</h3>
            <p>Zarządzaj rolami i uprawnieniami</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/users/notifications"
          class="quick-link-card"
          v-if="usePermissionGuard('PANEL_CREATE_NOTIFICATIONS')"
        >
          <div class="quick-link-icon">🔔</div>
          <div class="quick-link-text">
            <h3>Powiadomienia</h3>
            <p>Wysyłaj powiadomienia do użytkowników</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  color: #333;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.welcome-text {
  font-size: 1.1rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto;
}

.stats-container,
.quick-access {
  margin-bottom: 3rem;
}

.stats-container h2,
.quick-access h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f1f1f1;
  padding-bottom: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 2.2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-right: 1rem;
}

.users-icon {
  background-color: #e3f2fd;
}
.active-icon {
  background-color: #fff8e1;
}
.new-users-icon {
  background-color: #f3e5f5;
}
.courses-icon {
  background-color: #e8f5e9;
}
.tests-icon {
  background-color: #fff3e0;
}
.chapters-icon {
  background-color: #f5f5f5;
}
.certs-icon {
  background-color: #fffde7;
}

.stat-details {
  flex: 1;
}

.stat-details h3 {
  font-size: 1rem;
  color: #666;
  margin: 0 0 0.5rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.stat-caption {
  color: #999;
  font-size: 0.9rem;
  margin: 0.2rem 0 0;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.quick-link-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.quick-link-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.quick-link-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.quick-link-text h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
}

.quick-link-text p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #eb5757;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.refresh-button {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  margin-top: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-button:hover {
  background-color: #d64545;
}

@media (max-width: 768px) {
  .stats-grid,
  .quick-links {
    grid-template-columns: 1fr;
  }

  .dashboard-header h1 {
    font-size: 2rem;
  }
}
</style>
