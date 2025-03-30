<script setup></script>

<template>
  <div>
    <div class="nav-container">
      <div class="button-container">
        <div class="nav-buttom">
          <NuxtLink
            to="/users"
            class="red-button"
            v-if="usePermissionGuard('PANEL_CREATE_ROLE')"
            >Użytkownicy</NuxtLink
          >
          <NuxtLink
            to="/role"
            class="red-button"
            v-if="usePermissionGuard('PANEL_CREATE_ROLE')"
            >Role</NuxtLink
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-container {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.button-container {
  margin-right: 10vh;
}
.red-button {
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
</style>
