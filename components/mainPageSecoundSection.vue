<script lang="ts" setup>
import { ref, onMounted } from "vue";

const router = useRouter();

const goToRegister = () => {
  router.push("/register");
};

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
          <h1>Jak to działa?</h1>
          <p>
            Proces nauki na naszej platformie jest prosty i intuicyjny.
            Wystarczy kilka kroków, aby rozpocząć swoją edukacyjną podróż!
          </p>

          <div class="steps">
            <div class="step">
              <span>📝</span>
              <p>Zarejestruj się</p>
            </div>
            <div class="step">
              <span>🎓</span>
              <p>Wybierz kurs</p>
            </div>
            <div class="step">
              <span>⏳</span>
              <p>Ucz się we własnym tempie</p>
            </div>
            <div class="step">
              <span>🏅</span>
              <p>Zdobądź certyfikat</p>
            </div>
          </div>

          <button
            class="cta-button"
            @click="goToRegister"
          >
            Zapisz się teraz
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.secound-section {
  min-height: 600px;
  display: flex;
  position: relative;
  overflow: hidden;
}
.secound-section-left {
  flex: 0.6;
  background: linear-gradient(360deg, #222, rgba(34, 34, 34, 0.2)),
    url("/public/images/secoundsectionphoto.jpg");
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
.steps {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.step {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.step span {
  font-size: 30px;
}

.step p {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}
.cta-button {
  margin-top: 20px;
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
