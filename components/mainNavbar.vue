<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "../stores/users";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const menuOpen = ref(false);
const isLoading = ref(true);
const router = useRouter();

const userStore = useUserStore();
const { user, isLogged } = storeToRefs(userStore);
const { logout } = userStore;

// Hide mobile menu on initial load and initialize
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 100);
});

const navigation = {
  goTo: (path) => {
    menuOpen.value = false;
    router.push(path);
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
    <!-- Logo section -->
    <div
      class="nav-logo"
      @click="navigation.goTo('/')"
    >
      <img
        src="../public/images/Logo.png"
        alt="Logo"
        class="logo-image"
      />
      <span class="break-line" />
      <p class="logo-text">
        Platforma <br />
        Szkoleniowa
      </p>
    </div>

    <!-- Navigation links -->
    <div
      class="nav-links"
      :class="{ active: menuOpen, loading: isLoading }"
    >
      <button
        class="nav-button"
        @click="navigation.goTo('/courses')"
      >
        Kursy
      </button>
      <button
        class="nav-button"
        @click="navigation.goTo('/community/questions')"
      >
        Społeczność
      </button>

      <template v-if="isLogged">
        <button
          v-if="usePermissionGuard('PANEL_SHOW_ADMIN_PANEL')"
          class="nav-button"
          @click="navigation.goTo('/admin')"
        >
          Panel Admina
        </button>
        <button
          class="nav-button"
          @click="navigation.goTo('/profile/profil')"
        >
          Profil
        </button>
        <button
          class="nav-button logout-button"
          @click="navigation.handleLogout"
        >
          Wyloguj
        </button>
        <NotificationBadge />
      </template>

      <template v-else>
        <button
          class="nav-button"
          @click="navigation.goTo('/register')"
        >
          Zarejestruj się
        </button>
        <button
          class="nav-button"
          @click="navigation.goTo('/login')"
        >
          Zaloguj się
        </button>
      </template>
    </div>

    <!-- Hamburger menu -->
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

/* Notification styles */
.notification-wrapper {
  position: relative;
}

.notification-icon {
  position: relative;
  color: #eb5757;
  cursor: pointer;
  padding: 8px;
  transition: transform 0.2s ease;
}

.notification-icon:hover {
  transform: scale(1.1);
}

.notification-count {
  position: absolute;
  top: 0;
  right: 0;
  background: #eb5757;
  color: white;
  font-size: 12px;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 320px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.notification-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #fff5f5;
}

.notification-item.unread:hover {
  background-color: #ffe5e5;
}

.notification-text {
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.notification-time {
  display: block;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.notification-empty {
  padding: 30px 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
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

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Media Queries */
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

  .notification-dropdown {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    border-radius: 10px 10px 0 0;
    max-height: 80vh;
  }

  .notification-list {
    max-height: 60vh;
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
