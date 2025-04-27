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

.nav-buttom {
  display: flex;
  gap: 20px;
}

.red-button {
  background-color: rgba(235, 87, 87, 0.85);
  color: white;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.red-button:hover {
  background-color: rgba(235, 87, 87, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.red-button:active {
  transform: translateY(0);
  background-color: rgba(194, 72, 72, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.red-button::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150px;
  height: 150px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: transform 0.5s, opacity 0.5s;
}

.red-button:active::after {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  transition: 0s;
}

.red-button:hover {
  background-color: #c54242;
}
</style>
