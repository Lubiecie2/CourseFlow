<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

// ----- Zmienne --------------------------------------------

const unreadCount = ref(0);
const showNotifications = ref(false);
const notifications = ref([]);
const isLoading = ref(false);
const refreshInterval = ref(null);

// ------ Pobieranie liczby nieprzeczytanych powiadomień ----

const fetchUnreadCount = async () => {
  try {
    const response = await useApiFrontend("notifications/unread-count");
    if (response && response.success) {
      unreadCount.value = response.count;
    }
  } catch (err) {
    console.error("Błąd podczas pobierania nieprzeczytanych powiadomień:", err);
  }
};

// ------ Pobieranie listy powiadomień ----------------------

const fetchNotifications = async () => {
  try {
    isLoading.value = true;
    const response = await useApiFrontend("notifications?limit=3");

    if (response && response.success) {
      notifications.value = response.notifications;
      unreadCount.value = 0;
    }
  } catch (err) {
    console.error("Błąd podczas pobierania powiadomień:", err);
  } finally {
    isLoading.value = false;
  }
};

// ------ Przełączanie widoczności panelu powiadomień -------

const toggleNotifications = async () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    await fetchNotifications();
  }
};

// ------ Obsługa kliknięć poza panelem powiadomień ---------

const handleClickOutside = (event) => {
  const panel = document.querySelector(".notifications-panel");
  const badge = document.querySelector(".notification-badge");

  if (
    panel &&
    badge &&
    !panel.contains(event.target) &&
    !badge.contains(event.target)
  ) {
    showNotifications.value = false;
  }
};

// ------ Formatowanie daty ---------------------------------

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

onMounted(() => {
  fetchUnreadCount();
  document.addEventListener("click", handleClickOutside);
  refreshInterval.value = setInterval(fetchUnreadCount, 600000); // 2 minuty
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  if (refreshInterval.value) clearInterval(refreshInterval.value);
});

// ------ Nawigacaja -------------------------------------------

const goToAllNotifications = () => {
  showNotifications.value = false;
  navigateTo("/notifications");
};
</script>

<template>
  <div class="notification-container">
    <div
      class="notification-badge"
      @click="toggleNotifications"
    >
      <img
        src="/public/images/bell.png"
        alt="Powiadomienia"
        class="bell-icon"
      />

      <span
        v-if="unreadCount > 0"
        class="notification-count"
      >
        {{ unreadCount > 99 ? "99+" : unreadCount }}
      </span>
    </div>

    <div
      v-if="showNotifications"
      class="notifications-panel"
    >
      <div class="notifications-header">
        <h3>Powiadomienia</h3>
      </div>

      <div class="notifications-content">
        <div
          v-if="isLoading"
          class="notifications-loading"
        >
          <div class="spinner"></div>
          <p>Ładowanie powiadomień...</p>
        </div>

        <div
          v-else-if="notifications.length === 0"
          class="notifications-empty"
        >
          <p>Brak powiadomień</p>
        </div>

        <div
          v-else
          class="notifications-list"
        >
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.is_read }"
          >
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
            <div class="notification-content">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-date">{{
                formatDate(notification.created_at)
              }}</span>
            </div>
          </div>
        </div>
        <div class="notifications-footer">
          <button
            @click="goToAllNotifications"
            class="view-all-button"
          >
            Zobacz wszystkie powiadomienia
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-container {
  position: relative;
}

.notification-badge {
  position: relative;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.notification-badge:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.bell-icon {
  width: 24px;
  height: 24px;
}

.notification-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #eb5757;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  font-weight: bold;
  border: 2px solid white;
}

.notifications-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  max-height: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.notifications-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background-color: #f8f8f8;
}

.notifications-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.notifications-content {
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  max-height: 350px;
}

.notifications-loading,
.notifications-empty {
  padding: 20px;
  text-align: center;
  color: #666;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #eb5757;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.notifications-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f9f9f9;
}

.notification-item.unread {
  background-color: #f0f7ff;
}

.notification-icon {
  margin-right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon img {
  width: 32px;
  height: 32px;
}

.notification-content {
  flex-grow: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px;
}

.notification-message {
  font-size: 12px;
  color: #666;
  margin: 0 0 4px;
}

.notifications-footer {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  text-align: center;
  background-color: #f8f8f8;
}

.view-all-button {
  background-color: #eb5757;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.view-all-button:hover {
  background-color: #d43f3f;
}

.notification-date {
  font-size: 10px;
  color: #999;
  display: block;
}
</style>
