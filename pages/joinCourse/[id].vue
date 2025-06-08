<script setup>
import { ref, onMounted } from "vue";

definePageMeta({
  layout: "login",
  middleware: "auth",
});

const route = useRoute();
const courseId = route.params.id;

const course = ref(null);
const isLoading = ref(true);
const error = ref(null);
const registrationStatus = ref(null);
const isSignedUp = ref(false);

const fetchCourse = async () => {
  try {
    isLoading.value = true;
    const response = await useApiFrontend(`/courses/${courseId}`);
    course.value = response;
    checkSignedUpStatus();
  } catch (err) {
    console.error("Błąd podczas pobierania danych kursu:", err);
    error.value = "Nie udało się załadować danych kursu.";
  } finally {
    isLoading.value = false;
  }
};

const checkSignedUpStatus = async () => {
  try {
    const { data } = await useApiServer("/userCourse/registeredForCourse");
    if (data.value) {
      isSignedUp.value = data.value.some(
        (registration) => registration.course_id === parseInt(courseId)
      );
    }
  } catch (error) {
    console.error("Błąd podczas sprawdzania zapisów:", error);
  }
};

const signUpUserToCourse = async () => {
  try {
    registrationStatus.value = null;
    const response = await useApiFrontend("/userCourse/signUpToCourse", {
      method: "POST",
      body: { courseId: parseInt(courseId) },
    });

    registrationStatus.value = "success";
    isSignedUp.value = true;

    setTimeout(() => {
      registrationStatus.value = null;
    }, 3000);
  } catch (err) {
    console.error("Błąd podczas zapisywania na kurs:", err);
    registrationStatus.value = "error";
  }
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return "http://localhost:4000/uploads/default-course.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  return `http://localhost:4000/uploads/${imagePath}`;
};
onMounted(fetchCourse);
</script>

<template>
  <div>
    <mainNavbar />
    <div class="page-container">
      <div
        v-if="isLoading"
        class="loading-state"
      >
        <div class="spinner"></div>
        <p>Ładowanie szczegółów kursu...</p>
      </div>
      <div
        v-else-if="error"
        class="error-state"
      >
        <div class="error-icon">❌</div>
        <p>{{ error }}</p>
        <button
          @click="fetchCourse"
          class="refresh-button"
        >
          Odśwież
        </button>
      </div>
      <div
        v-else-if="course"
        class="course-container"
      >
        <div
          class="course-hero"
          :style="`background-image: url(${getImageUrl(course.course_image)})`"
        >
          <div class="hero-content">
            <span class="course-category-badge">{{ course.category }}</span>
            <h1 class="course-title">{{ course.title }}</h1>
          </div>
        </div>
        <div class="content-wrapper">
          <div class="main-content">
            <section class="content-section">
              <h2 class="section-title">O kursie</h2>
              <p class="course-description">
                {{ course.short_description || "Brak opisu kursu." }}
              </p>
            </section>
            <section class="content-section">
              <h2 class="section-title">Co zyskasz</h2>
              <ul class="benefits-list">
                <li class="benefit-item">
                  <span class="check-icon">✓</span>
                  <span>Dostęp do wszystkich materiałów kursu</span>
                </li>
                <li class="benefit-item">
                  <span class="check-icon">✓</span>
                  <span>Możliwość nauki w dowolnym tempie</span>
                </li>
                <li class="benefit-item">
                  <span class="check-icon">✓</span>
                  <span>Testy sprawdzające wiedzę</span>
                </li>
                <li class="benefit-item">
                  <span class="check-icon">✓</span>
                  <span>Certyfikat ukończenia kursu</span>
                </li>
              </ul>
            </section>
          </div>
          <div class="sidebar">
            <div
              v-if="isSignedUp"
              class="registration-card registration"
            >
              <div class="registration-icon">✓</div>
              <h3>Jesteś zapisany na ten kurs</h3>
              <p>Możesz teraz rozpocząć naukę</p>
              <NuxtLink
                to="/profile/learning"
                class="action-button registration-button"
              >
                Rozpocznij naukę
              </NuxtLink>
            </div>
            <div
              v-else
              class="registration-card"
            >
              <h3>Zapisz się na kurs</h3>
              <p>Dołącz do kursu i rozpocznij naukę już teraz</p>
              <div
                v-if="registrationStatus === 'success'"
                class="status-message success"
              >
                <span class="status-icon">✓</span>
                <span>Zapisano pomyślnie!</span>
              </div>
              <div
                v-if="registrationStatus === 'error'"
                class="status-message error"
              >
                <span class="status-icon">❌</span>
                <span>Wystąpił błąd podczas zapisywania</span>
              </div>
              <button
                @click="signUpUserToCourse"
                class="action-button"
                :disabled="registrationStatus === 'success'"
              >
                {{
                  registrationStatus === "success"
                    ? "Zapisano"
                    : "Zapisz się na kurs"
                }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: 40px auto;
  max-width: 600px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(52, 152, 219, 0.2);
  border-top-color: #eb5757;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
  color: #e74c3c;
}

.refresh-button {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  margin-top: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-button:hover {
  background-color: #d63031;
  transform: translateY(-2px);
}

.course-container {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 40px;
}

.course-hero {
  position: relative;
  height: 350px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  color: white;
}

.hero-content {
  width: 100%;
  padding: 40px;
}

.course-category-badge {
  background-color: #eb5757;
  color: white;
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.course-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.content-wrapper {
  display: flex;
  gap: 30px;
  padding: 40px;
}

.main-content {
  flex: 2;
}

.sidebar {
  flex: 1;
}

.content-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 10px;
}

.section-title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 60px;
  height: 3px;
  background-color: #eb5757;
}

.course-description {
  font-size: 17px;
  line-height: 1.7;
  color: #444;
  margin-bottom: 20px;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefit-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
}

.check-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  background-color: #e1f5fe;
  color: #eb5757;
  border-radius: 50%;
  margin-right: 16px;
  font-weight: bold;
  flex-shrink: 0;
}

.registration-card {
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 1px solid #eaeaea;
}

.registration-card.registration {
  background-color: #e8f5e9;
  border-color: #66bb6a;
}

.registration-card h3 {
  font-size: 20px;
  margin-top: 0;
  margin-bottom: 12px;
  color: #2c3e50;
}

.registration-card p {
  color: #5d6778;
  margin-bottom: 24px;
}

.registration-icon {
  font-size: 32px;
  color: green;
  margin-bottom: 16px;
}

.action-button {
  display: inline-block;
  width: 100%;
  padding: 14px 20px;
  background-color: #eb5757;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
}

.action-button:hover:not(:disabled) {
  background-color: #d63031;
  transform: translateY(-2px);
  box-shadow: #d63031;
}

.action-button:disabled {
  background-color: #95a5a6;
}

.enrolled-button {
  background-color: #eb5757;
}

.enrolled-button:hover {
  background-color: #4caf50;
}

.status-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.status-message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-message.error {
  background-color: #ffebee;
  color: #c62828;
}

.status-icon {
  margin-right: 8px;
  font-size: 18px;
}

@media (max-width: 900px) {
  .content-wrapper {
    flex-direction: column;
    padding: 30px 20px;
  }

  .course-title {
    font-size: 28px;
  }

  .hero-content {
    padding: 30px 20px;
  }
}

@media (max-width: 600px) {
  .course-hero {
    height: 250px;
  }

  .course-title {
    font-size: 24px;
  }

  .content-section {
    margin-bottom: 30px;
  }

  .section-title {
    font-size: 20px;
  }
}
</style>
