<script setup>
import { ref, onMounted } from "vue";

definePageMeta({
  middleware: ["auth", "admin-auth"],
  layout: "login",
});

// ------ Zmienne -------------------------------------------

const courses = ref([]);
const isLoading = ref(true);
const errorMessage = ref("");
const showDeleteDialog = ref(false);
const courseToDelete = ref(null);
const deleteSuccessMessage = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const logsPerPage = 15;
const dateFrom = ref("");
const dateTo = ref("");
const isFilterActive = ref(false);

// ------ Logi operacji użytkowników -----------------------------

const logs = ref([]);
const logsLoading = ref(true);
const logsError = ref(null);
const logsRefreshCounter = ref(0);

//  ------ Pobieranie logów operacji -----------------------------

const fetchCourseLogs = async () => {
  try {
    logsLoading.value = true;
    logsError.value = null;

    let url = `logs/courses?page=${currentPage.value}&limit=${logsPerPage}`;

    if (dateFrom.value) {
      url += `&fromDate=${dateFrom.value}T00:00:00.000Z`;
    }
    if (dateTo.value) {
      url += `&toDate=${dateTo.value}T23:59:59.999Z`;
    }

    const response = await useApiFrontend(url);

    if (response && response.success) {
      logs.value = response.logs || [];

      if (response.pagination) {
        totalPages.value = response.pagination.totalPages || 1;
      }
    } else {
      throw new Error("Nie udało się pobrać logów operacji kursów");
    }
  } catch (err) {
    console.error("Błąd podczas pobierania logów kursów:", err);
    logsError.value = "Wystąpił błąd podczas pobierania logów operacji kursów.";
  } finally {
    logsLoading.value = false;
  }
};

// ------ Pobieranie kursów ---------------------------

const fetchCourses = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await useApiFrontend("courses");

    if (response && Array.isArray(response)) {
      courses.value = response;
    } else {
      errorMessage.value = "Nie udało się pobrać listy kursów";
    }
  } catch (err) {
    console.error("Błąd pobierania kursów:", err);
    errorMessage.value = "Nie udało się pobrać listy kursów";
  } finally {
    isLoading.value = false;
  }
};

// ------ Usuwanie kursu -----------------------------

const confirmDelete = (course) => {
  courseToDelete.value = course;
  showDeleteDialog.value = true;
};

const cancelDelete = () => {
  courseToDelete.value = null;
  showDeleteDialog.value = false;
};

const deleteCourse = async () => {
  try {
    const { error } = await useApiServer(
      `/courses/${courseToDelete.value.id}`,
      {
        method: "DELETE",
      }
    );

    if (error.value) {
      throw new Error(error.value.message || "Nie udało się usunąć kursu");
    }

    deleteSuccessMessage.value = `Kurs "${courseToDelete.value.title}" został usunięty`;
    showDeleteDialog.value = false;
    courseToDelete.value = null;

    await fetchCourses();

    setTimeout(() => {
      deleteSuccessMessage.value = "";
    }, 5000);
  } catch (err) {
    console.error("Błąd podczas usuwania kursu:", err);
    errorMessage.value = err.message || "Nie udało się usunąć kursu";
  }
};

//  ------ Wyświetlanie komunikatów zależnie od aktualizacji -----------------------------

const getUpdateDetails = (oldValue, description) => {
  if (description) return description;

  if (oldValue && typeof oldValue === "string") {
    // w przyszłości dodać nowe triggery, które będą monitorowały te dane
    if (oldValue.includes("chapter") || oldValue.includes("rozdział")) {
      return "Zmiana w rozdziałach kursu";
    } else if (oldValue.includes("test") || oldValue.includes("quiz")) {
      return "Zmiana w testach kursu";
    } else if (oldValue.includes("question") || oldValue.includes("pytanie")) {
      return "Zmiana w pytaniach testowych kursu";
    } else if (oldValue.includes("content") || oldValue.includes("treść")) {
      return "Zmiana zawartości kursu";
    } else if (oldValue.includes("image") || oldValue.includes("obrazek")) {
      return "Zmiana miniaturki kursu";
    } else if (oldValue.includes("title") || oldValue.includes("tytuł")) {
      return "Zmiana tytułu kursu";
    } else if (
      oldValue.includes("category") ||
      oldValue.includes("kategoria")
    ) {
      return "Zmiana kategorii kursu";
    } else if (oldValue.includes("description") || oldValue.includes("opis")) {
      return "Zmiana opisu kursu";
    }
  }
  return "Modyfikacja danych kursu";
};

// ------ Paginacja logów -------------------------------------

const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  currentPage.value = newPage;
  fetchCourseLogs();
};

// ------ Formatowanie daty ------------------------------------

const applyDateFilter = () => {
  isFilterActive.value = !!(dateFrom.value || dateTo.value);
  currentPage.value = 1;
  fetchCourseLogs();
};

// ------ Czyszczenie filtrów daty -----------------------------

const clearDateFilter = () => {
  dateFrom.value = "";
  dateTo.value = "";
  isFilterActive.value = false;
  currentPage.value = 1;
  fetchCourseLogs();
};

// ------ Formatowanie daty -------------------------------------

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// ------ Inicjalizacja logów oraz kursów -------------------------------------

onMounted(() => {
  fetchCourses();
  fetchCourseLogs();
});

// ------ Odświeżanie logów ---------------------------------------

watch(logsRefreshCounter, () => {
  setTimeout(fetchCourseLogs, 500);
});

watch(deleteSuccessMessage, () => {
  if (deleteSuccessMessage.value) {
    setTimeout(() => {
      fetchCourseLogs();
    }, 500);
  }
});
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
          v-if="deleteSuccessMessage"
          class="success-message"
        >
          {{ deleteSuccessMessage }}
        </div>

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
                  <button
                    @click="confirmDelete(course)"
                    class="btn-delete"
                  >
                    Usuń
                  </button>
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

        <div
          class="logs-section"
          v-if="usePermissionGuard('PANEL_SHOW_COURSES_LOGS')"
        >
          <h2>Historia operacji kursów</h2>
          <p class="section-description">
            Utworzenie, edycja i usuwanie kursów
          </p>

          <div class="filter-container">
            <div class="filter-row">
              <div class="filter-group">
                <label for="date-from">Od daty:</label>
                <input
                  id="date-from"
                  v-model="dateFrom"
                  type="date"
                  class="date-input"
                />
              </div>
              <div class="filter-group">
                <label for="date-to">Do daty:</label>
                <input
                  id="date-to"
                  v-model="dateTo"
                  type="date"
                  class="date-input"
                />
              </div>
              <div class="filter-actions">
                <button
                  @click="applyDateFilter"
                  class="btn-filter"
                >
                  Filtruj
                </button>
                <button
                  @click="clearDateFilter"
                  class="btn-clear-filter"
                  :disabled="!isFilterActive"
                >
                  Wyczyść
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="logsLoading"
            class="logs-loading"
          >
            <div class="spinner"></div>
            <p>Ładowanie logów...</p>
          </div>

          <div
            v-else-if="logsError"
            class="logs-error"
          >
            <p>{{ logsError }}</p>
            <button
              @click="fetchCourseLogs"
              class="btn-retry"
            >
              Spróbuj ponownie
            </button>
          </div>

          <div
            v-else-if="logs.length === 0"
            class="logs-empty"
          >
            <div class="empty-icon">📝</div>
            <p>Brak logów operacji kursów</p>
          </div>

          <div
            v-else
            class="logs-table-wrapper"
          >
            <table class="logs-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Operacja</th>
                  <th>Kurs</th>
                  <th>Użytkownik</th>
                  <th>Szczegóły</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="log in logs"
                  :key="log.id"
                >
                  <td>{{ formatDate(log.created_at) }}</td>
                  <td>
                    <span
                      :class="[
                        'log-type',
                        log.action_type === 'COURSE_CREATED'
                          ? 'log-create'
                          : log.action_type === 'COURSE_UPDATED'
                          ? 'log-update'
                          : 'log-delete',
                      ]"
                    >
                      {{
                        log.action_type === "COURSE_CREATED"
                          ? "Utworzenie"
                          : log.action_type === "COURSE_UPDATED"
                          ? "Aktualizacja"
                          : "Usunięcie"
                      }}
                    </span>
                  </td>
                  <td>
                    {{
                      log.course_title ||
                      (log.action_type === "COURSE_CREATED"
                        ? log.new_value
                        : log.action_type === "COURSE_DELETED"
                        ? log.old_value
                        : "Nieznany kurs")
                    }}
                  </td>
                  <td>{{ log.user_email || "System" }}</td>
                  <td>
                    <span v-if="log.action_type === 'COURSE_CREATED'">
                      Utworzenie kursu:
                      {{ log.new_value || log.course_title || "Nieznany kurs" }}
                    </span>
                    <span v-else-if="log.action_type === 'COURSE_UPDATED'">
                      {{
                        log.action_description ||
                        (log.old_value &&
                          getUpdateDetails(
                            log.old_value,
                            log.action_description
                          )) ||
                        "Aktualizacja kursu: " +
                          (log.new_value || log.course_title || "Nieznany kurs")
                      }}
                    </span>
                    <span v-else-if="log.action_type === 'COURSE_DELETED'">
                      Usunięcie kursu:
                      {{ log.old_value || log.course_title || "Nieznany kurs" }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="pagination-controls">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="pagination-btn"
              >
                &laquo; Poprzednia
              </button>
              <span class="page-info"
                >Strona {{ currentPage }} z {{ totalPages }}</span
              >
              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="pagination-btn"
              >
                Następna &raquo;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="showDeleteDialog"
      class="delete-dialog-overlay"
    >
      <div class="delete-dialog">
        <h3>Potwierdź usunięcie</h3>
        <p>Czy na pewno chcesz usunąć kurs "{{ courseToDelete?.title }}"?</p>
        <p class="warning">Ta operacja jest nieodwracalna.</p>
        <div class="dialog-actions">
          <button
            @click="cancelDelete"
            class="btn-cancel"
          >
            Anuluj
          </button>
          <button
            @click="deleteCourse"
            class="btn-confirm"
          >
            Usuń
          </button>
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
.btn-delete {
  display: inline-block;
  background-color: #dc3545;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  text-decoration: none;
  font-weight: 500;
  margin-left: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-delete:hover {
  background-color: #c82333;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.delete-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.delete-dialog {
  background-color: white;
  padding: 30px;
  border-radius: 16px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.delete-dialog h3 {
  margin-top: 0;
  font-size: 1.5rem;
  color: #212529;
}

.delete-dialog .warning {
  color: #dc3545;
  font-weight: 500;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-confirm {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.logs-section {
  margin-top: 50px;
  background-color: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.logs-section h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #212529;
}

.section-description {
  color: #6c757d;
  margin-bottom: 20px;
}

.filter-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-size: 0.9rem;
  color: #495057;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.btn-filter,
.btn-clear-filter {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-filter {
  background-color: #eb5757;
  color: white;
}

.btn-clear-filter {
  background-color: #6c757d;
  color: white;
  opacity: 0.9;
}

.btn-clear-filter:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.logs-loading,
.logs-error,
.logs-empty {
  padding: 20px;
  text-align: center;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #eb5757;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.logs-empty .empty-icon {
  font-size: 32px;
  margin-bottom: 10px;
  color: #adb5bd;
}

.logs-table-wrapper {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th {
  background-color: #f8f9fa;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #dee2e6;
}

.logs-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
  color: #212529;
}

.log-type {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.log-create {
  background-color: #d4edda;
  color: #28a745;
}

.log-update {
  background-color: #e3f2fd;
  color: #0d6efd;
}

.log-delete {
  background-color: #f8d7da;
  color: #dc3545;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.pagination-btn {
  padding: 8px 16px;
  background-color: #eb5757;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.update-details {
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
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
