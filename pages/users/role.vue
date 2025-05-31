<script setup>
import { ref } from "vue";
import { nextTick } from "vue";

definePageMeta({
  layout: "login",
  middleware: ["auth", "admin-auth"],
  pagePermissions: ["PANEL_CREATE_ROLE"],
});

const roleName = ref("");
const selectedPermissions = ref([]);
const editRoleName = ref("");
const editSelectedPermissions = ref([]);
const selectedRole = ref(null);
const createSuccessMessage = ref("");
const updateSuccessMessage = ref("");
const forbiddenRoles = ["admin", "user"];
const errorMessage = ref("");
const showDeleteDialog = ref(false);
const roleToDelete = ref(null);

// --------- TWORZENIE ROLI --------------------------------------------------

const clearForm = () => {
  roleName.value = "";
  selectedPermissions.value = [];
};

const createRole = async (roleName, permissions) => {
  try {
    console.log("roleName:", roleName);
    console.log("permissions:", permissions);

    const data = await useApiFrontend("role/createrole", {
      method: "POST",
      body: {
        roleName: roleName,
        permission: permissions,
      },
    });

    console.log("Rola została utworzona pomyślnie:", data);
    createSuccessMessage.value = "Rola została utworzona pomyślnie!";
    setTimeout(() => {
      createSuccessMessage.value = "";
    }, 10000);
  } catch (err) {
    console.error("Błąd przy tworzeniu roli:", err);
  }
};

const handleSubmit = async () => {
  if (!roleName.value) {
    console.error("Błąd: Nazwa roli jest pusta!");
    return;
  }

  if (forbiddenRoles.includes(roleName.value.toLowerCase())) {
    console.error("Błąd: Nie można utworzyć tej roli!");
    errorMessage.value = "Nie można utworzyć tej roli!";
    clearForm();
    setTimeout(() => {
      errorMessage.value = "";
    }, 5000);
    return;
  }

  console.log("Nazwa roli:", roleName.value);
  console.log("Wybrane uprawnienia:", selectedPermissions.value);

  await createRole(roleName.value, selectedPermissions.value);

  window.location.reload();

  clearForm();
};
// --------- KONIEC TWORZENIE ROLI --------------------------------------------------

// --------- POBIERANIE RÓL ---------------------------------------------------------

const { data: roles, error: getRoleError } = await useApiServer(
  "role/getrole",
  {
    method: "GET",
  }
);

if (getRoleError.value) {
  console.error("Błąd pobierania uprawnień:", getRoleError.value);
  throw createError({
    statusCode: 500,
    message: "Błąd pobierania ról",
    fatal: true,
  });
}
// --------- KONIEC POBIERANIE RÓL --------------------------------------------------

// --------- POBIERANIE UPRAWNIEŃ --------------------------------------------------
const { data: permissions, error: permissionsError } = await useApiServer(
  "/role/permissions"
);

if (permissionsError.value) {
  console.error("Błąd pobierania uprawnień:", permissionsError.value);
}

// --------- KONIEC POBIERANIE UPRAWNIEŃ --------------------------------------------------

// --------- KONIEC POBIERANIE UPRAWNIEŃ --------------------------------------------------

const findPermissionId = (permName) => {
  const perm = permissions.value?.find((p) => p.name === permName);
  return perm ? perm.id : null;
};

const usersPanelId = findPermissionId("PANEL_SHOW_USERS");
const usersListId = findPermissionId("PANEL_SHOW_USERS_LIST");
const adminPanelId = findPermissionId("PANEL_SHOW_ADMIN_PANEL");

// --------- MONITOROWANIE ZALEŻNOŚCI UPRAWNIEŃ ------------------------------------------

watch(
  selectedPermissions,
  (newValue) => {
    if (
      newValue.includes(usersListId) &&
      usersPanelId &&
      !newValue.includes(usersPanelId)
    ) {
      selectedPermissions.value.push(usersPanelId);
    }

    if (
      newValue.length > 0 &&
      adminPanelId &&
      !newValue.includes(adminPanelId)
    ) {
      selectedPermissions.value.push(adminPanelId);
    }
  },
  { deep: true }
);

watch(
  editSelectedPermissions,
  (newValue) => {
    if (
      newValue.includes(usersListId) &&
      usersPanelId &&
      !newValue.includes(usersPanelId)
    ) {
      editSelectedPermissions.value.push(usersPanelId);
    }

    if (
      newValue.length > 0 &&
      adminPanelId &&
      !newValue.includes(adminPanelId)
    ) {
      editSelectedPermissions.value.push(adminPanelId);
    }
  },
  { deep: true }
);

const handleRoleClick = async (role) => {
  selectedRole.value = role;
  editRoleName.value = role.name;
  editSelectedPermissions.value = [];

  await nextTick();
  editSelectedPermissions.value = [...role.permissions.map((perm) => perm.id)];
};

// --------- Aktualizacja uprawnień --------------------------------------------------

const updateRole = async () => {
  if (!editRoleName.value) {
    console.error("Błąd: Nazwa roli jest pusta!");
    return;
  }

  console.log("Nazwa roli:", editRoleName.value);
  console.log("Wybrane uprawnienia:", editSelectedPermissions.value);

  try {
    const data = await useApiFrontend(
      `/role/updaterole/${selectedRole.value.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          roleName: editRoleName.value,
          permissions: editSelectedPermissions.value,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Rola została zaktualizowana pomyślnie:", data);
    updateSuccessMessage.value = "Rola została zaktualizowana pomyślnie!";

    setTimeout(() => {
      updateSuccessMessage.value = "";
    }, 5000);
  } catch (err) {
    console.error("Błąd przy aktualizacji roli:", err);
  }
};
// --------- Koniec aktualizacji uprawnień  --------------------------------------------------

const sendUpdateRole = async () => {
  try {
    if (!editRoleName.value) {
      console.error("Błąd: Nazwa roli jest pusta!");
      return;
    }

    console.log("Aktualizowana rola:", editRoleName.value);
    console.log("Nowe uprawnienia:", editSelectedPermissions.value);

    await updateRole();

    window.location.reload();
    clearForm();
  } catch (err) {
    console.error("Błąd przy wysyłaniu aktualizacji roli:", err);
  }
};

// --------- USUWANIE RÓL ---------------------------------------------------------
const confirmDeleteRole = (role) => {
  roleToDelete.value = role;
  showDeleteDialog.value = true;
};

const deleteRole = async () => {
  try {
    if (roleToDelete.value) {
      await useApiFrontend(`/role/deleterole/${roleToDelete.value.id}`, {
        method: "DELETE",
      });
      showDeleteDialog.value = false;
      roleToDelete.value = null;
    }
  } catch (err) {
    console.error("Błąd przy usuwaniu roli:", err);
  }
  window.location.reload();
};

const cancelDelete = () => {
  showDeleteDialog.value = false;
};

// --------- KONIEC USUWANIA RÓL ---------------------------------------------------------

const translatePermissions = {
  PANEL_SHOW_USERS_LIST: "Zarządzanie użytkownikami",
  PANEL_EDIT_USERS: "Edytowanie użytkowników",
  PANEL_SHOW_TESTS: "Zarządzanie testami",
  PANEL_SHOW_COURSES: "Zarządzanie kursami",
  PANEL_SHOW_ADMIN_PANEL: "Zarządzanie stroną",
  PANEL_CREATE_ROLE: "Tworzenie ról",
  PANEL_SHOW_USERS: "Dostęp do panelu użytkowników",
  PANEL_MODIFY_COURSES: "Modyfikacja kursów",
  PANEL_CREATE_COURSES: "Tworzenie kursów",
  PANEL_SHOW_USER_LOGS: "Przeglądanie logów użytkowników",
  PANEL_SHOW_COURSES_LOGS: "Przeglądanie logów kursów",
  PANEL_SETTINGS_PARTITION: "Zarządzanie partycjami",
  PANEL_CREATE_NOTIFICATIONS: "Tworzenie powiadomień",
};
</script>

<template>
  <div>
    <adminNavbar></adminNavbar>
    <div class="course-management">
      <div class="mobile-nav">
        <div class="mobile-nav-title">Zarządzanie użytkownikami</div>
        <div class="mobile-nav-buttons">
          <button
            class="mobile-nav-btn"
            @click="goToUsers"
          >
            Użytkownicy
          </button>
          <button class="mobile-nav-btn active">Role</button>
        </div>
      </div>
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
        <div class="role-panels">
          <div class="role-panel">
            <h2>Dodaj nową rolę</h2>
            <input
              v-model="roleName"
              placeholder="Nazwa roli"
              class="role-input"
            />

            <div class="permissions-grid">
              <div
                v-for="perm in permissions"
                :key="perm.id"
                class="permission-item"
              >
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    class="toggle-checkbox"
                    :value="perm.id"
                    v-model="selectedPermissions"
                  />
                  <span class="slider"></span>
                </label>
                <span class="permission-name">{{
                  translatePermissions[perm.name]
                }}</span>
              </div>
            </div>

            <div class="message-container">
              <p
                v-if="createSuccessMessage"
                class="success-message"
              >
                {{ createSuccessMessage }}
              </p>
              <p
                v-if="errorMessage"
                class="error-message"
              >
                {{ errorMessage }}
              </p>
            </div>

            <button
              @click="handleSubmit()"
              class="red-button"
            >
              Zapisz rolę
            </button>
          </div>

          <div class="role-management">
            <div class="role-panel edit-role">
              <h2>Edytuj rolę</h2>
              <p
                v-if="!selectedRole"
                class="select-prompt"
              >
                Wybierz istniejącą rolę z listy po prawej
              </p>

              <div v-if="selectedRole">
                <input
                  v-model="editRoleName"
                  placeholder="Nazwa roli"
                  class="role-input"
                />

                <div class="permissions-grid">
                  <div
                    v-for="perm in permissions"
                    :key="perm.id"
                    class="permission-item"
                  >
                    <label class="toggle-switch">
                      <input
                        type="checkbox"
                        class="toggle-checkbox"
                        :value="perm.id"
                        v-model="editSelectedPermissions"
                      />
                      <span class="slider"></span>
                    </label>
                    <span class="permission-name">{{
                      translatePermissions[perm.name]
                    }}</span>
                  </div>
                </div>

                <div class="message-container">
                  <p
                    v-if="updateSuccessMessage"
                    class="success-message"
                  >
                    {{ updateSuccessMessage }}
                  </p>
                </div>

                <button
                  @click="sendUpdateRole()"
                  class="red-button"
                >
                  Zapisz zmiany
                </button>
              </div>
            </div>

            <div class="role-panel roles-list-panel">
              <h2>Wszystkie role</h2>
              <div class="role-list">
                <ul v-if="roles.length > 0">
                  <li
                    v-for="role in roles"
                    :key="role.id"
                    @click="handleRoleClick(role)"
                    class="role-item"
                    :class="{
                      active: selectedRole && selectedRole.id === role.id,
                    }"
                  >
                    {{ role.name }}
                    <span
                      @click.stop="confirmDeleteRole(role)"
                      class="delete-icon"
                    >
                      🗑️
                    </span>
                  </li>
                </ul>
                <div
                  v-if="roles.length === 0"
                  class="empty-roles"
                >
                  Brak dostępnych ról.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="showDeleteDialog"
    class="delete-dialog"
  >
    <div
      class="dialog-overlay"
      @click="cancelDelete"
    ></div>
    <div class="dialog-content">
      <p>Czy na pewno chcesz usunąć tę rolę "{{ roleToDelete?.name }}"?</p>
      <div class="button-container">
        <button
          @click="deleteRole"
          class="confirm-delete-btn"
        >
          Potwierdź
        </button>
        <button
          @click="cancelDelete"
          class="cancel-delete-btn"
        >
          Anuluj
        </button>
      </div>
    </div>
  </div>
  <foter></foter>
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
  padding: 20px;
  overflow-y: auto;
}

.role-panels {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.role-panel {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.role-management {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.role-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin-bottom: 20px;
}

h2 {
  font-size: 20px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  transition: background-color 0.2s;
}

.permission-item:hover {
  background-color: #f8f9fa;
  border-radius: 4px;
}

.toggle-switch {
  position: relative;
  width: 40px;
  height: 20px;
  flex-shrink: 0;
}

.toggle-checkbox {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.slider {
  position: relative;
  width: 40px;
  height: 20px;
  background-color: #ccc;
  border-radius: 20px;
  transition: 0.3s;
  display: inline-block;
}

.slider::before {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: 0.3s;
}

.toggle-checkbox:checked + .slider {
  background-color: #eb5757;
}

.toggle-checkbox:checked + .slider::before {
  transform: translateX(20px);
}

.message-container {
  min-height: 40px;
  margin-bottom: 15px;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.red-button {
  background-color: #eb5757;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.red-button:hover {
  background-color: #d63031;
}

.role-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.role-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.role-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: background-color 0.2s;
}

.role-item:hover {
  background-color: #f8f9fa;
}

.role-item.active {
  background-color: #eff6ff;
  font-weight: 500;
}

.delete-icon {
  opacity: 0.6;
  cursor: pointer;
  padding: 5px;
}

.delete-icon:hover {
  opacity: 1;
  color: #dc3545;
}

.empty-roles {
  padding: 15px;
  text-align: center;
  color: #6c757d;
}

.select-prompt {
  color: #6c757d;
  font-style: italic;
  text-align: center;
  padding: 15px;
}

.delete-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  z-index: 1001;
  width: 400px;
  max-width: 90%;
  text-align: center;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.confirm-delete-btn,
.cancel-delete-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-width: 100px;
}

.confirm-delete-btn {
  background-color: #28a745;
  color: white;
}

.cancel-delete-btn {
  background-color: #dc3545;
  color: white;
}

@media (max-width: 768px) {
  .course-management {
    flex-direction: column;
  }

  .sidebar {
    display: none;
  }

  .mobile-nav {
    display: block;
  }

  .role-management {
    grid-template-columns: 1fr;
  }

  .permissions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
