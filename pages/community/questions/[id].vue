<script setup>
definePageMeta({
  middleware: "auth",
  layout: "login",
});

// ------ Zmienne -------------------------------------------------

const route = useRoute();
const questionId = route.params.id;
const question = ref(null);
const answers = ref([]);
const loading = ref(true);
const error = ref(null);
const newAnswer = ref({ content: "" });
const submitting = ref(false);
const totalAnswers = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);
const answersPerPage = 5;
const { $socket } = useNuxtApp();

// ------ Inicjalizacja WebSocketa -------------------------------

const initializeSocketConnection = () => {
  if (!$socket.connected) {
    $socket.connect();
  }

  $socket.emit("join-question", questionId);

  $socket.on("new-answer", (answer) => {
    if (!answers.value.some((a) => a.id === answer.id)) {
      answer.isNew = true;
      answers.value.unshift(answer);
      totalAnswers.value++;

      setTimeout(() => {
        const index = answers.value.findIndex((a) => a.id === answer.id);
        if (index !== -1) {
          answers.value[index].isNew = false;
        }
      }, 15000);

      if (Math.ceil(totalAnswers.value / answersPerPage) > totalPages.value) {
        totalPages.value++;
      }
    }
  });
};

// ------ Pobieranie pytania ---------------------------------------

const fetchQuestion = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await useApiFrontend(`questions/${questionId}`);

    if (response && response.success) {
      question.value = response.question;
      await fetchAnswers();
    } else {
      throw new Error("Nie udało się pobrać pytania");
    }
  } catch (err) {
    console.error("Błąd podczas pobierania pytania:", err);
    error.value = "Wystąpił problem podczas ładowania pytania.";
  } finally {
    loading.value = false;
  }
};

// ------ Pobieranie odpowiedzi ------------------------------------

const fetchAnswers = async (page = 1) => {
  try {
    const response = await useApiFrontend(
      `questions/${questionId}/answers?page=${page}&limit=${answersPerPage}`
    );

    if (response && response.success) {
      answers.value = response.answers || [];
      if (response.pagination) {
        totalPages.value = response.pagination.totalPages || 1;
        currentPage.value = page;
        totalAnswers.value = response.pagination.total || answers.value.length;
      }
    } else {
      throw new Error("Nie udało się pobrać odpowiedzi");
    }
  } catch (err) {
    console.error("Błąd podczas pobierania odpowiedzi:", err);
  }
};

// ------ Dodanie odpowiedzi do pytania -----------------------------

const addAnswer = async () => {
  if (!newAnswer.value.content) return;

  try {
    submitting.value = true;

    const response = await useApiFrontend(`questions/${questionId}/answers`, {
      method: "POST",
      body: {
        content: newAnswer.value.content,
      },
    });

    if (response && response.success) {
      newAnswer.value.content = "";
    }
  } catch (err) {
    console.error("Błąd podczas dodawania odpowiedzi:", err);
  } finally {
    submitting.value = false;
  }
};

// ------ Przechodzenie po stronach odpowiedzi ------------------------

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  fetchAnswers(page);
};

// ------ Powrót do listy pytań ---------------------------------------

const goBackToQuestions = () => {
  navigateTo("/community/questions");
};

// ------ Formatowanie daty -------------------------------------------

const formatDate = (date) => {
  return new Date(date).toLocaleString("pl");
};

onBeforeUnmount(() => {
  if ($socket.connected) {
    $socket.emit("leave-question", questionId);
    $socket.off("new-answer");
    $socket.disconnect();
  }
});

onMounted(async () => {
  await fetchQuestion();
  initializeSocketConnection();
});
</script>

<template>
  <MainNavbar />
  <div class="questions-page">
    <div class="header-section">
      <h1>Forum pytań i odpowiedzi</h1>
      <div class="header-decoration"></div>
    </div>
    <div class="content-container">
      <div class="back-link">
        <button
          @click="goBackToQuestions"
          class="back-button"
        >
          &larr; Powrót do listy pytań
        </button>
      </div>
      <div
        v-if="loading"
        class="loading-state"
      >
        <div class="spinner"></div>
        <p>Ładowanie...</p>
      </div>
      <div
        v-else-if="error"
        class="error-message"
      >
        {{ error }}
      </div>
      <div
        v-else-if="question"
        class="question-detail"
      >
        <div class="question-header-detail">
          <h2 class="question-title-detail">{{ question.title }}</h2>
          <div
            v-if="question.courses"
            class="course-badge"
          >
            {{ question.courses.title }}
          </div>
        </div>
        <div class="question-content-detail">
          {{ question.content }}
        </div>
        <div class="question-footer">
          <span class="author">
            Autor: {{ question.users?.first_name }}
            {{ question.users?.last_name }}
          </span>
          <span class="date">
            Data: {{ formatDate(question.created_at) }}
          </span>
        </div>
        <div class="answers-section">
          <h3 class="section-title">Odpowiedzi ({{ totalAnswers }})</h3>
          <div
            v-if="answers.length === 0"
            class="empty-state"
          >
            <p>
              To pytanie nie ma jeszcze odpowiedzi. Możesz dodać pierwszą
              odpowiedź!
            </p>
          </div>
          <div v-else>
            <div class="answers-list">
              <div
                v-for="answer in answers"
                :key="answer.id"
                class="answer-item"
                :class="{ new: answer.isNew }"
              >
                <div class="answer-content">
                  {{ answer.content }}
                </div>
                <div class="answer-footer">
                  <span class="author">
                    <strong>Autor:</strong> {{ answer.first_name }}
                    {{ answer.last_name }}
                  </span>
                  <span class="date">
                    <strong>Data:</strong> {{ formatDate(answer.created_at) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="pagination">
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
        <div class="answer-form">
          <h3 class="form-title">Twoja odpowiedź</h3>
          <textarea
            v-model="newAnswer.content"
            placeholder="Wpisz swoją odpowiedź..."
            rows="4"
            class="form-textarea"
          ></textarea>
          <div class="form-actions">
            <button
              @click="addAnswer"
              class="submit-button"
              :disabled="submitting || !newAnswer.content"
            >
              {{ submitting ? "Wysyłanie..." : "Dodaj odpowiedź" }}
            </button>
          </div>
        </div>
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

.content-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

.back-link {
  margin-bottom: 20px;
}

.back-button {
  background: none;
  border: none;
  color: #eb5757;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.back-button:hover {
  color: #d64545;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  color: #666;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #eb5757;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #eb5757;
  background-color: #fff3f3;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid #ffcdd2;
}

.question-detail {
  margin-bottom: 30px;
}

.question-header-detail {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.question-title-detail {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  word-break: break-word;
}

.answer-item.new {
  animation: highlightNewAnswer 5s ease-out;
  position: relative;
  border-left: 4px solid #eb5757;
  background-color: #eb5757;
}

.answer-item.new .answer-content {
  background-color: #fffafa;
}

.course-badge {
  display: inline-block;
  margin-top: 8px;
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.question-content-detail {
  padding: 25px 20px;
  color: #333;
  line-height: 1.6;
  white-space: pre-line;
  background-color: #fefefe;
  border-left: 4px solid #eb5757;
  font-size: 15px;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 15px 0;
  border-radius: 0 8px 8px 0;
  font-weight: 500;
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
  border-radius: 0 0 8px 8px;
}

.author,
.date {
  display: flex;
  align-items: center;
}

.answers-section {
  margin-top: 30px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.empty-state {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #666;
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.answer-item {
  background: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.answer-content {
  padding: 15px;
  color: #333;
  line-height: 1.5;
  white-space: pre-line;
  background-color: white;
}

.answer-footer {
  padding: 10px 15px;
  background: #f0f0f0;
  border-top: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 12px;
  color: #666;
}

.author strong,
.date strong {
  color: #444;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
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
.answer-form {
  margin-top: 30px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.form-title {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 10px;
}

.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #eb5757;
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

@media (max-width: 600px) {
  .question-footer,
  .answer-footer {
    flex-direction: column;
    gap: 5px;
  }

  .pagination {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
