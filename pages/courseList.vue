<script setup>
import { ref, onMounted } from "vue";

definePageMeta({
  middleware: ["auth", "admin-auth"],
  layout: "login",
});

const courses = ref([]);
const isLoading = ref(true);
const errorMessage = ref("");

const fetchCourses = async () => {
  isLoading.value = true;
  try {
    const { data, error } = await useApiServer("/courses");

    if (error.value) {
      console.error("Błąd pobierania kursów:", error.value);
      errorMessage.value = "Nie udało się pobrać listy kursów";
    } else {
      courses.value = data.value || [];
    }
  } catch (err) {
    console.error("Błąd pobierania kursów:", err);
    errorMessage.value = "Nie udało się pobrać listy kursów";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchCourses);
</script>

<template>
  <div>
    <AdminNavbar />
    <div class="courses-page">
      <div class="container">
        <header class="page-header">
          <h1>Lista kursów</h1>
          <p>Zarządzaj swoimi kursami</p>
        </header>

        <div
          v-if="isLoading"
          class="loading-state"
        >
          <p>Ładowanie kursów...</p>
        </div>

        <div
          v-else-if="errorMessage"
          class="error-message"
        >
          {{ errorMessage }}
          <button
            @click="fetchCourses"
            class="btn-retry"
          >
            Spróbuj ponownie
          </button>
        </div>

        <div
          v-else
          class="courses-table-container"
        >
          <table class="courses-table">
            <thead>
              <tr>
                <th>Nazwa kursu</th>
                <th>Kategoria</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="courses.length === 0">
                <td
                  colspan="3"
                  class="empty-message"
                >
                  Nie znaleziono żadnych kursów.
                </td>
              </tr>
              <tr
                v-for="course in courses"
                :key="course.id"
              >
                <td class="course-title">{{ course.title }}</td>
                <td class="course-category">{{ course.category }}</td>
                <td class="course-actions">
                  <NuxtLink
                    :to="`/editCourse/${course.id}`"
                    class="btn-edit"
                  >
                    Edytuj kurs
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="actions-container">
          <NuxtLink
            to="/createCourse"
            class="btn-create"
          >
            Utwórz nowy kurs
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.courses-page {
  min-height: calc(100vh - 64px);
  background-color: #f8f9fa;
  padding: 40px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 12px;
}

.page-header p {
  font-size: 1.125rem;
  color: #6e6e73;
}

.loading-state {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.btn-retry {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  margin-top: 10px;
  cursor: pointer;
  font-weight: 500;
}

.courses-table-container {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 30px;
}

.courses-table {
  width: 100%;
  border-collapse: collapse;
}

.courses-table th {
  text-align: left;
  padding: 20px;
  background-color: #f8f9fa;
  color: #343a40;
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
}

.courses-table td {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.course-title {
  font-weight: 500;
  color: #212529;
  font-size: 1.1rem;
}

.course-category {
  color: #6c757d;
}

.course-actions {
  text-align: right;
}

.btn-edit {
  display: inline-block;
  background-color: rgba(235, 87, 87, 0.85);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-edit:hover {
  background-color: rgba(226, 61, 61, 0.85);
}

.empty-message {
  text-align: center;
  color: #6c757d;
  padding: 30px;
}

.actions-container {
  text-align: center;
  margin-top: 30px;
}

.btn-create {
  display: inline-block;
  background-color: rgba(235, 87, 87, 0.85);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.05rem;
  transition: background-color 0.2s;
}

.btn-create:hover {
  background-color: rgba(226, 61, 61, 0.85);
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .courses-table th,
  .courses-table td {
    padding: 15px 10px;
  }

  .course-title {
    font-size: 1rem;
  }
}
</style>
