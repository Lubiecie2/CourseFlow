<script setup>
definePageMeta({
  middleware: ["auth", "admin-auth"],
  layout: "login",
  pagePermissions: ["PANEL_CREATE_NOTIFICATIONS"],
});

// ------ Zmienne ------------------------------------------

const title = ref("");
const message = ref("");
const successMessage = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);

// ------ Wysyłanie powiadomienia -------------------------

const sendNotification = async () => {
  try {
    if (!title.value.trim() || !message.value.trim()) {
      errorMessage.value = "Tytuł i treść powiadomienia są wymagane";
      return;
    }

    isSubmitting.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    const response = await useApiFrontend("notifications/admin", {
      method: "POST",
      body: {
        title: title.value,
        message: message.value,
      },
    });

    successMessage.value =
      "Powiadomienie zostało wysłane do wszystkich użytkowników";
    title.value = "";
    message.value = "";

    setTimeout(() => {
      successMessage.value = "";
    }, 5000);
  } catch (err) {
    console.error("Błąd podczas wysyłania powiadomienia:", err);
    errorMessage.value = "Wystąpił błąd podczas wysyłania powiadomienia";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div>
    <AdminNavbar />
    <div class="course-management">
      <div class="sidebar">
        <h3 class="sidebar-title">Zarządzanie użytkownikami</h3>
        <nav class="sidebar-nav">
          <NuxtLink
            to="/users"
            class="nav-item"
            active-class="active"
            v-if="usePermissionGuard('PANEL_SHOW_USERS')"
          >
            <span class="nav-text">Użytkownicy</span>
          </NuxtLink>
          <NuxtLink
            to="/users/role"
            class="nav-item"
            active-class="active"
            v-if="usePermissionGuard('PANEL_CREATE_ROLE')"
          >
            <span class="nav-text">Role i uprawnienia</span>
          </NuxtLink>
          <NuxtLink
            to="/users/notifications"
            class="nav-item"
            active-class="active"
            v-if="usePermissionGuard('PANEL_CREATE_NOTIFICATIONS')"
          >
            <span class="nav-text">Powiadomienia</span>
          </NuxtLink>
        </nav>
      </div>
      <div class="content-area">
        <div class="page-container">
          <header class="page-header">
            <h1>Powiadomienia systemowe</h1>
            <p>Wysyłaj powiadomienia do wszystkich użytkowników platformy</p>
          </header>

          <div
            v-if="successMessage"
            class="success-message"
          >
            {{ successMessage }}
          </div>

          <div
            v-if="errorMessage"
            class="error-message"
          >
            {{ errorMessage }}
          </div>

          <div class="notification-form">
            <h2>Nowe powiadomienie</h2>
            <div class="form-group">
              <label for="notification-title">Tytuł powiadomienia</label>
              <input
                id="notification-title"
                v-model="title"
                type="text"
                placeholder="Wprowadź tytuł powiadomienia"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="notification-message">Treść powiadomienia</label>
              <textarea
                id="notification-message"
                v-model="message"
                placeholder="Wprowadź treść powiadomienia"
                class="form-control textarea-control"
                rows="5"
              ></textarea>
            </div>

            <button
              @click="sendNotification"
              class="red-button"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Wysyłanie..." : "Wyślij powiadomienie" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-management {
  display: flex;
  min-height: calc(100vh - 120px);
  background-color: #f8f9fa;
}

.sidebar {
  width: 250px;
  background-color: white;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  padding: 15px;
  margin: 0;
  font-weight: 600;
}

.sidebar-nav {
  padding: 10px 0;
}

.nav-item {
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #e9ecef;
}

.nav-item:hover {
  background-color: #f1f3f5;
}

.nav-item.active {
  background-color: #f8f9fa;
  color: #eb5757;
  font-weight: 500;
}

.nav-item {
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #e9ecef;
  text-decoration: none;
  color: inherit;
  display: block;
}

.content-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.page-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
  color: #333;
}

.page-header p {
  color: #6c757d;
  margin: 0;
}

.notification-form {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.notification-form h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #eb5757;
  outline: none;
}

.textarea-control {
  resize: vertical;
  min-height: 100px;
}

.red-button {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.red-button:hover {
  background-color: #d63031;
}

.red-button:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.notification-info {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.notification-info h3 {
  margin-top: 0;
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

.notification-info p {
  margin-bottom: 10px;
  color: #495057;
}

.notification-info ul {
  margin: 0;
  padding-left: 20px;
}

.notification-info li {
  margin-bottom: 5px;
  color: #495057;
}
</style>
