<script setup>
definePageMeta({
  middleware: "auth",
  layout: "login",
});

// ------ Zmienne -------------------------------------------------

const questions = ref([]);
const loading = ref(true);
const courses = ref([]);
const newQuestion = ref({ title: "", content: "", courseId: null });
const showForm = ref(false);
const error = ref(null);
const selectedCourseFilter = ref(null);
const showOnlyGeneral = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const totalQuestions = ref(0);
const questionsPerPage = 10;
const { $socket } = useNuxtApp();

// ------ Inicjalizacja WebSocketa -------------------------------

const initializeSocketConnection = () => {
  if (!$socket.connected) {
    $socket.connect();
  }

  $socket.emit("join-questions-list");

  $socket.on("new-question", (question) => {
    if (!questions.value.some((q) => q.id === question.id)) {
      question.isNew = true;
      questions.value.unshift(question);
      totalQuestions.value++;

      setTimeout(() => {
        const index = questions.value.findIndex((q) => q.id === question.id);
        if (index !== -1) {
          questions.value[index].isNew = false;
        }
      }, 15000);

      if (
        Math.ceil(totalQuestions.value / questionsPerPage) > totalPages.value
      ) {
        totalPages.value++;
      }
    }
  });
};

// ------ Filtrowanie pytań -----------------------------------------

const filteredQuestions = computed(() => {
  if (!questions.value.length) return [];

  if (selectedCourseFilter.value) {
    return questions.value.filter(
      (q) => q.course_id === selectedCourseFilter.value
    );
  }

  if (showOnlyGeneral.value) {
    return questions.value.filter((q) => !q.course_id);
  }

  return questions.value;
});

// ------ Pobieranie pytań ------------------------------------------

const fetchQuestions = async (page = 1) => {
  try {
    loading.value = true;
    error.value = null;

    let url = `questions?page=${page}&limit=${questionsPerPage}`;

    if (selectedCourseFilter.value) {
      url += `&courseId=${selectedCourseFilter.value}`;
    } else if (showOnlyGeneral.value) {
      url += "&general=true";
    }

    const response = await useApiFrontend(url);

    if (response && response.success) {
      questions.value = response.questions || [];

      if (response.pagination) {
        totalPages.value = response.pagination.totalPages || 1;
        currentPage.value = page;
        totalQuestions.value =
          response.pagination.total || questions.value.length;
      }
    } else {
      throw new Error("Nie udało się pobrać pytań");
    }
  } catch (err) {
    console.error("Błąd podczas pobierania pytań:", err);
    error.value =
      "Wystąpił problem podczas ładowania pytań. Spróbuj odświeżyć stronę.";
  } finally {
    loading.value = false;
  }
};

// ------ Pobieranie kursów ------------------------------------------

const fetchCourses = async () => {
  try {
    const response = await useApiFrontend("courses");
    if (Array.isArray(response)) {
      courses.value = response;
    }
  } catch (err) {
    console.error("Błąd podczas pobierania kursów:", err);
  }
};

// ------ Dodawanie nowego pytania -------------------------------------

const addQuestion = async () => {
  if (!newQuestion.value.title || !newQuestion.value.content) return;

  try {
    const response = await useApiFrontend("questions", {
      method: "POST",
      body: {
        title: newQuestion.value.title,
        content: newQuestion.value.content,
        courseId: newQuestion.value.courseId || null,
      },
    });

    if (response && response.success) {
      newQuestion.value = { title: "", content: "", courseId: null };
      showForm.value = false;
      fetchQuestions();
    }
  } catch (err) {
    console.error("Błąd podczas dodawania pytania:", err);
  }
};

// ------ Zmiana strony ------------------------------------------------

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchQuestions(page);
};

// ------ Obsługa filtrów ----------------------------------------------

const applyFilter = () => {
  currentPage.value = 1;
  fetchQuestions(1);
};

watch([selectedCourseFilter, showOnlyGeneral], () => {
  applyFilter();
});

// ------ Przejście na stronę ze szczegółami pytania -------------------

const viewQuestion = (id) => {
  navigateTo(`/community/questions/${id}`);
};

// ------ Formatowanie daty --------------------------------------------

const formatDate = (date) => {
  return new Date(date).toLocaleString("pl");
};

// ------ Montowanie po odpaleniu strony -------------------------------

onBeforeUnmount(() => {
  if ($socket && $socket.connected) {
    $socket.emit("leave-questions-list");
    $socket.off("new-question");
    $socket.disconnect();
  }
});

onMounted(() => {
  fetchQuestions();
  fetchCourses();
  initializeSocketConnection();
});
</script>

<template>
  <MainNavbar />
  <div class="questions-page">
    <div class="header-section">
      <h1>Forum pytań i odpowiedzi</h1>
      <div class="header-decoration"></div>
      <p class="subtitle">
        Zadawaj pytania, dziel się wiedzą i znajdź rozwiązania
      </p>
    </div>

    <div class="content-container">
      <div class="top-actions">
        <div class="filters-section">
          <select
            v-model="selectedCourseFilter"
            class="filter-select"
            @change="showOnlyGeneral = false"
          >
            <option :value="null">Wszystkie pytania</option>
            <option
              value="general"
              @click="
                showOnlyGeneral = true;
                selectedCourseFilter = null;
              "
            >
              Tylko pytania ogólne
            </option>
            <option
              v-for="course in courses"
              :key="course.id"
              :value="course.id"
            >
              {{ course.title }}
            </option>
          </select>

          <button
            @click="showForm = !showForm"
            class="ask-button"
          >
            {{ showForm ? "Anuluj" : "Zadaj pytanie" }}
          </button>
        </div>
      </div>
      <div
        v-if="showForm"
        class="question-form"
      >
        <h3>Nowe pytanie</h3>
        <input
          v-model="newQuestion.title"
          placeholder="Tytuł pytania"
          class="form-input"
        />
        <textarea
          v-model="newQuestion.content"
          placeholder="Treść pytania"
          rows="4"
          class="form-textarea"
        ></textarea>
        <select
          v-model="newQuestion.courseId"
          class="form-select"
        >
          <option :value="null">
            Pytanie ogólne (bez przypisania do kursu)
          </option>
          <option
            v-for="course in courses"
            :key="course.id"
            :value="course.id"
          >
            Pytanie do kursu: {{ course.title }}
          </option>
        </select>
        <div class="form-actions">
          <button
            @click="addQuestion"
            class="submit-button"
            :disabled="!newQuestion.title || !newQuestion.content"
          >
            Wyślij pytanie
          </button>
        </div>
      </div>

      <div
        v-else-if="filteredQuestions.length === 0"
        class="empty-state"
      >
        <h3>Brak pytań</h3>
        <p v-if="showOnlyGeneral || selectedCourseFilter">
          Nie znaleziono pytań spełniających wybrane kryteria.
        </p>
        <p v-else>Zadaj pierwsze pytanie, aby rozpocząć dyskusję!</p>
      </div>

      <div
        v-else
        class="questions-list"
      >
        <div
          v-for="question in filteredQuestions"
          :key="question.id"
          @click="viewQuestion(question.id)"
          class="question-item"
          :class="{ new: question.isNew }"
        >
          <div class="question-header">
            <h3 class="question-title">{{ question.title }}</h3>
            <div
              v-if="question.courses"
              class="course-badge"
            >
              {{ question.courses.title }}
            </div>
          </div>

          <div class="question-content">
            {{ question.content.substring(0, 150)
            }}{{ question.content.length > 150 ? "..." : "" }}
          </div>

          <div class="question-footer">
            <span class="author">
              Autor: {{ question.users?.first_name }}
              {{ question.users?.last_name }}
            </span>
            <span class="date">
              Data: {{ formatDate(question.created_at) }}
            </span>
            <span class="answers-count">
              Odpowiedzi: {{ question._count?.course_answers || 0 }}
            </span>
          </div>
        </div>
      </div>
      <div
        v-if="filteredQuestions.length > 0"
        class="pagination"
      >
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-button"
        >
          &laquo; Poprzednia
        </button>
        <span class="page-info">
          Strona {{ currentPage }} z {{ totalPages }}
        </span>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-button"
        >
          Następna &raquo;
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.questions-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 120px);
  background-color: #f9f9f9;
}

.header-section {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}

.header-section h1 {
  font-size: 28px;
  margin-bottom: 5px;
  color: #333;
  position: relative;
  display: inline-block;
}

.header-decoration {
  width: 80px;
  height: 3px;
  background-color: #eb5757;
  margin: 0 auto 10px;
  border-radius: 2px;
}

.subtitle {
  color: #666;
  margin-bottom: 15px;
  font-size: 14px;
}

.content-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

.top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters-section {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  min-width: 200px;
  transition: border-color 0.2s;
}

.filter-select:focus {
  border-color: #eb5757;
  outline: none;
}

.ask-button {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.ask-button:hover {
  background-color: #d64545;
}

.question-form {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.question-form h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: #eb5757;
  outline: none;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #d64545;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #eb5757;
  background-color: #fff3f3;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid #ffcdd2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.retry-button {
  background: none;
  border: 1px solid #eb5757;
  color: #eb5757;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #fff3f3;
}

.empty-state {
  text-align: center;
  padding: 30px 0;
  color: #666;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.question-item {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;
}

.question-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.question-header {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.question-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.course-badge {
  display: inline-flex;
  align-items: center;
  margin-top: 5px;
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.question-content {
  padding: 12px 15px;
  color: #555;
  line-height: 1.4;
}

.question-item.new {
  animation: highlightNewQuestion 2s ease-out;
  position: relative;
  border-left: 4px solid #eb5757;
}

@keyframes highlightNewQuestion {
  0% {
    background-color: rgba(235, 87, 87, 0.2);
    transform: translateY(-5px);
  }
  30% {
    background-color: rgba(235, 87, 87, 0.15);
    transform: translateY(0);
  }
  100% {
    background-color: rgba(255, 240, 240, 0.5);
  }
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 15px;
}

.pagination-button {
  background-color: #eb5757;
  border: none;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  font-weight: 500;
}

.pagination-button:hover:not(:disabled) {
  background-color: #d64545;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.pagination-button:disabled {
  background-color: #f0a0a0;
  color: #fff;
  cursor: not-allowed;
  opacity: 0.7;
}

.page-info {
  font-size: 14px;
  color: #666;
}

.question-footer {
  padding: 10px 15px;
  background: #f8f9fa;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 12px;
  color: #666;
}

.author,
.date,
.answers-count {
  display: flex;
  align-items: center;
}

@media (max-width: 600px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select,
  .ask-button {
    width: 100%;
  }

  .question-footer {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
