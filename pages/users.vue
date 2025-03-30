<script setup>
definePageMeta({
  middleware: ["auth", "admin-auth"],
  layout: "login",
  pagePermissions: ["PANEL_SHOW_USERS"],
});

const { data: users, error, refresh } = await useApiServer("admin/users");
let editingUserId = null;
let userToDelete = null;
const searchQuery = ref("");

const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value;
  }
  return users.value.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

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
    await refresh();
  } catch (err) {
    console.error("Błąd zmiany roli:", err);
  }
};

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
      users.value = users.value.filter((user) => user.id !== userToDelete.id);
      userToDelete = null;
      showDeleteDialog.value = false;
    } catch (err) {
      console.error("Błąd usuwania użytkownika:", err);
    }
  }
};

const showDeleteDialog = ref(false);
</script>

<template>
  <AdminNavbar />
  <bottomNavbar />
  <div class="container">
    <h1 class="page-title">Lista Użytkowników</h1>

    <div class="search-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Szukaj użytkowników po emailu"
        class="search-input"
        @input="searchUsers"
      />
    </div>

    <div
      v-if="error"
      class="error"
    >
      <p>Wystąpił błąd: {{ error.message || error }}</p>
    </div>

    <div
      v-else-if="!users"
      class="loading"
    >
      <p>Ładowanie danych...</p>
    </div>

    <div
      v-else
      class="user-table-container"
    >
      <table class="user-table">
        <thead>
          <tr>
            <th>id</th>
            <th>email</th>
            <th>imię</th>
            <th>nazwisko</th>
            <th>rola</th>
            <th>akcja</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in filteredUsers"
            :key="user.id"
          >
            <td>{{ user.id }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.first_name }}</td>
            <td>{{ user.last_name }}</td>
            <td>
              <span v-if="!user.editingRole">{{ user.role }}</span>
              <select
                v-model="user.newRole"
                v-if="user.editingRole"
                class="role-select"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="!user.editingRole"
                  @click="startEdit(user)"
                  class="edit-btn"
                >
                  &#x270E;
                </button>
                <div
                  v-if="user.editingRole"
                  class="action-buttons-inner"
                >
                  <button
                    @click="cancelEdit(user)"
                    class="cancel-btn"
                  >
                    &#x21A9;
                  </button>
                  <button
                    @click="saveRoleChange(user)"
                    class="save-btn"
                  >
                    &#x2713;
                  </button>
                  <button
                    @click="confirmDelete(user)"
                    class="delete-btn"
                  >
                    &#x1F5D1;
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
      <p>Czy na pewno chcesz usunąć to konto?</p>
      <div class="button-container">
        <button
          @click="deleteUser"
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
.container {
  width: 60%;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.user-table-container {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #ddd;
  margin-bottom: 200px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.search-container {
  margin-bottom: 20px;
  text-align: center;
}

.search-input {
  width: 60%;
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.user-table {
  width: 100%;
  margin: 0 auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.user-table th,
.user-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.user-table th {
  background-color: #eb5757;
  color: white;
}

.user-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.error {
  color: red;
  margin-top: 20px;
}

.loading {
  margin-top: 20px;
}

.edit-btn,
.save-btn,
.cancel-btn,
.delete-btn {
  cursor: pointer;
  padding: 1px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  color: white;
  width: 35px;
  height: 35px;
  display: inline-block;
  text-align: center;
  line-height: 30px;
}

.edit-btn {
  background-color: #007bff;
}

.save-btn {
  background-color: #28a745;
}

.cancel-btn {
  background-color: #ffc107;
}

.delete-btn {
  background-color: #dc3545;
}

.edit-btn:hover,
.save-btn:hover,
.cancel-btn:hover,
.delete-btn:hover {
  opacity: 0.6;
}

.role-select {
  width: 60%;
}

.action-buttons {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
}

.action-buttons-inner {
  display: flex;
  justify-content: space-evenly;
  width: 100%;
}

.action-buttons button {
  width: auto;
  min-width: 35px;
  height: 35px;
  padding: 0;
}

.user-table th:nth-child(1),
.user-table td:nth-child(1) {
  width: 5%;
}

.user-table th:nth-child(2),
.user-table td:nth-child(2) {
  width: 20%;
}

.user-table th:nth-child(3),
.user-table td:nth-child(3) {
  width: 20%;
}

.user-table th:nth-child(4),
.user-table td:nth-child(4) {
  width: 20%;
}

.user-table th:nth-child(5),
.user-table td:nth-child(5) {
  width: 12%;
}

.user-table th:nth-child(6),
user-table td:nth-child(6) {
  width: 12%;
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
  background-color: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  width: 300px;
}

.button-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.confirm-delete-btn,
.cancel-delete-btn {
  margin-top: 2vh;
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 45%;
}

.confirm-delete-btn {
  background-color: #28a745;
  color: white;
}

.cancel-delete-btn {
  background-color: #dc3545;
  color: white;
}

.confirm-delete-btn:hover,
.cancel-delete-btn:hover {
  opacity: 0.6;
}
</style>
