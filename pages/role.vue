<script setup>
import { ref } from "vue";
import { nextTick } from "vue";

definePageMeta({
  layout: "login",
  middleware: ["auth", "admin-auth"],
  pagePermissions: ["PANEL_CREATE_ROLE", "PANEL_SHOW_USERS"],
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

// --------- TWORZENIE ROLI --------------------------------------------------

const clearForm = () => {
  roleName.value = "";
  selectedPermissions.value = [];
};

const createRole = async (roleName, permissions) => {
  try {
    const data = await useApiFrontend("role/createrole", {
      method: "POST",
      body: {
        roleName: roleName,
        permission: permissions,
      },
    });

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
  if (getRoleError.value.status === 404) {
    console.error("Nie znaleziono ról:", getRoleError.value);
  } else {
    console.error("Błąd pobierania uprawnień:", getRoleError.value);
    throw createError({
      statusCode: 500,
      message: "Błąd pobierania ról",
      fatal: true,
    });
  }
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

    await updateRole();

    window.location.reload();
    clearForm();
  } catch (err) {
    console.error("Błąd przy wysyłaniu aktualizacji roli:", err);
  }
};

const translatePermissions = {
  PANEL_SHOW_USERS_LIST: "Zarządzanie użytkownikami",
  PANEL_EDIT_USERS: "Edytowanie użytkowników",
  PANEL_SHOW_TESTS: "Zarządzanie testami",
  PANEL_SHOW_COURSES: "Zarządzanie kursami",
  PANEL_SHOW_ADMIN_PANEL: "Zarządzanie stroną",
  PANEL_CREATE_ROLE: "Tworzenie ról",
  PANEL_SHOW_USERS: "Dostęp do panelu użytkowników",
};
</script>

<template>
  <div>
    <adminNavbar></adminNavbar>
    <BottomNavbar v-if="usePermissionGuard('PANEL_CREATE_ROLE')"></BottomNavbar>

    <div class="role-management-container">
      <div class="card">
        <div class="card-header">
          <h2>Dodaj nową rolę</h2>
          <div class="header-underline"></div>
        </div>

        <div class="card-body">
          <div class="input-group">
            <label for="new-role-name">Nazwa roli</label>
            <input
              id="new-role-name"
              v-model="roleName"
              placeholder="Wprowadź nazwę roli"
              class="form-input"
            />
          </div>

          <div class="permissions-list">
            <h3>Wybierz uprawnienia</h3>
            <div class="permissions-grid">
              <div
                v-for="perm in permissions"
                :key="perm.id"
                class="permission-item"
              >
                <label class="toggle-container">
                  <div class="toggle-label">
                    {{ translatePermissions[perm.name] }}
                  </div>
                  <div class="toggle-switch">
                    <input
                      type="checkbox"
                      class="toggle-checkbox"
                      :value="perm.id"
                      v-model="selectedPermissions"
                    />
                    <span class="toggle-slider"></span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div class="message-container">
            <p
              v-if="createSuccessMessage"
              class="success-message"
            >
              <i class="success-icon">✓</i> {{ createSuccessMessage }}
            </p>
            <p
              v-if="errorMessage"
              class="error-message"
            >
              <i class="error-icon">!</i> {{ errorMessage }}
            </p>
          </div>

          <button
            @click="handleSubmit()"
            class="btn-primary"
          >
            Zapisz rolę
          </button>
        </div>
      </div>

      <div class="roles-editor-container">
        <div class="card">
          <div class="card-header">
            <h2>Edytuj rolę</h2>
            <div class="header-underline"></div>
          </div>

          <div class="card-body">
            <div class="role-editor-flex">
              <div class="role-editor-form">
                <p class="select-info">
                  {{
                    selectedRole
                      ? `Edytujesz: ${selectedRole.name}`
                      : "Wybierz rolę z listy"
                  }}
                </p>

                <div class="input-group">
                  <label for="edit-role-name">Nazwa roli</label>
                  <input
                    id="edit-role-name"
                    v-model="editRoleName"
                    placeholder="Nazwa roli"
                    class="form-input"
                    :disabled="!selectedRole"
                  />
                </div>

                <div
                  class="permissions-list"
                  v-if="selectedRole"
                >
                  <h3>Uprawnienia</h3>
                  <div class="permissions-grid">
                    <div
                      v-for="perm in permissions"
                      :key="perm.id"
                      class="permission-item"
                    >
                      <label class="toggle-container">
                        <div class="toggle-label">
                          {{ translatePermissions[perm.name] }}
                        </div>
                        <div class="toggle-switch">
                          <input
                            type="checkbox"
                            class="toggle-checkbox"
                            :value="perm.id"
                            v-model="editSelectedPermissions"
                          />
                          <span class="toggle-slider"></span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="message-container">
                  <p
                    v-if="updateSuccessMessage"
                    class="success-message"
                  >
                    <i class="success-icon">✓</i> {{ updateSuccessMessage }}
                  </p>
                </div>

                <button
                  @click="sendUpdateRole()"
                  class="btn-primary"
                  :disabled="!selectedRole"
                >
                  Zapisz zmiany
                </button>
              </div>

              <div class="role-list-container">
                <h3>Wszystkie role</h3>
                <div class="role-list">
                  <div
                    v-if="roles.length > 0"
                    class="role-items"
                  >
                    <div
                      v-for="role in roles"
                      :key="role.id"
                      @click="handleRoleClick(role)"
                      class="role-item"
                      :class="{
                        active: selectedRole && selectedRole.id === role.id,
                      }"
                    >
                      {{ role.name }}
                    </div>
                  </div>
                  <div
                    v-else
                    class="empty-roles"
                  >
                    <p>Brak dostępnych ról.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <foter></foter>
  </div>
</template>

<style scoped>
.role-management-container {
  max-width: 1200px;
  margin: 50px auto;
  padding: 0 20px;
}

.card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  overflow: hidden;
}

.card-header {
  background-color: #f8f9fa;
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
}

.card-header h2 {
  margin: 0;
  color: #333;
  font-size: 22px;
}

.header-underline {
  height: 3px;
  width: 60px;
  background: linear-gradient(90deg, #e74c3c, #f39c12);
  margin-top: 10px;
}

.card-body {
  padding: 25px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #e74c3c;
  outline: none;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.form-input::placeholder {
  color: #aaa;
}

.permissions-list {
  margin: 25px 0;
}

.permissions-list h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.permission-item {
  margin-bottom: 5px;
}

.toggle-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 10px;
  border-radius: 6px;
  background-color: #f8f9fa;
  transition: background-color 0.2s;
}

.toggle-container:hover {
  background-color: #eee;
}

.toggle-label {
  flex-grow: 1;
  font-size: 14px;
  color: #444;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 24px;
  margin-left: 15px;
}

.toggle-checkbox {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 24px;
  transition: 0.4s;
}

.toggle-slider:before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.4s;
}

.toggle-checkbox:checked + .toggle-slider {
  background-color: #e74c3c;
}

.toggle-checkbox:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.message-container {
  margin: 20px 0;
  min-height: 30px;
}

.success-message,
.error-message {
  padding: 12px 15px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  animation: fadeIn 0.3s;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
}

.success-icon,
.error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 10px;
  font-style: normal;
  font-weight: bold;
}

.success-icon {
  background-color: #155724;
  color: white;
}

.error-icon {
  background-color: #721c24;
  color: white;
}

.btn-primary {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background: linear-gradient(90deg, #c0392b, #a93226);
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.roles-editor-container {
  margin-top: 40px;
}

.role-editor-flex {
  display: flex;
  gap: 30px;
}

.role-editor-form {
  flex: 2;
}

.role-list-container {
  flex: 1;
}

.select-info {
  margin-bottom: 15px;
  font-style: italic;
  color: #666;
}

.role-list {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.role-list h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
}

.role-item {
  padding: 12px 15px;
  margin-bottom: 8px;
  background-color: white;
  border-radius: 6px;
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.role-item:hover {
  border-left-color: #e74c3c;
  background-color: #fff9f9;
}

.role-item.active {
  border-left-color: #e74c3c;
  background-color: #fff9f9;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.empty-roles {
  padding: 20px;
  text-align: center;
  color: #666;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .role-editor-flex {
    flex-direction: column;
  }

  .permissions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
