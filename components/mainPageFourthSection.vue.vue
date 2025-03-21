<script lang="ts" setup>
import { ref, onMounted } from "vue";

const leftTextRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isVisible.value = true;
        observer.disconnect();
      }
    },
    { threshold: 0.3 }
  );

  if (leftTextRef.value) {
    observer.observe(leftTextRef.value);
  }
});
</script>

<template>
  <div>
    <div class="diagonal-container">
      <div class="left-side">
        <div
          ref="leftTextRef"
          class="left-text"
          :class="{ 'slide-in': isVisible }"
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
}

.left-text {
  width: 600px;
  opacity: 0;
  transform: translateX(100%);
  transition: opacity 1s ease-out, transform 0.8s ease-out;
}

.left-text.slide-in {
  opacity: 1;
  transform: translateX(0);
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

.right-side {
  flex: 0.65;
  background: linear-gradient(360deg, #222, rgba(34, 34, 34, 0.2)),
    url("/public/images/teamwork.jpg");
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
    width: 100%;
  }

  .right-side {
    height: 300px;
  }
}

@media (max-width: 1024px) {
  .left-side {
    padding: 20px;
    align-items: center;
  }

  .left-text {
    width: 100%;
    max-width: 90%;
    transform: translateX(50%);
  }

  .left-text.slide-in {
    transform: translateX(0);
  }

  .left-text h1 {
    font-size: 24px;
    margin-bottom: 15px;
  }

  .left-text p {
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .cta-button {
    font-size: 14px;
    padding: 8px 14px;
  }

  .right-side {
    height: 250px;
  }
}
</style>
