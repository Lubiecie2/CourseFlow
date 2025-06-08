<script setup>
import { ref, onMounted } from "vue";

definePageMeta({
  layout: "login",
  middleware: "auth",
});

// ------ Zmienne ----------------------------------------------------------

const notifications = ref([]);
const isLoading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = 15;

// ------ Pobieranie powiadomień -------------------------------------------

const fetchNotifications = async (page = 1) => {
  try {
    isLoading.value = true;
    error.value = null;
    currentPage.value = page;

    const response = await useApiFrontend(
      `notifications?page=${page}&limit=${itemsPerPage}`
    );

    if (response && response.success) {
      notifications.value = response.notifications;
      if (response.pagination) {
        totalPages.value = response.pagination.totalPages || 1;
      }
    } else {
      throw new Error("Nie udało się pobrać powiadomień");
    }
  } catch (err) {
    error.value = err.message || "Wystąpił błąd podczas ładowania powiadomień";
    console.error("Błąd podczas pobierania powiadomień:", err);
  } finally {
    isLoading.value = false;
  }
};

// ------ Formatowanie daty ------------------------------------------------

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// ------ Paginacja --------------------------------------------------------

const prevPage = () => {
  if (currentPage.value > 1) {
    fetchNotifications(currentPage.value - 1);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    fetchNotifications(currentPage.value + 1);
  }
};

// ------ Ładowanie danych na start ----------------------------------------

onMounted(() => {
  fetchNotifications();
});
</script>

<template>
  <div class="page-wrapper">
    <mainNavbar />
    <div class="notifications-page">
      <div class="page-header">
        <h1>Centrum powiadomień</h1>
        <p>
          Przeglądaj informacje o aktualnościach i zmianach w Twoich kursach
        </p>
      </div>

      <div
        v-if="isLoading"
        class="loading-state"
      >
        <div class="spinner"></div>
        <p>Wczytywanie powiadomień...</p>
      </div>

      <div
        v-else-if="error"
        class="error-message"
      >
        {{ error }}
        <button
          @click="fetchNotifications()"
          class="btn-retry"
        >
          Spróbuj ponownie
        </button>
      </div>

      <div
        v-else-if="notifications.length === 0"
        class="empty-state"
      >
        <div class="empty-icon">🔔</div>
        <h3>Brak powiadomień</h3>
        <p>
          W tym miejscu będą wyświetlane wszystkie informacje o Twoich kursach i
          aktualnościach platformy.
        </p>
      </div>

      <div
        v-else
        class="notifications-table-container"
      >
        <table class="notifications-table">
          <thead>
            <tr>
              <th class="icon-column"></th>
              <th class="title-column">Tytuł</th>
              <th class="message-column">Treść</th>
              <th class="date-column">Data otrzymania</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="notification in notifications"
              :key="notification.id"
              :class="{ unread: !notification.is_read }"
            >
              <td class="icon-column">
                <div
                  class="notification-icon"
                  :class="notification.type"
                >
                  <img
                    v-if="notification.type === 'ADMIN_ANNOUNCEMENT'"
                    src="/public/images/businessman.png"
                    alt="Ogłoszenie administratora"
                  />
                  <img
                    v-else-if="notification.type === 'NEW_COURSE'"
                    src="/public/images/cts.png"
                    alt="Nowy kurs"
                  />
                  <img
                    v-else
                    src="/public/images/bell.png"
                    alt="Powiadomienie"
                  />
                </div>
              </td>
              <td class="title-column">
                <strong>{{ notification.title }}</strong>
              </td>
              <td class="message-column">{{ notification.message }}</td>
              <td class="date-column">
                {{ formatDate(notification.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="totalPages > 1"
          class="pagination"
        >
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="pagination-button"
          >
            &laquo; Poprzednia
          </button>
          <span class="page-info">{{ currentPage }} z {{ totalPages }}</span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="pagination-button"
          >
            Następna &raquo;
          </button>
        </div>
      </div>
    </div>
    <div class="footer-spacer"></div>
    <foter></foter>
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.notifications-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  flex: 1;
}

.footer-spacer {
  height: 60px;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.page-header h1 {
  margin-bottom: 10px;
  color: #333;
  font-size: 28px;
}

.page-header p {
  color: #666;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #eb5757;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.btn-retry {
  background-color: #c62828;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #666;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #333;
}

.empty-state p {
  max-width: 400px;
  margin: 0 auto;
}

.notifications-table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
}

.notifications-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.notifications-table th {
  background-color: #f8f9fa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e9ecef;
  text-transform: uppercase;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.notifications-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.notifications-table tbody tr:last-child td {
  border-bottom: none;
}

.notifications-table tbody tr:hover {
  background-color: #f8f9fa;
}

.notifications-table tr.unread {
  background-color: #f0f7ff;
}

.notifications-table tr.unread:hover {
  background-color: #e6f2ff;
}

.notifications-table .icon-column {
  width: 60px;
}

.notifications-table .date-column {
  width: 150px;
  white-space: nowrap;
  text-align: right;
  color: #6c757d;
  font-size: 12px;
}

.notifications-table .title-column {
  width: 25%;
  font-weight: 500;
}

.notifications-table .message-column {
  color: #555;
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-icon img {
  width: 32px;
  height: 32px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  padding: 10px 0;
  gap: 15px;
}

.pagination-button {
  background-color: #f0f0f0;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination-button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}

@media (max-width: 768px) {
  .notifications-table .date-column {
    display: none;
  }

  .notifications-table .message-column {
    display: none;
  }

  .notifications-table .title-column {
    width: auto;
  }
}
</style>
