<script setup>
// ------ Metadane strony i uorawnienia  --------------------

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
let editingUserId = null;
let userToDelete = null;
const searchQuery = ref("");
const activeSection = ref("users");

// ------ Pobieranie użytkowników ---------------------------

try {
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
  if (editingUserId !== null && editingUserId !== user.id) {
    const previousUser = users.value.find((u) => u.id === editingUserId);
    if (previousUser) {
      previousUser.editingRole = false;
      previousUser.newRole = previousUser.role;
    }
  }

  user.editingRole = true;
  user.newRole = user.role;
  editingUserId = user.id;
};

const saveRoleChange = async (user) => {
  if (user.role !== user.newRole) {
    await changeUserRole(user.id, user.newRole);
  }
  user.editingRole = false;
  editingUserId = null;
};

const cancelEdit = (user) => {
  user.editingRole = false;
  user.newRole = user.role;
  editingUserId = null;
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
  }
};

// ------ Usuwanie użytkownika -----------------------------

const confirmDelete = (user) => {
  userToDelete = user;
  showDeleteDialog.value = true;
};

const cancelDelete = () => {
  userToDelete = null;
  showDeleteDialog.value = false;
};

const deleteUser = async () => {
  if (userToDelete) {
    try {
      await useApiFrontend(`admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      usersData.value.users = usersData.value.users.filter(
        (user) => user.id !== userToDelete.id
      );
      userToDelete = null;
      showDeleteDialog.value = false;
    } catch (err) {
      console.error("Błąd usuwania użytkownika:", err);
    }
  }
};

// ------ Nawigacja do sekcji ról -----------------------------

const goToRoles = () => {
  navigateTo("/users/role");
};
</script>

<template>
  <AdminNavbar />

  <div class="course-management">
    <div class="mobile-nav">
      <div class="mobile-nav-title">Panel administracyjny</div>
      <div class="mobile-nav-buttons">
        <button
          class="mobile-nav-btn active"
          @click="activeSection = 'users'"
        >
          Użytkownicy
        </button>
        <button
          class="mobile-nav-btn"
          @click="goToRoles"
        >
          Role
        </button>
      </div>
    </div>
    <div class="sidebar">
      <h3 class="sidebar-title">Panel administracyjny</h3>
      <nav class="sidebar-nav">
        <div
          class="nav-item active"
          @click="activeSection = 'users'"
        >
          <span class="nav-text">Użytkownicy</span>
        </div>
        <div
          class="nav-item"
          @click="goToRoles"
        >
          <span class="nav-text">Role i uprawnienia</span>
        </div>
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
                <th>Akcje</th>
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
                <td class="user-actions">
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
}

.sidebar-title {
  padding: 20px;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 15px 0;
}

.nav-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.nav-item:hover {
  background-color: #f8f9fa;
}

.nav-item.active {
  background-color: #eff6ff;
  border-left: 3px solid #eb5757;
  font-weight: 500;
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
