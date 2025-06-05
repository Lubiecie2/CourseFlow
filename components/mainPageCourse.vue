<script setup>
const router = useRouter();
const allCourses = ref([]);
const displayCourses = ref([]);
const currentPage = ref(0);
const coursesPerPage = 3;
const isLoading = ref(true);
const error = ref(null);

const goToCourse = (courseId) => {
  router.push(`/courses`);
};

const fetchCourses = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await useApiFrontend("courses");

    if (response && Array.isArray(response)) {
      allCourses.value = [...response].sort(() => Math.random() - 0.5);
      updateDisplayCourses();
    } else {
      error.value = "Nie udało się pobrać kursów";
    }
  } catch (err) {
    console.error("Błąd podczas pobierania kursów:", err);
    error.value = "Wystąpił błąd podczas ładowania kursów";
  } finally {
    isLoading.value = false;
  }
};

const updateDisplayCourses = () => {
  const startIndex = currentPage.value * coursesPerPage;
  displayCourses.value = allCourses.value.slice(
    startIndex,
    startIndex + coursesPerPage
  );
};

const nextPage = () => {
  const maxPage = Math.ceil(allCourses.value.length / coursesPerPage) - 1;
  if (currentPage.value < maxPage) {
    currentPage.value++;
    updateDisplayCourses();
  } else {
    currentPage.value = 0;
    updateDisplayCourses();
  }
};

const prevPage = () => {
  const maxPage = Math.ceil(allCourses.value.length / coursesPerPage) - 1;
  if (currentPage.value > 0) {
    currentPage.value--;
    updateDisplayCourses();
  } else {
    currentPage.value = maxPage;
    updateDisplayCourses();
  }
};

onMounted(() => {
  fetchCourses();
});
</script>

<template>
  <div>
    <h2 class="course-header">
      Wybierz swój kurs i rozwijaj swoje umiejętności!
    </h2>

    <div
      v-if="isLoading"
      class="loading-container"
    >
      <div class="loading-spinner"></div>
      <p>Ładowanie kursów...</p>
    </div>

    <div
      v-else-if="error"
      class="error-container"
    >
      <p>{{ error }}</p>
    </div>

    <div
      v-else
      class="carousel-container"
    >
      <button
        class="arrow left"
        @click="prevPage"
      >
        &#10094;
      </button>

      <div class="main-course-container">
        <div
          v-for="course in displayCourses"
          :key="course.id"
          class="course-block"
        >
          <div class="course-block-img">
            <img
              :src="
                course.course_image
                  ? `http://localhost:4000/uploads/${course.course_image}`
                  : `http://localhost:4000/uploads/default-course.jpg`
              "
              :alt="course.title"
            />
          </div>
          <div class="course-block-text">
            <h3>{{ course.title }}</h3>
            <p>
              {{
                course.short_description ||
                "Krótki opis kursu, który zachęci Cię do poznania jego zawartości."
              }}
            </p>
          </div>
          <div class="course-block-button">
            <button
              class="ctta-button"
              @click="goToCourse(course.id)"
            >
              Zobacz kurs
            </button>
          </div>
        </div>
      </div>

      <button
        class="arrow right"
        @click="nextPage"
      >
        &#10095;
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.course-header {
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  margin: 120px auto 20px auto;
  opacity: 0;
  animation: slideIn 0.5s ease-out forwards;
  animation-delay: 0.1s;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
}

.main-course-container {
  min-height: 600px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 60px;
}

.arrow {
  background: none;
  border: none;
  font-size: 2.5rem;
  cursor: pointer;
  color: black;
  transition: color 0.3s;
  z-index: 10;
  margin-left: 150px;
  margin-right: 150px;
}

.arrow:hover {
  color: #333;
}

.left {
  margin-right: 15px;
}

.right {
  margin-left: 15px;
}

.course-block {
  height: 560px;
  width: 400px;
  background-color: white;
  margin: 0 20px;
  margin-bottom: 150px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  opacity: 0;
  animation: slideIn 0.5s ease-out forwards;
  margin-top: 50px;
}

.course-block:nth-child(1) {
  animation-delay: 0.2s;
}

.course-block:nth-child(2) {
  animation-delay: 0.4s;
}

.course-block:nth-child(3) {
  animation-delay: 0.6s;
}

.course-block:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.course-block-img {
  width: 100%;
  height: 360px;
  overflow: hidden;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.course-block-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-block h3 {
  margin: 20px 0 5px 0;
  font-size: 20px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-block-text {
  margin: 0 20px;
  height: 100px;
  overflow: hidden;
}

.course-block-button {
  margin-top: 30px;
  text-align: center;
}

.course-block p {
  margin: 0;
  font-size: 16px;
  overflow: hidden;
}

.ctta-button {
  background-color: #333;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 16px;
}

.ctta-button:hover {
  background-color: #555;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #eb5757;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.error-container {
  text-align: center;
  color: #e53e3e;
  padding: 40px;
  background-color: #fff5f5;
  border-radius: 8px;
  margin: 40px auto;
  max-width: 600px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 1200px) {
  .main-course-container {
    flex-direction: column;
    align-items: center;
  }

  .course-block {
    width: 90%;
    max-width: 400px;
    margin-bottom: 40px;
  }

  .arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .left {
    left: 5px;
  }

  .right {
    right: 5px;
  }
}
</style>
