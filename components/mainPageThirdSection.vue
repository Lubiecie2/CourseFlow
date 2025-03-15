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
  <div class="third-container">
    <div class="third-section-title">
      <h1>Najlepszy sposób na naukę!</h1>
      <p>
        CourseFlow to platforma, która pomaga opanować cały materiał, a nie
        tylko suche fakty. Wystarczy Ci dostęp do internetu i kilka minut
        dziennie, a wszystkie potrzebne narzędzia znajdziesz w naszym kursie
        online – zawsze pod ręką. Odkryj radość z nauki z CourseFlow!
      </p>
    </div>
    <div
      class="third-section-info"
      :class="{ 'slide-in': sectionVisible }"
    >
      <div class="info-left">
        <div class="info-text">
          <h3>Krótkie lekcje</h3>
          <p>
            W ciągu 15 minut nauczysz się nowych zagadnień w wybranym kursie,
            takich jak matematyka, informatyka czy angielski. Oprócz teorii,
            czekają na Ciebie także interaktywne ćwiczenia i multimedia, które
            pomogą utrwalić wiedzę.
          </p>
        </div>
        <div class="info-text">
          <h3>Testy oraz wyniki</h3>
          <p>
            Nasze testy pomogą Ci nie tylko utrwalić zdobytą wiedzę, ale także
            śledzić postępy.
          </p>
        </div>
      </div>
      <div class="info-middle">
        <div class="info-screen">
          <img
            src="../public/images/math.jpg"
            alt="Zdjęcie telefonu"
          />
        </div>
      </div>
      <div class="info-right">
        <div class="info-text">
          <h3>Moduły z omówieniem</h3>
          <p>
            Każdy kurs jest podzielony na moduły, które zawierają szczegółowe
            omówienie tematyki – zarówno teoretycznej, jak i praktycznej. Dzięki
            temu zyskasz pewność, że rozumiesz materiał i jesteś gotowy do
            kolejnego wyzwania.
          </p>
        </div>
        <div class="info-text">
          <h3>Certyfikaty ukończenia kursów</h3>
          <p>
            Po ukończeniu każdego kursu na platformie CourseFlow otrzymasz
            certyfikat, który potwierdza Twoje umiejętności i wiedzę w danej
            dziedzinie.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.third-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-align: center;
  margin-top: 120px;
  margin-bottom: 120px;
}

.third-section-title h1 {
  font-size: 60px;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.2;
}

.third-section-title p {
  font-size: 1.2rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto 30px auto;
  text-align: center;
}

.third-section-info {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  width: 100%;
  max-width: 1200px;
}

.info-left,
.info-right {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 30%;
  max-width: 300px;
}

.info-left {
  text-align: right;
}

.info-right {
  text-align: left;
}

.info-text h3 {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 5px;
}

.info-text p {
  font-size: 1rem;
  line-height: 1.4;
}

.info-middle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30%;
}

.info-screen img {
  width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .third-section-info {
    flex-direction: column;
    align-items: center;
  }
  .info-left,
  .info-right,
  .info-middle {
    width: 100%;
    margin-bottom: 10px;
  }
  .third-section-title p {
    font-size: 1rem;
    max-width: 90%;
  }
}
</style>
