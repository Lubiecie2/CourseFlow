<script setup>
import { ref } from "vue";
import { nextTick } from "vue";

definePageMeta({
  layout: "login",
  middleware: ["auth", "admin-auth"],
  pagePerrmissions: ["PANEL_CREATE_ROLE"],
});

const roleName = ref("");
const selectedPermissions = ref([]);

const editRoleName = ref("");
const editSelectedPermissions = ref([]);
const selectedRole = ref(null);
const createSuccessMessage = ref("");
const updateSuccessMessage = ref("");

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
  } catch (err) {
    console.error("Błąd przy tworzeniu roli:", err);
  }
};

const handleSubmit = async () => {
  if (!roleName.value) {
    console.error("Błąd: Nazwa roli jest pusta!");
    return;
  }

  console.log("Nazwa roli:", roleName.value);
  console.log("Wybrane uprawnienia:", selectedPermissions.value);

  await createRole(roleName.value, selectedPermissions.value);

  clearForm();
};
// --------- KONIEC TWORZENIE ROLI --------------------------------------------------

// --------- POBIERANIE RÓL ---------------------------------------------------------

const { data: roles } = await useApiServer("role/getrole", {
  method: "GET",
});
// --------- KONIEC POBIERANIE RÓL --------------------------------------------------

// --------- POBIERANIE UPRAWNIEŃ --------------------------------------------------
const { data: permissions, error } = await useApiServer("/role/permissions");

if (error.value) {
  console.error("Błąd pobierania uprawnień:", error.value);
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
};
</script>

<template>
  <div>
    <adminNavbar></adminNavbar>
    <BottomNavbar v-if="usePermissionGuard('PANEL_CREATE_ROLE')"></BottomNavbar>

    <div class="addrole-container">
      <div class="addrole">
        <h2>Dodaj nową rolę</h2>
        <input
          v-model="roleName"
          placeholder="Nazwa roli"
          class="role-input"
        />

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
        <p
          v-if="createSuccessMessage"
          class="success-message create-message"
        >
          {{ createSuccessMessage }}
        </p>
        <button
          @click="handleSubmit()"
          class="red-button"
        >
          Zapisz rolę
        </button>
      </div>
    </div>
    <div class="role-container">
      <div class="leftroles-section">
        <h2>Edytuj rolę</h2>
        <p>Wybierz istniejącą rolę z listy po prawej</p>
        <input
          v-model="editRoleName"
          placeholder="Nazwa roli"
          class="role-input"
        />

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
        <p
          v-if="updateSuccessMessage"
          class="success-message update-message"
        >
          {{ updateSuccessMessage }}
        </p>
        <button
          @click="sendUpdateRole()"
          class="red-button"
        >
          Zapisz zmiany
        </button>
      </div>

      <div class="rightroles-section">
        <h2>Wszystkie role</h2>
        <div class="role-list">
          <ul v-if="roles.length > 0">
            <li
              v-for="role in roles"
              :key="role.id"
              @click="handleRoleClick(role)"
              class="role-item"
            >
              {{ role.name }}
            </li>
          </ul>
          <ul v-if="roles.length === 0">
            <li>Brak dostępnych ról.</li>
          </ul>
        </div>
      </div>
    </div>
    <foter></foter>
  </div>
</template>

<style scoped>
.addrole-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.addrole {
  height: 580px;
  width: 600px;
  background-color: white;
  margin: 0 40px;
  margin-bottom: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.role-container {
  display: flex;
  justify-content: center;
  gap: 100px;
  width: 100%;
  margin-top: 100px;
}
.rightroles-section {
  height: 580px;
  width: 400px;
  background-color: white;
  margin: 0 40px;
  margin-bottom: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.role-list {
  width: 80%;
  font-size: 20px;
  overflow-y: auto;
}
.role-list ul li {
  list-style: none;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  width: 100%;
  text-align: left;
  cursor: pointer;
}
.role-list ul li:hover {
  color: #eb5757;
  transition: color 0.3s;
}
.leftroles-section {
  height: 580px;
  width: 600px;
  background-color: white;
  margin: 0 40px;
  margin-bottom: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.role-input {
  margin-top: 10px;
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 15px;
  width: 80%;
  margin-bottom: 20px;
}
.permissions-list {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  width: 80%;
}
.permission-item {
  display: flex;
  margin-top: 10px;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  width: 80%;
  justify-content: flex-start;
}
.toggle-switch {
  position: relative;
  width: 40px;
  height: 15px;
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
.red-button {
  margin-bottom: 20px;
  margin-top: auto;
  background-color: #eb5757;
  color: white;
  font-size: 18px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  padding: 8px 24px;
  cursor: pointer;
  transition: background 0.3s;
}

.red-button:hover {
  background-color: #c54242;
}
h2 {
  font-size: 24px;
  font-weight: 600;
  color: black;
  margin-bottom: 10px;
  text-align: center;
}

.success-message {
  text-align: center;
  font-size: 16px;

  margin-top: 20px;
  padding: 10px;
  border-radius: 5px;
}

.create-message,
.update-message {
  color: rgb(7, 156, 7);
}
</style>
