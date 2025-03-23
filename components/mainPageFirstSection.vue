<script lang="ts" setup></script>

<template>
  <div>
    <div class="diagonal-container">
      <div class="left-side">
        <div class="left-text">
          <h1>Otwórz drzwi do nowej wiedzy i umiejętności!</h1>
          <p>
            Nasza platforma szkoleniowa to miejsce stworzone dla osób pragnących
            rozwijać swoje kompetencje i zdobywać praktyczne doświadczenie.
            Dzięki nowoczesnym metodom nauczania i interaktywnym materiałom masz
            dostęp do wartościowej wiedzy w dowolnym miejscu i czasie.
            Niezależnie od tego, czy chcesz podnieść swoje kwalifikacje
            zawodowe, zdobyć nowy zawód czy rozwijać swoje pasje, znajdziesz
            tutaj kursy dopasowane do Twoich potrzeb. Dołącz do nas i rozpocznij
            swoją edukacyjną podróż już dziś!
          </p>
          <button class="cta-button">Rozpocznij naukę</button>
        </div>
      </div>
      <div class="right-side"></div>
    </div>
  </div>
</template>

<style scoped>
.diagonal-container {
  margin-top: 2rem;
  position: relative;
  width: 100%;
  height: 600px;
  display: flex;
  overflow: hidden;
}

@keyframes slideInFromRight {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.left-side {
  flex: 0.35;
  color: black;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
  text-align: left;
  animation: slideInFromRight 1.3s ease-out forwards;
}

.left-side h1 {
  font-size: 38px;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.2;
}

.left-side p {
  font-size: 17px;
  line-height: 1.8;
  margin-bottom: 30px;
}

.left-text {
  width: 600px;
}

.right-side {
  flex: 0.65;
  background: linear-gradient(360deg, #222, rgba(34, 34, 34, 0.2)),
    url("/public/images/sekcja1.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 2;
}

.left-side,
.right-side {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-button {
  background-color: #222;
  color: white;
  font-size: 17px;
  font-weight: 500;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease;
  align-self: flex-start;
}

.cta-button:hover {
  background-color: #444;
}

.hero-sc {
  display: flex;
  justify-content: flex-start;
}

.dcr-left {
  width: 100%;
  background: linear-gradient(360deg, #222, rgba(34, 34, 34, 0.2)),
    url("/public/images/rudy2.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100%;
}
.text-content {
  width: 100%;
}

.text-content h1 {
  font-size: 38px;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.2;
}

.text-content p {
  font-size: 17px;
  line-height: 1.8;
  margin-bottom: 30px;
}

@media (max-width: 1024px) {
  .diagonal-container {
    flex-direction: column;
    height: auto;
  }

  .left-side,
  .right-side {
    flex: none;
    width: 100%;
    padding: 30px;
  }

  .left-text {
    max-width: 100%;
  }

  .right-side {
    height: 300px;
  }
}

@media (max-width: 600px) {
  .left-side {
    padding: 20px;
    align-items: center;
  }

  .left-text h1 {
    font-size: 28px;
  }

  .left-text p {
    font-size: 15px;
  }

  .cta-button {
    font-size: 15px;
    padding: 8px 16px;
  }

  .right-side {
    height: 250px;
  }
}
</style>
