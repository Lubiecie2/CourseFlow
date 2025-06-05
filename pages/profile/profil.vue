<script lang="ts" setup>
definePageMeta({
  layout: "login",
  middleware: "auth",
});

const router = useRouter();
const { data: user } = await useApiServer("auth/me");
const { data: statsData } = await useApiServer("user/stats");
const { data: activityData } = await useApiServer("user/activity");
const showDeleteDialog = ref(false);
const isDeleting = ref(false);
const stats = computed(() => statsData?.value?.stats || {});
const recentActivity = computed(() => activityData?.value?.activities || []);

const isEditing = ref(false);
const editedUser = ref({
  firstName: user?.value?.firstName || "",
  lastName: user?.value?.lastName || "",
  email: user?.value?.email || "",
});
const saveProfile = async () => {
  try {
    const saveSuccess = ref(false);

    const response = await useApiFrontend("user/profile", {
      method: "PATCH",
      body: editedUser.value,
    });

    if (response.success) {
      saveSuccess.value = true;
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  } catch (error) {
    console.error("Błąd podczas aktualizacji profilu:", error);
  }
};

const openDeleteDialog = () => {
  showDeleteDialog.value = true;
};

const cancelDelete = () => {
  showDeleteDialog.value = false;
};

const confirmDeleteAccount = async () => {
  try {
    isDeleting.value = true;

    const response = await useApiFrontend("user/account", {
      method: "DELETE",
    });

    console.log("Odpowiedź serwera po usunięciu konta:", response);

    if (response.success) {
      try {
        localStorage.clear();

        document.cookie.split(";").forEach(function (c) {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/"
            );
        });

        const authStore = useAuthStore();
        authStore.logout();
      } catch (e) {
        console.error("Błąd podczas czyszczenia danych sesji:", e);
      }

      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } else {
      isDeleting.value = false;
      showDeleteDialog.value = false;
    }
  } catch (error) {
    console.error("Błąd podczas usuwania konta:", error);
    isDeleting.value = false;
    showDeleteDialog.value = false;
  }
};

const toggleEditMode = () => {
  if (isEditing.value) {
    editedUser.value = {
      firstName: user?.value?.firstName || "",
      lastName: user?.value?.lastName || "",
      email: user?.value?.email || "",
    };
  }
  isEditing.value = !isEditing.value;
};

const coursesEnrolled = computed(() => stats.value?.enrolledCourses || 0);
const coursesCompleted = computed(() => stats.value?.completedCourses || 0);
const testsCompleted = computed(() => stats.value?.completedTests || 0);
const certificatesEarned = computed(() => stats.value?.certificatesEarned || 0);

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "Brak danych";
  return new Date(date).toLocaleDateString("pl-PL");
};

type ActivityType = "course" | "test" | "certificate" | string;

const getActivityTypeName = (type: ActivityType): string => {
  switch (type) {
    case "course":
      return "Kurs";
    case "test":
      return "Test";
    case "certificate":
      return "Certyfikat";
    default:
      return "Aktywność";
  }
};

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
    <div class="profile-header">
      <h1>Mój Profil</h1>
      <button
        @click="toggleEditMode"
        class="edit-button"
      >
        {{ isEditing ? "Anuluj" : "Edytuj profil" }}
      </button>
    </div>

    <div class="profile-content">
      <div class="profile-column">
        <div class="profile-card">
          <h2>Dane osobowe</h2>
          <div class="avatar-section">
            <div class="avatar-icon">
              <span v-if="user?.firstName && user?.lastName">
                {{ user.firstName[0] }}{{ user.lastName[0] }}
              </span>
              <span v-else>👤</span>
            </div>
            <div
              v-if="!isEditing"
              class="user-name"
            >
              {{ user?.firstName || "Użytkownik" }} {{ user?.lastName || "" }}
            </div>
          </div>

          <div
            v-if="isEditing"
            class="edit-form"
          >
            <div class="form-group">
              <label>Imię</label>
              <input
                v-model="editedUser.firstName"
                type="text"
                class="form-input"
                placeholder="Wprowadź imię"
              />
            </div>

            <div class="form-group">
              <label>Nazwisko</label>
              <input
                v-model="editedUser.lastName"
                type="text"
                class="form-input"
                placeholder="Wprowadź nazwisko"
              />
            </div>

            <div class="form-group">
              <label>E-mail</label>
              <input
                v-model="editedUser.email"
                type="email"
                class="form-input"
                disabled
              />
              <small>Adresu e-mail nie można zmienić</small>
            </div>

            <button
              @click="saveProfile"
              class="save-button"
            >
              Zapisz zmiany
            </button>
            <button
              @click="openDeleteDialog"
              class="delete-button"
            >
              Usuń konto
            </button>
            <div
              v-if="showDeleteDialog"
              class="delete-dialog-overlay"
            >
              <div class="delete-dialog">
                <h3>Potwierdź usunięcie konta</h3>
                <p>
                  Uwaga! Ta operacja jest nieodwracalna. Wszystkie Twoje dane
                  zostaną trwale usunięte.
                </p>

                <div class="dialog-buttons">
                  <button
                    @click="cancelDelete"
                    class="cancel-button"
                    :disabled="isDeleting"
                  >
                    Anuluj
                  </button>
                  <button
                    @click="confirmDeleteAccount"
                    class="confirm-delete-button"
                    :disabled="isDeleting"
                  >
                    {{ isDeleting ? "Usuwanie..." : "Potwierdź usunięcie" }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="user-details"
          >
            <div class="detail-item">
              <div class="detail-label">Imię</div>
              <div class="detail-value">{{ user?.firstName || "Brak" }}</div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Nazwisko</div>
              <div class="detail-value">{{ user?.lastName || "Brak" }}</div>
            </div>

            <div class="detail-item">
              <div class="detail-label">E-mail</div>
              <div class="detail-value">{{ user?.email || "Brak" }}</div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Data rejestracji</div>
              <div class="detail-value">{{ formatDate(user?.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-column">
        <div class="profile-card">
          <h2>Statystyki nauki</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div class="stat-value">{{ coursesEnrolled }}</div>
              <div class="stat-label">Zapisanych kursów</div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-value">{{ coursesCompleted }}</div>
              <div class="stat-label">Ukończonych kursów</div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-value">{{ testsCompleted }}</div>
              <div class="stat-label">Zaliczonych testów</div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🏆</div>
              <div class="stat-value">{{ certificatesEarned }}</div>
              <div class="stat-label">Zdobytych certyfikatów</div>
            </div>
          </div>

          <div
            v-if="recentActivity.length > 0"
            class="activity-section"
          >
            <h3>Ostatnia aktywność</h3>
            <ul class="activity-list">
              <li
                v-for="(activity, index) in recentActivity.slice(0, 3)"
                :key="index"
                class="activity-item"
              >
                <div
                  class="activity-icon"
                  :class="activity.type"
                >
                  <span v-if="activity.type === 'course'">📚</span>
                  <span v-else-if="activity.type === 'test'">
                    {{ activity.passed ? "✅" : "❌" }}
                  </span>
                  <span v-else-if="activity.type === 'certificate'">🏆</span>
                  <span v-else>📌</span>
                </div>
                <div class="activity-details">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-meta">
                    <span class="activity-type">
                      {{ getActivityTypeName(activity.type) }}
                    </span>
                    <span class="activity-date">
                      {{ formatDate(activity.date) }}
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="navigation-section">
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
  </div>
  <foter></foter>
</template>

<style scoped>
.profile-container {
  max-width: 1200px;
  min-height: 800px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: Arial, sans-serif;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.profile-header h1 {
  font-size: 28px;
  color: #333;
  margin: 0;
  position: relative;
  display: inline-block;
}

.profile-header h1::after {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 40px;
  height: 3px;
  background-color: #eb5757;
  border-radius: 3px;
}

.edit-button {
  background-color: #f1f1f1;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
}

.edit-button:hover {
  background-color: #e1e1e1;
}

.profile-content {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
}

.profile-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.profile-column:first-child {
  flex: 2;
}

.profile-column:last-child {
  flex: 3;
}

.profile-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  height: 100%;
}

.profile-card h2 {
  font-size: 18px;
  color: #333;
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.profile-card h3 {
  font-size: 16px;
  color: #555;
  margin-top: 25px;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-icon {
  font-size: 24px;
  background-color: #eb5757;
  color: white;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(235, 87, 87, 0.2);
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.edit-form {
  width: 100%;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  border-color: #eb5757;
  outline: none;
}

.form-input:disabled {
  background-color: #f9f9f9;
  cursor: not-allowed;
}

.small {
  font-size: 12px;
  color: #777;
  display: block;
  margin-top: 4px;
}

.save-button {
  background-color: #eb5757;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  margin-top: 8px;
  width: 100%;
}

.save-button:hover {
  background-color: #d04848;
}

.delete-button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  margin-top: 12px;
  width: 100%;
}

.delete-button:hover {
  background-color: #d32f2f;
}

.delete-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.delete-dialog {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.delete-dialog h3 {
  color: #f44336;
  margin-top: 0;
  margin-bottom: 16px;
}

.delete-error {
  color: #f44336;
  margin: 12px 0;
  font-size: 14px;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button {
  background-color: #f1f1f1;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}

.confirm-delete-button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}

.confirm-delete-button:disabled,
.cancel-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 10px;
}

.stat-card {
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #eb5757;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

.activity-section {
  margin-top: 10px;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  font-size: 16px;
}

.activity-icon.course {
  background-color: #e6f7ff;
  color: #1890ff;
}

.activity-icon.test {
  background-color: #f6ffed;
  color: #52c41a;
}

.activity-icon.certificate {
  background-color: #fff7e6;
  color: #fa8c16;
}

.activity-details {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.activity-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.activity-type {
  color: #777;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.activity-date {
  color: #999;
}

.navigation-section {
  margin-top: 30px;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
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
  margin-right: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.red-button:hover {
  background-color: rgba(235, 87, 87, 0.95);
}

@media (max-width: 992px) {
  .profile-content {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .navigation-buttons {
    flex-direction: column;
  }

  .red-button {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
}

@media (max-width: 480px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .edit-button {
    align-self: flex-start;
  }

  .profile-card {
    padding: 16px;
  }
}
</style>
