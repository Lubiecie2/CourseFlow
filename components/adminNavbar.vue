<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "../stores/users";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import NotificationBadge from "./NotificationBadge.vue";
import { usePermissionGuard } from "../composables/usePermissionGuard";

const menuOpen = ref(false);
const isLoading = ref(true);
const router = useRouter();

const userStore = useUserStore();
const { user, isLogged } = storeToRefs(userStore);
const { logout } = userStore;

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 100);
});

const navigation = {
  goToSettings: () => {
    menuOpen.value = false;
    router.push("/options/partitions");
  },
  goToCourseList: () => {
    menuOpen.value = false;
    router.push("/courseList");
  },
  goToCourses: () => {
    menuOpen.value = false;
    router.push("/createCourse");
  },
  goToUsers: () => {
    menuOpen.value = false;
    router.push("/users");
  },
  goToMainPage: () => {
    menuOpen.value = false;
    router.push("/");
  },
  handleLogout: async () => {
    menuOpen.value = false;
    await logout();
    router.push("/");
  },
};

const toggleMenu = () => {
  if (!isLoading.value) {
    menuOpen.value = !menuOpen.value;
  }
};
</script>

<template>
  <nav class="navbar">
    <div
      class="nav-logo"
      @click="navigation.goToMainPage"
    >
      <img
        src="../public/images/Logo.png"
        alt="Logo"
        class="logo-image"
      />
      <span class="break-line" />
      <p class="logo-text">Panel<br />Administracyjny</p>
    </div>

    <div
      class="nav-links"
      :class="{ active: menuOpen, loading: isLoading }"
    >
      <button
        class="nav-button"
        @click="navigation.goToSettings"
        v-if="usePermissionGuard('PANEL_SETTINGS_PARTITION')"
      >
        Ustawienia strony
      </button>
      <button
        class="nav-button"
        @click="navigation.goToCourseList"
        v-if="usePermissionGuard('PANEL_CREATE_COURSES')"
      >
        Lista kursów
      </button>
      <button
        class="nav-button"
        @click="navigation.goToCourses"
        v-if="usePermissionGuard('PANEL_CREATE_COURSES')"
      >
        Stwórz kurs
      </button>
      <button
        class="nav-button"
        @click="navigation.goToUsers"
        v-if="usePermissionGuard('PANEL_SHOW_USERS')"
      >
        Zarządzaj użytkownikami
      </button>
      <button
        class="nav-button"
        @click="navigation.goToMainPage"
      >
        Strona główna
      </button>
      <button
        class="nav-button logout-button"
        v-if="isLogged"
        @click="navigation.handleLogout"
      >
        Wyloguj
      </button>
      <NotificationBadge v-if="isLogged" />
    </div>

    <button
      class="hamburger"
      :class="{ active: menuOpen }"
      @click="toggleMenu"
      :disabled="isLoading"
      aria-label="Menu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  </nav>
</template>

<style scoped>
.navbar {
  width: 100%;
  height: 120px;
  padding: 0 5vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.nav-logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 20px;
}

.logo-image {
  width: 140px;
  height: 70px;
  object-fit: contain;
}

.break-line {
  width: 1px;
  height: 70px;
  background-color: #000;
}

.logo-text {
  font-weight: 700;
  font-size: 19px;
  line-height: 1.2;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
  visibility: visible;
  opacity: 1;
  transition: all 0.3s ease;
}

.nav-links.loading {
  visibility: hidden;
  opacity: 0;
}

.nav-button {
  background-color: rgba(235, 87, 87, 0.85);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-button:hover {
  background-color: rgba(235, 87, 87, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.nav-button:active {
  transform: translateY(0);
  background-color: rgba(194, 72, 72, 1);
}

.logout-button {
  background-color: rgba(235, 87, 87, 0.85);
}

.logout-button:hover {
  background-color: rgba(235, 87, 87, 0.95);
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 22px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
  transition: opacity 0.3s ease;
}

.hamburger:disabled {
  opacity: 0;
  pointer-events: none;
}

.hamburger span {
  width: 100%;
  height: 3px;
  background-color: #eb5757;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.hamburger.active span:first-child {
  transform: translateY(9.5px) rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:last-child {
  transform: translateY(-9.5px) rotate(-45deg);
}

@media (max-width: 1300px) {
  .nav-links {
    position: fixed;
    top: 120px;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 20px;
    gap: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-150%);
    transition: transform 0.3s ease, visibility 0s 0.3s;
    visibility: hidden;
    height: auto;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
    z-index: 999;
  }

  .nav-links.active {
    transform: translateY(0);
    visibility: visible;
    transition: transform 0.3s ease;
  }

  .nav-links.loading {
    display: none;
  }

  .hamburger {
    display: flex;
  }

  .nav-button {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .navbar {
    height: 90px;
  }

  .nav-links {
    top: 90px;
  }

  .logo-image {
    width: 120px;
    height: 60px;
  }

  .break-line,
  .logo-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0 20px;
  }

  .logo-image {
    width: 100px;
    height: 50px;
  }

  .nav-button {
    font-size: 14px;
    padding: 8px 16px;
  }
}
</style>
