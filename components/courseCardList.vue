<script setup>
import { ref, onMounted } from "vue";

const courses = ref([]);
const isLoading = ref(true);
const error = ref(null);

const getImageUrl = (imagePath) => {
  if (!imagePath) return "http://localhost:4000/uploads/default-course.jpg";

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  return `http://localhost:4000/uploads/${imagePath}`;
};

const fetchCourses = async () => {
  try {
    isLoading.value = true;
    const response = await useApiFrontend("/courses");
    courses.value = response || [];
  } catch (err) {
    console.error("Błąd podczas pobierania kursów:", err);
    error.value = "Nie udało się załadować kursów. Spróbuj odświeżyć stronę.";
  } finally {
    isLoading.value = false;
  }
};
onMounted(fetchCourses);
</script>

<template>
  <div class="courses-section">
    <h2 class="section-title">Dostępne kursy</h2>

    <div
      v-if="isLoading"
      class="loading-state"
    >
      <div class="spinner"></div>
      <p>Ładowanie kursów...</p>
    </div>

    <div
      v-else-if="error"
      class="error-state"
    >
      <p>{{ error }}</p>
      <button @click="window.location.reload()">Odśwież stronę</button>
    </div>

    <div
      v-else-if="courses.length === 0"
      class="empty-state"
    >
      <p>Nie znaleziono żadnych kursów.</p>
    </div>

    <div
      v-else
      class="courses-grid"
    >
      <div
        v-for="course in courses"
        :key="course.id"
        class="course-card"
      >
        <div class="course-image">
          <img
            :src="getImageUrl(course.course_image)"
            :alt="course.title"
            @error="handleImageError"
          />
        </div>
        <div class="course-info">
          <h3 class="course-title">{{ course.title }}</h3>
          <div class="course-category">{{ course.category }}</div>
          <p class="course-description">{{ course.short_description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.courses-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.section-title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 40px;
  position: relative;
  color: #333;
}

.section-title:after {
  content: "";
  display: block;
  width: 80px;
  height: 3px;
  background-color: #eb5757;
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.course-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.course-image {
  height: 350px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.course-card:hover .course-image img {
  transform: scale(1.05);
}

.course-info {
  padding: 20px;
}

.course-title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.course-category {
  display: inline-block;
  background-color: #f0f0f0;
  color: #555;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.course-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 50px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(235, 87, 87, 0.2);
  border-top-color: #eb5757;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
