<script lang="ts" setup>
import { ref, onMounted } from "vue";

const sectionVisible = ref(false);

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          sectionVisible.value = true;
        }
      });
    },
    { threshold: 0.3 }
  );

  const section = document.querySelector(".secound-section");
  if (section) {
    observer.observe(section);
  }
});
</script>

<template>
  <div>
    <div class="secound-section">
      <div class="secound-section-left"></div>
      <div class="secound-section-right">
        <div
          class="secound-section-text"
          :class="{ 'slide-in': sectionVisible }"
        >
          <h1>Rozwijaj swoje umiejętności z naszą platformą!</h1>
          <p>
            W sercu naszej oferty stoi zespół pasjonatów i wykwalifikowanych
            specjalistów – kadra, która nieustannie podnosi swoje kwalifikacje i
            tworzy kursy dostosowane do najnowszych trendów w edukacji. Dzięki
            ich doświadczeniu, każdy kurs nabiera praktycznego wymiaru, a
            interaktywne materiały i nowoczesne metody nauczania sprawiają, że
            nauka staje się przyjemnością. Wykorzystaj interaktywne materiały,
            doświadcz innowacyjnych metod nauczania i ucz się w swoim tempie.
            Nie czekaj – rozpocznij swoją przygodę z nauką już teraz i przekonaj
            się, jak wiedza oraz pasja naszej kadry mogą zmienić Twoją
            przyszłość!
          </p>
          <button class="cta-button">Zapisz się teraz</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.secound-section {
  min-height: 600px;
  display: flex;
  position: relative;
  overflow: hidden;
}
.secound-section-left {
  flex: 0.6;
  background: linear-gradient(360deg, #222, rgba(34, 34, 34, 0.2)),
    url("/public/images/teams.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 2;
}
.secound-section-right {
  flex: 0.4;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.secound-section-text {
  width: 80%;
  transform: translateX(-100%);
  opacity: 0;
  transition: transform 0.8s ease-out, opacity 0.8s ease-out;
}

.secound-section-text.slide-in {
  transform: translateX(0);
  opacity: 1;
}
.secound-section-text h1 {
  font-size: 38px;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.2;
}
.secound-section-text p {
  font-size: 17px;
  line-height: 1.8;
  margin-bottom: 30px;
}
@media (max-width: 1024px) {
  .secound-section {
    flex-direction: column;
    height: auto;
  }

  .secound-section-left,
  .secound-section-right {
    flex: none;
    width: 100%;
  }

  .secound-section-left {
    height: 300px;
  }

  .secound-section-text {
    margin-top: 30px;
  }
  .secound-section-text {
    width: 90%;
  }
}

@media (max-width: 600px) {
  .secound-section-text h1 {
    font-size: 28px;
  }

  .secound-section-text p {
    font-size: 15px;
  }

  .cta-button {
    font-size: 15px;
    padding: 8px 16px;
  }
}
</style>
