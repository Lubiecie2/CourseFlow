<script setup>
definePageMeta({
  middleware: "auth",
  layout: "login",
});

const { data: users, error } = await useAPI("admin/users");
</script>

<template>
  <AdminNavbar></AdminNavbar>
  <div class="container">
    <h1 class="page-title">Lista Użytkowników</h1>

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

    <div v-else>
      <table class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Imię</th>
            <th>Nazwisko</th>
            <th>Rola</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
          >
            <td>{{ user.id }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.first_name }}</td>
            <td>{{ user.last_name }}</td>
            <td>{{ user.role }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 80%;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.user-table {
  width: 80%;
  margin: 0 auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.user-table th,
.user-table td {
  padding: 12px;
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
</style>
