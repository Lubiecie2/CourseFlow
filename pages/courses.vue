<script setup>
import { ref, onMounted, computed } from "vue";

definePageMeta({
  layout: "login",
  middleware: "auth",
});

const courses = ref([]);
const isLoading = ref(true);
const error = ref(null);
const selectedCategory = ref(null);

const categories = [
  { name: "Programowanie", value: "programowanie" },
  { name: "Design", value: "design" },
  { name: "Biznes", value: "biznes" },
  { name: "Matematyka", value: "matematyka" },
  { name: "Języki obce", value: "jezyki" },
  { name: "Nauki ścisłe", value: "nauki" },
];

const getImageUrl = (imagePath) => {
  if (!imagePath) return "http://localhost:4000/uploads/default-course.jpg";
  if (imagePath.startsWith("http")) return imagePath;
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

const filteredCourses = computed(() => {
  if (!selectedCategory.value) return courses.value;
  return courses.value.filter(
    (course) =>
      course.category &&
      course.category.toLowerCase() === selectedCategory.value
  );
});

const toggleCategory = (category) => {
  selectedCategory.value =
    category === selectedCategory.value ? null : category;
};

onMounted(fetchCourses);
</script>

<template>
  <div>
    <mainNavbar />
    <div class="container">
      <div class="courses-layout">
        <aside class="filters-sidebar">
          <div class="filter-header">
            <h2>Kategorie</h2>
          </div>
          <div
            class="category-option"
            :class="{ active: selectedCategory === null }"
            @click="toggleCategory(null)"
          >
            <div class="category-info">
              <span class="category-name">Wszystkie kursy</span>
            </div>
          </div>
          <div
            v-for="category in categories"
            :key="category.value"
            class="category-option"
            :class="{ active: selectedCategory === category.value }"
            @click="toggleCategory(category.value)"
          >
            <div class="category-info">
              <span class="category-name">{{ category.name }}</span>
            </div>
          </div>
        </aside>
        <main class="courses-content">
          <div class="courses-header">
            <h2>
              {{
                selectedCategory
                  ? categories.find((c) => c.value === selectedCategory)?.name
                  : "Wszystkie kursy"
              }}
            </h2>
          </div>
          <div
            v-if="isLoading"
            class="courses-loading"
          >
            <div class="spinner"></div>
            <p>Wczytywanie kursów...</p>
          </div>
          <div
            v-else-if="error"
            class="courses-error"
          >
            <div class="error-icon">❌</div>
            <p>{{ error }}</p>
            <button
              @click="fetchCourses"
              class="refresh-button"
            >
              Odśwież
            </button>
          </div>
          <div
            v-else-if="filteredCourses.length === 0"
            class="courses-empty"
          >
            <div class="empty-icon">🔍</div>
            <h3>Brak kursów</h3>
            <p>Nie znaleziono kursów w wybranej kategorii</p>
            <button
              @click="selectedCategory = null"
              class="reset-button"
            >
              Pokaż wszystkie kursy
            </button>
          </div>
          <div
            v-else
            class="courses-grid"
          >
            <div
              v-for="course in filteredCourses"
              :key="course.id"
              class="course-card"
            >
              <div class="course-image">
                <img
                  :src="getImageUrl(course.course_image)"
                  :alt="course.title"
                />
                <div class="course-badge">{{ course.category }}</div>
              </div>
              <div class="course-content">
                <h3 class="course-title">{{ course.title }}</h3>
                <p class="course-description">{{ course.short_description }}</p>
                <div class="course-footer">
                  <NuxtLink
                    :to="`/joinCourse/${course.id}`"
                    class="view-button"
                  >
                    Zobacz kurs
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
  <foter></foter>
</template>

<style scoped>
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 5px 0 0;
}

.courses-layout {
  display: flex;
  gap: 20px;
  margin: 40px 0;
}

.filters-sidebar {
  width: 250px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: fit-content;
  position: sticky;
  top: 30px;
  margin-left: 5px;
}

.filter-header {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.filter-header h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.category-option {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid transparent;
}

.category-option:hover {
  background-color: #f5f5f5;
}

.category-option.active {
  background-color: #f0f7ff;
  border-left-color: #eb5757;
}

.category-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.courses-content {
  flex: 1;
}

.courses-header h2 {
  font-size: 24px;
  margin: 0;
  font-weight: 700;
  color: #333;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.course-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 450px;
}

.course-image {
  height: 220px;
  position: relative;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.course-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: #eb5757;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.course-content {
  padding: 24px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 15px;
  color: #333;
  line-height: 1.4;
}

.course-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 25px;
  flex-grow: 1;
  overflow: hidden;
  min-height: 84px;
}

.course-footer {
  margin-top: auto;
}

.view-button {
  width: 100%;
  padding: 12px;
  background-color: #eb5757;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.view-button:hover {
  background-color: #d63031;
}

.courses-loading,
.courses-error,
.courses-empty {
  padding: 60px 20px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(52, 148, 230, 0.2);
  border-top-color: #eb5757;
  border-radius: 50%;
  margin: 0 auto 20px;
}

.error-icon,
.empty-icon {
  font-size: 32px;
  margin-bottom: 15px;
}

.refresh-button,
.reset-button {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  margin-top: 15px;
  cursor: pointer;
  transition: background 0.2s;
}

.refresh-button:hover,
.reset-button:hover {
  background-color: #d63031;
}

@media (max-width: 1200px) {
  .courses-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .courses-layout {
    flex-direction: column;
  }

  .filters-sidebar {
    width: 100%;
    position: static;
    margin-bottom: 30px;
  }

  .category-option {
    padding: 12px 15px;
  }

  .courses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style>
