<script setup>
// ------ Metadane strony i uprawnienia --------------------

definePageMeta({
  middleware: ["auth", "admin-auth"],
  layout: "login",
  pagePermissions: ["PANEL_SHOW_USERS"],
});

// ------ Zmienne -------------------------------------------

const usersData = ref(null);
const error = ref(null);
const loading = ref(true);
const showDeleteDialog = ref(false);
const editingUserId = ref(null);
const userToDelete = ref(null);
const searchQuery = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const logsPerPage = 15;
const dateFrom = ref("");
const dateTo = ref("");
const isFilterActive = ref(false);

// ------ Logi operacji użytkowników -----------------------------

const logs = ref([]);
const logsLoading = ref(true);
const logsError = ref(null);
const logsRefreshCounter = ref(0);

// ------ Pobieranie użytkowników ---------------------------

const fetchUsers = async () => {
  try {
    loading.value = true;
    const { data, error: apiError } = await useApiServer("admin/users");
    if (apiError.value) {
      throw apiError.value;
    }
    usersData.value = data.value;
  } catch (err) {
    console.error("Błąd ładowania użytkowników:", err);
    error.value = err;
  } finally {
    loading.value = false;
  }
};

await fetchUsers();

const users = computed(() => usersData.value?.users ?? []);
const roles = computed(() => usersData.value?.roles ?? []);

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  return users.value.filter((user) =>
    user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// ------ Edycja ról użytkownika -----------------------------

const startEdit = (user) => {
  if (editingUserId.value !== null && editingUserId.value !== user.id) {
    const previousUser = users.value.find((u) => u.id === editingUserId.value);
    if (previousUser) {
      previousUser.editingRole = false;
      previousUser.newRole = previousUser.role;
    }
  }

  user.editingRole = true;
  user.newRole = user.role;
  editingUserId.value = user.id;
};

const saveRoleChange = async (user) => {
  try {
    if (user.role !== user.newRole) {
      await changeUserRole(user.id, user.newRole);

      logsRefreshCounter.value++;

      currentPage.value = 1;
    }
    user.editingRole = false;
    editingUserId.value = null;
  } catch (err) {
    console.error("Błąd podczas zapisywania roli:", err);
  }
};

const cancelEdit = (user) => {
  user.editingRole = false;
  user.newRole = user.role;
  editingUserId.value = null;
};

const changeUserRole = async (userId, newRole) => {
  try {
    await useApiFrontend(`admin/users/${userId}/role`, {
      method: "PATCH",
      body: { role: newRole },
    });

    const updatedUser = users.value.find((u) => u.id === userId);
    if (updatedUser) {
      updatedUser.role = newRole;
    }
  } catch (err) {
    console.error("Błąd zmiany roli:", err);
    throw err;
  }
};

// ------ Usuwanie użytkownika -----------------------------

const confirmDelete = (user) => {
  userToDelete.value = user;
  showDeleteDialog.value = true;
};

const cancelDelete = () => {
  userToDelete.value = null;
  showDeleteDialog.value = false;
};

const deleteUser = async () => {
  if (userToDelete.value) {
    try {
      await useApiFrontend(`admin/users/${userToDelete.value.id}`, {
        method: "DELETE",
      });

      usersData.value.users = usersData.value.users.filter(
        (user) => user.id !== userToDelete.value.id
      );

      logsRefreshCounter.value++;
      currentPage.value = 1;

      userToDelete.value = null;
      showDeleteDialog.value = false;
    } catch (err) {
      console.error("Błąd usuwania użytkownika:", err);
    }
  }
};

//  ------ Pobieranie logów operacji -----------------------------

const fetchLogs = async () => {
  try {
    logsLoading.value = true;
    logsError.value = null;

    let url = `logs?page=${currentPage.value}&limit=${logsPerPage}`;

    if (dateFrom.value) {
      url += `&fromDate=${dateFrom.value}T00:00:00.000Z`;
    }
    if (dateTo.value) {
      url += `&toDate=${dateTo.value}T23:59:59.999Z`;
    }

    const response = await useApiFrontend(url);

    if (response && response.success) {
      logs.value = response.logs || [];

      if (response.pagination) {
        totalPages.value = response.pagination.totalPages || 1;
      }
    } else {
      throw new Error("Nie udało się pobrać logów operacji");
    }
  } catch (err) {
    console.error("Błąd podczas pobierania logów:", err);
    logsError.value = "Wystąpił błąd podczas pobierania logów operacji.";
  } finally {
    logsLoading.value = false;
  }
};

// ------ Paginacja logów -------------------------------------

const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  currentPage.value = newPage;
  fetchLogs();
};

// ------ Formatowanie daty ------------------------------------

const applyDateFilter = () => {
  isFilterActive.value = !!(dateFrom.value || dateTo.value);
  currentPage.value = 1;
  fetchLogs();
};

// ------ Czyszczenie filtrów daty -----------------------------

const clearDateFilter = () => {
  dateFrom.value = "";
  dateTo.value = "";
  isFilterActive.value = false;
  currentPage.value = 1;
  fetchLogs();
};

// ------ Formatowanie daty -------------------------------------

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// ------ Inicjalizacja logów -------------------------------------

onMounted(fetchLogs);

// ------ Odświeżanie logów ---------------------------------------

watch(logsRefreshCounter, () => {
  setTimeout(fetchLogs, 500);
});
</script>

<template>
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
          <h1>Lista użytkowników</h1>
          <p>Zarządzaj użytkownikami platformy</p>
        </header>

        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Szukaj użytkowników po emailu"
            class="search-input"
          />
        </div>
        <div
          v-if="error"
          class="error-message"
        >
          {{ error.message || error }}
          <button
            @click="window.location.reload()"
            class="btn-retry"
          >
            Spróbuj ponownie
          </button>
        </div>
        <div
          v-if="loading"
          class="loading-state"
        >
          <div class="spinner"></div>
          <p>Ładowanie danych użytkowników...</p>
        </div>
        <div
          v-else-if="users.length > 0"
          class="users-table-container"
        >
          <table class="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th class="hide-sm">Imię</th>
                <th class="hide-sm">Nazwisko</th>
                <th>Rola</th>
                <th v-if="usePermissionGuard('PANEL_EDIT_USERS')">Akcje</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
              >
                <td class="user-email">{{ user.email }}</td>
                <td class="hide-sm">{{ user.first_name }}</td>
                <td class="hide-sm">{{ user.last_name }}</td>
                <td>
                  <span
                    v-if="!user.editingRole"
                    class="role-badge"
                    >{{ user.role }}</span
                  >
                  <select
                    v-model="user.newRole"
                    v-if="user.editingRole"
                    class="role-select"
                  >
                    <option
                      v-for="role in roles"
                      :key="role.id"
                      :value="role.name"
                    >
                      {{ role.name }}
                    </option>
                  </select>
                </td>
                <td
                  class="user-actions"
                  v-if="usePermissionGuard('PANEL_EDIT_USERS')"
                >
                  <div
                    v-if="!user.editingRole"
                    class="action-buttons"
                  >
                    <button
                      @click="startEdit(user)"
                      class="btn-edit"
                    >
                      <span class="hide-sm">Edytuj</span>
                      <span class="show-sm">E</span>
                    </button>
                    <button
                      @click="confirmDelete(user)"
                      class="btn-delete"
                    >
                      <span class="hide-sm">Usuń</span>
                      <span class="show-sm">U</span>
                    </button>
                  </div>
                  <div
                    v-else
                    class="action-buttons"
                  >
                    <button
                      @click="saveRoleChange(user)"
                      class="btn-save"
                    >
                      <span class="hide-sm">Zapisz</span>
                      <span class="show-sm">Z</span>
                    </button>
                    <button
                      @click="cancelEdit(user)"
                      class="btn-cancel"
                    >
                      <span class="hide-sm">Anuluj</span>
                      <span class="show-sm">A</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-else-if="users.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">🔍</div>
          <h3>Brak użytkowników</h3>
          <p>Nie znaleziono żadnych użytkowników.</p>
        </div>
        <div
          class="logs-section"
          v-if="usePermissionGuard('PANEL_SHOW_USER_LOGS')"
        >
          <h2>Historia operacji</h2>
          <p class="section-description">Zmiany ról i usuwanie użytkowników</p>

          <div class="filter-container">
            <div class="filter-row">
              <div class="filter-group">
                <label for="date-from">Od daty:</label>
                <input
                  id="date-from"
                  v-model="dateFrom"
                  type="date"
                  class="date-input"
                />
              </div>
              <div class="filter-group">
                <label for="date-to">Do daty:</label>
                <input
                  id="date-to"
                  v-model="dateTo"
                  type="date"
                  class="date-input"
                />
              </div>
              <div class="filter-actions">
                <button
                  @click="applyDateFilter"
                  class="btn-filter"
                >
                  Filtruj
                </button>
                <button
                  @click="clearDateFilter"
                  class="btn-clear-filter"
                  :disabled="!isFilterActive"
                >
                  Wyczyść
                </button>
              </div>
            </div>
          </div>
          <div
            v-if="logsLoading"
            class="logs-loading"
          >
            <div class="spinner"></div>
            <p>Ładowanie logów...</p>
          </div>

          <div
            v-else-if="logsError"
            class="logs-error"
          >
            <p>{{ logsError }}</p>
            <button
              @click="fetchLogs"
              class="btn-retry"
            >
              Spróbuj ponownie
            </button>
          </div>

          <div
            v-else-if="logs.length === 0"
            class="logs-empty"
          >
            <div class="empty-icon">📝</div>
            <p>Brak logów operacji</p>
          </div>

          <div
            v-else
            class="logs-table-wrapper"
          >
            <table class="logs-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Operacja</th>
                  <th>Użytkownik</th>
                  <th>Administrator</th>
                  <th>Szczegóły</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="log in logs"
                  :key="log.id"
                >
                  <td>{{ formatDate(log.created_at) }}</td>
                  <td>
                    <span
                      :class="[
                        'log-type',
                        log.action_type === 'ROLE_CHANGED'
                          ? 'log-role'
                          : 'log-delete',
                      ]"
                    >
                      {{
                        log.action_type === "ROLE_CHANGED"
                          ? "Zmiana roli"
                          : "Usunięcie użytkownika"
                      }}
                    </span>
                  </td>
                  <td>
                    <span v-if="log.user_email">{{ log.user_email }}</span>
                    <span v-else-if="log.action_type === 'USER_DELETED'">{{
                      log.old_value
                    }}</span>
                    <span v-else>Brak danych</span>
                  </td>
                  <td>{{ log.changed_by_email || "System" }}</td>
                  <td>
                    <span v-if="log.action_type === 'ROLE_CHANGED'">
                      Zmiana roli: {{ log.old_value }} → {{ log.new_value }}
                    </span>
                    <span v-else-if="log.action_type === 'USER_DELETED'">
                      Usunięcie użytkownika: {{ log.old_value }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="pagination-controls">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="pagination-btn"
              >
                &laquo; Poprzednia
              </button>

              <span class="pagination-info">
                Strona {{ currentPage }} z {{ totalPages }}
              </span>

              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                class="pagination-btn"
              >
                Następna &raquo;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="showDeleteDialog"
    class="delete-dialog-overlay"
  >
    <div class="delete-dialog">
      <h3>Potwierdź usunięcie</h3>
      <p>Czy na pewno chcesz usunąć użytkownika "{{ userToDelete?.email }}"?</p>
      <p class="warning">Ta operacja jest nieodwracalna.</p>
      <div class="dialog-actions">
        <button
          @click="cancelDelete"
          class="btn-cancel"
        >
          Anuluj
        </button>
        <button
          @click="deleteUser"
          class="btn-delete"
        >
          Usuń
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-management {
  display: flex;
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
}

.mobile-nav {
  display: none;
  background-color: white;
  padding: 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
  width: 100%;
}

.mobile-nav-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 10px;
  color: #eb5757;
}

.mobile-nav-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.mobile-nav-btn {
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.mobile-nav-btn.active {
  background-color: #eb5757;
  color: white;
  border-color: #eb5757;
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
  overflow: auto;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 12px;
}

.page-header p {
  font-size: 1.125rem;
  color: #6e6e73;
}

.search-container {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.users-table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 30px;
  height: 600px;
  overflow-y: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  text-align: left;
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
  position: sticky;
  top: 0;
  z-index: 1;
}

.users-table td {
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.users-table tr:last-child td {
  border-bottom: none;
}

.users-table tr:hover {
  background-color: #f8f9fa;
}

.user-email {
  font-weight: 500;
  color: #343a40;
}

.role-badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: #e9ecef;
  color: #495057;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.user-actions {
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-edit,
.btn-delete,
.btn-save,
.btn-cancel,
.btn-retry {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 80px;
}

.btn-edit {
  background-color: #eb5757;
  color: white;
}

.btn-edit:hover {
  background-color: #d64545;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-delete:hover {
  background-color: #c82333;
}

.btn-save {
  background-color: #28a745;
  color: white;
}

.btn-save:hover {
  background-color: #218838;
}

.btn-cancel,
.btn-retry {
  background-color: #6c757d;
  color: white;
}

.btn-cancel:hover,
.btn-retry:hover {
  background-color: #5a6268;
}

.role-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
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
  z-index: 100;
}

.delete-dialog {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  max-width: 450px;
  width: 90%;
  margin: 0 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.delete-dialog h3 {
  font-size: 20px;
  margin-top: 0;
  margin-bottom: 15px;
  color: #343a40;
}

.warning {
  color: #dc3545;
  padding: 10px;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 4px;
  margin: 15px 0;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.loading-state,
.error-message,
.empty-state {
  padding: 40px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.error-message {
  color: #dc3545;
}

.empty-state .empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #adb5bd;
}

.spinner {
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 3px solid rgba(235, 87, 87, 0.3);
  border-radius: 50%;
  border-top-color: #eb5757;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}
.logs-section {
  margin-top: 30px;
  margin-bottom: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.logs-section h2 {
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 5px;
  color: #1d1d1f;
}

.section-description {
  color: #6e6e73;
  margin-bottom: 15px;
}

.logs-table-wrapper {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  font-size: 14px;
}

.logs-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
}

.logs-table tr:last-child td {
  border-bottom: none;
}

.logs-table tr:hover {
  background-color: #f8f9fa;
}

.log-type {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.log-role {
  background-color: #e3f2fd;
  color: #0d6efd;
}

.log-delete {
  background-color: #f8d7da;
  color: #dc3545;
}

.logs-loading,
.logs-error,
.logs-empty {
  padding: 20px;
  text-align: center;
}

.logs-empty .empty-icon {
  font-size: 32px;
  margin-bottom: 10px;
  color: #adb5bd;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.pagination-btn {
  padding: 8px 16px;
  background-color: #eb5757;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #d64545;
}

.pagination-btn:disabled {
  background-color: #ced4da;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
}

.filter-container {
  margin-bottom: 15px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  font-size: 14px;
  margin-bottom: 5px;
  color: #495057;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.btn-filter,
.btn-clear-filter {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-filter {
  background-color: #eb5757;
  color: white;
}

.btn-filter:hover {
  background-color: #d64545;
}

.btn-clear-filter {
  background-color: #6c757d;
  color: white;
}

.btn-clear-filter:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn-clear-filter:disabled {
  background-color: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  background-color: #e2f2ff;
  color: #0d6efd;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 13px;
  margin-top: 10px;
}

.btn-clear-badge {
  background: none;
  border: none;
  color: #0d6efd;
  font-size: 16px;
  cursor: pointer;
  margin-left: 5px;
  padding: 0 5px;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    gap: 10px;
  }

  .filter-group {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .pagination-controls {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .logs-section {
    margin-top: 20px;
    padding: 15px;
  }

  .logs-table {
    font-size: 12px;
  }

  .logs-table th,
  .logs-table td {
    padding: 8px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.show-sm {
  display: none;
}

@media (max-width: 992px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .page-header p {
    font-size: 1rem;
  }

  .btn-edit,
  .btn-delete,
  .btn-save,
  .btn-cancel,
  .btn-retry {
    min-width: 70px;
    padding: 8px 12px;
  }

  .content-area {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .course-management {
    flex-direction: column;
  }

  .mobile-nav {
    display: block;
  }

  .sidebar {
    display: none;
  }

  .content-area {
    padding: 15px;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .page-header p {
    font-size: 0.9rem;
  }

  .users-table-container {
    height: 450px;
  }

  .users-table {
    font-size: 13px;
  }

  .users-table th,
  .users-table td {
    padding: 10px 8px;
  }

  .hide-sm {
    display: none;
  }

  .show-sm {
    display: inline;
  }

  .btn-edit,
  .btn-delete,
  .btn-save,
  .btn-cancel {
    min-width: 40px;
    padding: 6px 10px;
  }

  .delete-dialog {
    width: 95%;
    padding: 15px;
  }

  .delete-dialog h3 {
    font-size: 18px;
  }
}
</style>
