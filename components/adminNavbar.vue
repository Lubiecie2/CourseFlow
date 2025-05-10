<script setup>
import { ref } from "vue";
import { useUserStore } from "../stores/users";

const menuOpen = ref(false);
const router = useRouter();

const goToCourses = () => {
  router.push("/createCourse");
};
const goToUsers = () => {
  router.push("/users");
};
const goToMainPage = () => {
  router.push("/");
};
function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}
const goToCourseList = () => {
  router.push("/courseList");
};

const userStore = useUserStore();
const { user, isLogged } = storeToRefs(userStore);
const { logout } = userStore;
</script>

<template>
  <div>
    <div class="navbar">
      <div
        class="nav-logo"
        @click="goToMainPage"
        style="cursor: pointer"
      >
        <img
          src="../public/images/Logo.png"
          alt="Logo"
        />
        <span class="break-line" />
        <p class="logo-text">
          Zarządzaj <br />
          Stroną CourseFlow
        </p>
      </div>

      <div class="nav-button-container">
        <button
          class="red-button"
          @click="goToCourseList"
        >
          Lista kursów
        </button>
        <button
          class="red-button"
          @click="goToCourses"
        >
          Stwórz kurs
        </button>
        <button
          class="red-button"
          @click="goToUsers"
          v-if="usePermissionGuard('PANEL_SHOW_USERS')"
        >
          Zarządzaj użytkownikami
        </button>
        <button
          class="red-button"
          @click="goToMainPage"
        >
          Strona główna
        </button>
        <NotificationBadge v-if="isLogged" />
      </div>

      <div
        class="hamburger"
        @click="toggleMenu"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <transition name="slide">
      <div
        class="mobile-menu"
        v-if="menuOpen"
      >
        <button
          class="red-button"
          @click="goToCourseList"
        >
          Lista kursów
        </button>
        <button
          class="red-button"
          @click="goToCourses"
          v-if="usePermissionGuard('PANEL_SHOW_COURSES')"
        >
          Stwórz kurs
        </button>
        <button
          class="red-button"
          @click="goToUsers"
          v-if="usePermissionGuard('PANEL_SHOW_USERS_LIST')"
        >
          Zarządzaj użytkownikami
        </button>
        <button
          class="red-button"
          @click="goToMainPage"
        >
          Strona główna
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.navbar {
  width: 100%;
  height: 120px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.nav-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 5vh;
}

.navbar img {
  width: 140px;
  height: 70px;
  margin-right: 20px;
}

.logo-text {
  font-weight: 700;
  font-size: 19px;
  margin-left: 20px;
}

.break-line {
  width: 1px;
  height: 70px;
  background-color: black;
  border: none;
  margin: 0 5px;
}

.nav-button-container {
  margin-right: 10vh;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  cursor: pointer;
  margin-right: 5vh;
}

.hamburger span {
  display: block;
  height: 3px;
  background-color: #eb5757;
  border-radius: 2px;
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

.mobile-menu .red-button {
  margin: 8px 0;
  width: 90%;
  background-color: rgba(235, 87, 87, 0.75);
  font-size: 15px;
}

:deep(.notification-container) {
  display: inline-flex;
  vertical-align: middle;
}

:deep(.notification-badge) {
  background-color: rgba(235, 87, 87, 0.85);
  border-radius: 10px;
  margin-right: 20px;
  padding: 10px 15px;
  height: auto;
  width: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

:deep(.notification-badge:hover) {
  background-color: rgba(235, 87, 87, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

:deep(.notification-badge:active) {
  transform: translateY(0);
  background-color: rgba(194, 72, 72, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.bell-icon) {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

:deep(.notification-count) {
  top: -8px;
  right: -8px;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  padding: 10px 0;
}

.mobile-menu .red-button {
  margin: 10px 0;
  width: 80%;
}

.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.5s ease, opacity 0.5s ease;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-enter-to,
.slide-leave-from {
  max-height: 300px;
  opacity: 1;
}

@media (max-width: 1300px) {
  .nav-button-container {
    display: none;
  }
  .hamburger {
    display: flex;
  }
  .mobile-menu {
    display: flex;
  }
}
@media (max-width: 768px) {
  .nav-button-container {
    display: none;
  }
  .hamburger {
    display: flex;
  }
  .mobile-menu {
    display: flex;
  }
  .logo-text {
    display: none;
  }
  .break-line {
    display: none;
  }
}
</style>
