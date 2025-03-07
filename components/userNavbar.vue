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
        <span class="platform-name"
          >Platforma<br />
          Szkoleniowa</span
        >
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
        <button
          class="login-button"
          @click="$router.push('login')"
        >
          Login
        </button>
      </div>
    </div>
  </div>
</template>

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
}
.nav-left {
  display: flex;
  align-items: center;
  margin-right: 40px;
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
  font-size: 1vw;
  margin-left: 10px;
}
.nav-search {
  display: flex;
  align-items: center;
  flex: 1.2;
  max-width: 400px;
  background: white;
  padding: 0.2vh 0.5vw;
  border-radius: 8px;
  border: 1px solid #ccc;
}
.search-bar {
  border: none;
  padding: 0.5vh;
  font-size: 1vw;
  flex-grow: 1;
}
.search-button {
  background: none;
  border: none;
  cursor: pointer;
}
.search-icon {
  width: 2vw;
  max-width: 20px;
  height: auto;
}
.nav-right {
  display: flex;
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  gap: 1.5vw;
}
.nav-right a {
  font-size: 1vw;
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
  transition: 1s;
}
.login-button:hover {
  border-color: rgb(33, 131, 177);
  color: rgb(33, 131, 177);
  opacity: 0.6;
}
/*
@media (max-width: 768px) {         <==== Dodać responsywność ====>

}
*/
</style>
