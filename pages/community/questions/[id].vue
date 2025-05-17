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
const userStore = useUserStore();
const userId = computed(() => userStore?.user?.id);
const isAdmin = computed(() => userStore?.user?.role_id === 1);
const showConfirmDeleteAnswer = ref(null);
const editingAnswer = ref(null);
const editedAnswerContent = ref("");

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

  $socket.on("question-updated", (updatedQuestion) => {
    console.log("Otrzymano aktualizację pytania:", updatedQuestion);
    if (question.value && question.value.id === parseInt(updatedQuestion.id)) {
      question.value = { ...question.value, ...updatedQuestion };
    }
  });

  $socket.on("question-removed", (removedQuestionId) => {
    console.log("Otrzymano informację o usunięciu pytania:", removedQuestionId);
    if (question.value && question.value.id === parseInt(removedQuestionId)) {
      navigateTo("/community/questions");
    }
  });

  $socket.on("answer-updated", (updatedAnswer) => {
    console.log("Otrzymano aktualizację odpowiedzi:", updatedAnswer);
    const index = answers.value.findIndex((a) => a.id === updatedAnswer.id);
    if (index !== -1) {
      answers.value[index] = { ...answers.value[index], ...updatedAnswer };
    }
  });

  $socket.on("answer-removed", (removedAnswerId) => {
    console.log(
      "Otrzymano informację o usunięciu odpowiedzi:",
      removedAnswerId
    );
    answers.value = answers.value.filter((a) => a.id !== removedAnswerId);
    totalAnswers.value--;
    if (answers.value.length === 0 && currentPage.value > 1) {
      goToPage(currentPage.value - 1);
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

// ------ Usuwanie odpowiedzi -----------------------------------

const confirmDeleteAnswer = (answerId) => {
  showConfirmDeleteAnswer.value = answerId;
};

const deleteAnswer = async (answerId) => {
  try {
    const response = await useApiFrontend(`answers/${answerId}`, {
      method: "DELETE",
    });

    if (response && response.success) {
      if ($socket && $socket.connected) {
        $socket.emit("answer-deleted", {
          answerId: answerId,
          questionId: questionId,
        });
      }
    }
  } catch (err) {
    console.error("Błąd podczas usuwania odpowiedzi:", err);
  } finally {
    showConfirmDeleteAnswer.value = null;
  }
};

// ------ Edycja odpowiedzi ------------------------------------

const startEditAnswer = (answer) => {
  editingAnswer.value = answer.id;
  editedAnswerContent.value = answer.content;
};

const cancelEditAnswer = () => {
  editingAnswer.value = null;
};

const saveEditedAnswer = async (answerId) => {
  try {
    if (!editedAnswerContent.value) return;

    const response = await useApiFrontend(`answers/${answerId}`, {
      method: "PATCH",
      body: {
        content: editedAnswerContent.value,
      },
    });

    if (response && response.success) {
      const index = answers.value.findIndex((a) => a.id === answerId);
      if (index !== -1) {
        answers.value[index].content = editedAnswerContent.value;
      }

      if ($socket && $socket.connected) {
        $socket.emit("answer-edited", {
          id: answerId,
          question_id: questionId,
          content: editedAnswerContent.value,
          updated_at: new Date(),
        });
      }

      editingAnswer.value = null;
    }
  } catch (err) {
    console.error("Błąd podczas edycji odpowiedzi:", err);
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

// ------ Sprawdzanie czy użytkownik może edytować/usuwać -------------

const canManageQuestion = computed(() => {
  return userId.value === question.value?.user_id || isAdmin.value;
});

const canManageAnswer = (answer) => {
  return userId.value === answer.user_id || isAdmin.value;
};

onBeforeUnmount(() => {
  if ($socket.connected) {
    $socket.emit("leave-question", questionId);
    $socket.off("new-answer");
    $socket.off("question-updated");
    $socket.off("question-removed");
    $socket.off("answer-updated");
    $socket.off("answer-removed");
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
          <div class="title-and-badge">
            <h2 class="question-title-detail">{{ question.title }}</h2>
            <div
              v-if="question.courses"
              class="course-badge"
            >
              {{ question.courses.title }}
            </div>
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
                :class="{
                  new: answer.isNew,
                  'user-answer': userId === answer.user_id,
                }"
              >
                <div class="answer-header">
                  <div class="answer-metadata">
                    <span class="author">
                      <strong>Autor:</strong> {{ answer.user?.first_name }}
                      {{ answer.user?.last_name }}
                    </span>
                    <span class="date">
                      <strong>Data:</strong> {{ formatDate(answer.created_at) }}
                    </span>
                  </div>
                  <div
                    v-if="canManageAnswer(answer)"
                    class="manage-answer-buttons"
                  >
                    <button
                      @click="startEditAnswer(answer)"
                      class="edit-button small"
                      v-if="userId === answer.user_id"
                      title="Edytuj"
                    >
                      <i class="icon-edit">✏️</i>
                    </button>
                    <button
                      @click="confirmDeleteAnswer(answer.id)"
                      class="delete-button small"
                      title="Usuń"
                    >
                      <i class="icon-delete">🗑️</i>
                    </button>
                  </div>
                </div>

                <div
                  v-if="editingAnswer === answer.id"
                  class="edit-answer-form"
                >
                  <textarea
                    v-model="editedAnswerContent"
                    class="form-control"
                    rows="3"
                  ></textarea>
                  <div class="form-actions">
                    <button
                      @click="cancelEditAnswer"
                      class="cancel-button small"
                    >
                      Anuluj
                    </button>
                    <button
                      @click="saveEditedAnswer(answer.id)"
                      class="submit-button small"
                      :disabled="!editedAnswerContent"
                    >
                      Zapisz
                    </button>
                  </div>
                </div>
                <div
                  v-else
                  class="answer-content"
                >
                  {{ answer.content }}
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

    <div
      v-if="showConfirmDeleteAnswer"
      class="confirm-delete-dialog"
    >
      <div class="dialog-content">
        <h3>Potwierdź usunięcie</h3>
        <p>Czy na pewno chcesz usunąć tę odpowiedź?</p>
        <div class="dialog-actions">
          <button
            @click="showConfirmDeleteAnswer = null"
            class="cancel-button"
          >
            Anuluj
          </button>
          <button
            @click="deleteAnswer(showConfirmDeleteAnswer)"
            class="delete-dialog-button"
          >
            Usuń
          </button>
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
  margin-bottom: 30px;
  position: relative;
}

.header-section h1 {
  font-size: 32px;
  margin-bottom: 8px;
  color: #333;
  position: relative;
  display: inline-block;
  font-weight: 700;
}

.header-decoration {
  width: 100px;
  height: 4px;
  background-color: #eb5757;
  margin: 0 auto 15px;
  border-radius: 2px;
}

.content-container {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
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
  margin-bottom: 50px;
}

.question-header-detail {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-and-badge {
  flex: 1;
}

.question-title-detail {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  word-break: break-word;
  color: #2c3e50;
  line-height: 1.3;
}

.answer-item.new {
  animation: highlightNewAnswer 5s ease-out;
  position: relative;
  border-left: 4px solid #eb5757;
}

@keyframes highlightNewAnswer {
  0% {
    background-color: rgba(235, 87, 87, 0.2);
  }
  100% {
    background-color: transparent;
  }
}

.course-badge {
  display: inline-block;
  margin-top: 10px;
  background: #eb5757;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(235, 87, 87, 0.2);
}

.question-content-detail {
  padding: 30px 25px;
  color: #333;
  line-height: 1.8;
  white-space: pre-line;
  background-color: #fefefe;
  border-left: 5px solid #eb5757;
  font-size: 16px;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 20px 0;
  border-radius: 0 8px 8px 0;
  font-weight: 400;
}

.question-footer {
  padding: 15px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 14px;
  color: #666;
  border-radius: 0 0 8px 8px;
}

.author,
.date {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.answers-section {
  margin-top: 50px;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 22px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eb5757;
  color: #2c3e50;
  font-weight: 700;
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
  gap: 20px;
  margin-bottom: 25px;
}

.answer-item {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.answer-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.07);
}

.user-answer {
  border-left: 4px solid #eb5757;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
}

.answer-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 13px;
  color: #666;
}

.answer-content {
  padding: 20px;
  color: #333;
  line-height: 1.7;
  white-space: pre-line;
  background-color: white;
  font-size: 15px;
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
  margin-right: 5px;
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
  margin-top: 35px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.form-title {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
  font-weight: 700;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 15px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-size: 15px;
}

.form-textarea:focus {
  outline: none;
  border-color: #eb5757;
  box-shadow: 0 0 0 3px rgba(235, 87, 87, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.submit-button {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  font-size: 14px;
}

.submit-button:hover:not(:disabled) {
  background-color: #d64545;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.manage-question-buttons,
.manage-answer-buttons {
  display: flex;
  gap: 8px;
}

.delete-dialog-button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  background-color: #e74c3c;
  color: white;
}

.delete-dialog-button:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

.icon-edit,
.icon-delete {
  font-style: normal;
  font-size: 16px;
}

.edit-button,
.delete-button {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-button {
  background-color: #4a90e2;
  color: white;
}

.edit-button:hover {
  background-color: #3a80d2;
  transform: translateY(-2px);
}

.delete-button {
  background-color: #e74c3c;
  color: white;
}

.delete-button:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

.small {
  font-size: 12px;
  padding: 5px 10px;
}

.cancel-button {
  background-color: #999;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 10px;
}

.cancel-button:hover {
  background-color: #777;
  transform: translateY(-2px);
}

.cancel-button.small {
  font-size: 12px;
  padding: 5px 10px;
}

.edit-answer-form {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
  margin: 0;
  border: none;
}

.edit-answer-form textarea {
  width: 100%;
  min-height: 100px;
  resize: vertical;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-family: inherit;
  margin-bottom: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.confirm-delete-dialog {
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

.dialog-content {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.dialog-content h3 {
  margin-top: 0;
  color: #333;
  font-size: 20px;
  margin-bottom: 15px;
}

.dialog-content p {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #555;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .question-header-detail {
    flex-direction: column;
    align-items: flex-start;
  }

  .manage-question-buttons {
    margin-top: 10px;
    align-self: flex-end;
  }

  .answer-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .answer-metadata,
  .manage-answer-buttons {
    width: 100%;
  }

  .manage-answer-buttons {
    margin-top: 10px;
    justify-content: flex-end;
  }

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
