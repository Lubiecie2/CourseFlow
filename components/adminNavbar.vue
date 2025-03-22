<script lang="ts" setup>
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const activeSection = ref("courses");

const goToCourses = () => {
  router.push("/courses");
  activeSection.value = "courses";
};

const goToUsers = () => {
  router.push("/users");
  activeSection.value = "users";
};

const goToTests = () => {
  router.push("/tests");
  activeSection.value = "tests";
};

const isActive = (section: string) => {
  return activeSection.value === section;
};

const goToHome = () => {
  router.push("./");
};

definePageMeta({
  layout: "login",
});
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
          Panel <br />
          Administratora
        </p>
      </div>
      <div class="nav-buttons">
        <div class="button-container">
          <button
            @click="goToCourses"
            :class="{ active: isActive('courses') }"
          >
            Lista Kursów
          </button>
          <button
            @click="goToUsers"
            :class="{ active: isActive('users') }"
          >
            Zarządzaj Użytkownikami
          </button>
          <button
            @click="goToTests"
            :class="{ active: isActive('tests') }"
          >
            Testy
          </button>
        </div>
        <button
          class="user-icon"
          @click="goToHome"
        >
          &#127968;
        </button>
      </div>
    </div>
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
  padding: 0 5vh;
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
  margin: 0 10px;
}

.nav-buttons {
  display: flex;
  justify-content: center;
  flex-grow: 1;
  gap: 30px;
}

.button-container {
  display: flex;
  gap: 30px;
}

button {
  background: none;
  color: black;
  font-size: 1.4rem;
  font-weight: 600;
  border: none;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s, border-bottom 0.3s;
  position: relative;
}

button.active {
  color: #c54242;
}

button.active::after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #c54242;
}

button:hover {
  color: #c54242;
}

.user-icon {
  font-size: 40px;
  cursor: pointer;
  margin-left: 5vh;
}

@media (max-width: 1024px) {
  .navbar {
    padding: 0 2vh;
  }

  .nav-buttons {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }

  .nav-buttons {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .button-container {
    gap: 20px;
  }

  .logo-text {
    font-size: 1.2rem;
  }

  button {
    font-size: 1.2rem;
  }

  .user-icon {
    font-size: 35px;
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .logo-text {
    font-size: 1rem;
  }

  button {
    font-size: 1rem;
    padding: 10px;
  }

  .user-icon {
    font-size: 30px;
  }
}
</style>
