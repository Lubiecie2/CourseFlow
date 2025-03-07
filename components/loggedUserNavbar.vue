<template>
  <div>
    <div class="navbar">
      <div class="nav-logo">
        <img
          src=""
          alt="Logo"
        />
        <a
          >Platforma <br />
          Szkoleniowa</a
        >
      </div>
      <div class="nav-search">
        <a>Search</a>
      </div>
      <div class="button-container">
        <a>Dla firm</a>
        <a>Profil</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  height: 100px;
  width: 100%;
  background-color: aqua;
  display: flex;
  justify-content: space-between;
}
.nav-logo {
  display: flex;
  justify-content: center;
  margin-left: 10vh;
}
.nav-search {
  margin-right: 20%;
}
.button-container {
  margin-right: 20%;
}
</style>
