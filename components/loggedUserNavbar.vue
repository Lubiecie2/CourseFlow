<template>
  <div>
    <div class="navbar">
      <div class="nav-left">
        <img
          src="../public/images/Logo.png"
          alt="Logo"
          class="logo"
        />
        <span class="break-line" />
        <span class="platform-name">Platforma<br />Szkoleniowa</span>
      </div>

      <div class="nav-search">
        <input
          type="text"
          class="search-bar"
          placeholder="Wyszukaj kursy lub materiały"
        />
        <button class="search-button">
          <img
            src="../public/images/loop.png"
            alt="Szukaj"
            class="search-icon"
          />
        </button>
      </div>

      <div class="nav-right">
        <a href="#">Dla firm</a>
        <hr class="break-line" />
        <button class="login-button">Profil</button>
      </div>

      <button
        class="hamburger"
        @click="toggleMenu"
      >
        &#9776;
      </button>
    </div>

    <div
      v-if="menuOpen"
      class="mobile-menu"
    >
      <a href="#">Dla firm</a>
      <button class="login-button">Profil</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuOpen: false,
    };
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
  },
};
</script>

<style scoped>
.navbar {
  background-color: rgb(208, 232, 238);
  width: 100%;
  padding: 15px 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  flex-wrap: wrap;
  position: relative;
}

.nav-left {
  display: flex;
  align-items: center;
}

.logo {
  width: 120px;
  height: auto;
  margin-right: 10px;
}

.break-line {
  width: 1px;
  height: 5vh;
  background-color: black;
  border: none;
  margin: 0 5px;
}

.platform-name {
  font-weight: bold;
  font-size: 1.2rem;
  margin-left: 10px;
}

.nav-search {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 400px;
  background: white;
  padding: 5px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.search-bar {
  border: none;
  padding: 5px;
  font-size: 1rem;
  flex-grow: 1;
}

.search-button {
  background: none;
  border: none;
  cursor: pointer;
}

.search-icon {
  width: 20px;
  height: auto;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-right a {
  font-size: 1rem;
  font-weight: bold;
  color: black;
}

.login-button {
  border: 2px solid black;
  background-color: white;
  border-radius: 4px;
  padding: 0 20px;
  height: 35px;
  font-weight: bold;
  transition: 0.3s;
}

.login-button:hover {
  border-color: rgb(33, 131, 177);
  color: rgb(33, 131, 177);
  opacity: 0.6;
}

.hamburger {
  display: none;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  background: rgb(208, 232, 238);
  padding: 10px;
  position: absolute;
  top: 60px;
  right: 5%;
  width: 200px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.mobile-menu a,
.mobile-menu button {
  display: block;
  margin: 10px 0;
  text-align: center;
}
</style>
