<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const menuOpen = ref(false);
const router = useRouter();

const goToLogin = () => {
  router.push("/login");
};
const goToRegister = () => {
  router.push("/register");
};

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

const user = useCookie("access_token");
const logout = () => {
  user.value = null;
};
</script>

<template>
  <div>
    <div class="navbar">
      <div class="nav-logo">
        <img
          src="../public/images/Logo.png"
          alt="Logo"
        />
        <span class="break-line" />
        <p class="logo-text">
          Platforma <br />
          Szkoleniowa
        </p>
      </div>

      <div
        class="nav-button-container"
        v-if="user"
      >
        <button class="red-button">Kursy</button>
        <button class="red-button">Profil</button>
        <button
          class="red-button"
          @click="logout"
        >
          Wyloguj
        </button>
      </div>

      <div
        class="nav-button-container"
        v-else
      >
        <button class="red-button">Kursy</button>
        <button
          class="red-button"
          @click="goToRegister"
        >
          Zarejestruj się
        </button>
        <button
          class="red-button"
          @click="goToLogin"
        >
          Zaloguj się
        </button>
      </div>

      <!-- Wspólny hamburger dla obu przypadków -->
      <div
        class="hamburger"
        @click="toggleMenu"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <!-- Wspólne mobile-menu dla obu przypadków -->
    <transition name="slide">
      <div
        class="mobile-menu"
        v-if="menuOpen"
      >
        <button class="red-button">Kursy</button>
        <template v-if="user">
          <button class="red-button">Profil</button>
          <button
            class="red-button"
            @click="logout"
          >
            Wyloguj
          </button>
        </template>
        <template v-else>
          <button
            class="red-button"
            @click="goToRegister"
          >
            Zarejestruj się
          </button>
          <button
            class="red-button"
            @click="goToLogin"
          >
            Zaloguj się
          </button>
        </template>
      </div>
    </transition>
  </div>
</template>

<style>
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
  background-color: #eb5757;
  color: white;
  font-size: 18px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  padding: 8px 24px;
  cursor: pointer;
  transition: background 0.3s;
  margin-right: 20px;
}

.red-button:hover {
  background-color: #c54242;
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

@media (max-width: 1024px) {
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
