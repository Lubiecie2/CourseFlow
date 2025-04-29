<script setup>
import draggable from "vuedraggable";

definePageMeta({
  layout: "login",
  middleware: "auth",
});

// ------ Parametry ----------------------------------------

const route = useRoute();
const router = useRouter();
const courseId = route.params.id;
const testId = route.params.testId;

// ------ Zmienne --------------------------------------------

const testForm = ref({
  title: "",
  description: "",
  pass_threshold: 70,
  time_limit: 0,
  chapter_id: "",
});

const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const chapters = ref([]);
const questions = ref([]);

const showQuestionForm = ref(false);
const isSavingQuestion = ref(false);

const newQuestion = ref({
  block_type: "single_choice",
  question_text: "",
  points: 1,
  answers: [
    { text: "", is_correct: true },
    { text: "", is_correct: false },
    { text: "", is_correct: false },
    { text: "", is_correct: false },
  ],
});

// ------ Pobieranie danych po załadowaniu strony -------------------------------

onMounted(async () => {
  await fetchChapters();
  await fetchTestDetails();
  await fetchQuestions();
});

// ------ Pobieranie danych testu  -------------------------------------------

// ****** Pobieranie listy rozdziałów w danym kursie ******
const fetchChapters = async () => {
  try {
    const response = await useApiFrontend(`courses/${courseId}/chapters`);
    chapters.value = response || [];
  } catch (err) {
    console.error("Błąd podczas pobierania rozdziałów:", err);
    errorMessage.value = "Nie udało się załadować rozdziałów kursu.";
  }
};

// ****** Pobieranie danych testu i wypełnienie formularza ******
const fetchTestDetails = async () => {
  try {
    isLoading.value = true;
    const response = await useApiFrontend(`tests/${testId}`);
    if (response && response.test) {
      const test = response.test;
      testForm.value = {
        title: test.title || "",
        description: test.description || "",
        pass_threshold: test.pass_threshold || 70,
        time_limit: test.time_limit || 0,
        chapter_id: test.chapter_id || "",
      };
    }
  } catch (err) {
    console.error("Błąd podczas pobierania szczegółów testu:", err);
    errorMessage.value = "Nie udało się załadować szczegółów testu.";
  } finally {
    isLoading.value = false;
  }
};

// ****** Pobieranie bloków z pytaniami  ******
const fetchQuestions = async () => {
  try {
    const response = await useApiFrontend(`tests/${testId}/blocks`);
    if (response && response.blocks) {
      questions.value = response.blocks;
    }
  } catch (err) {
    console.error("Błąd podczas pobierania pytań:", err);
  }
};

// ------ Zapisywanie danych testu z formularza -----------------------------------------

const updateTest = async () => {
  if (!validateForm()) return;

  try {
    isSaving.value = true;
    const response = await useApiFrontend(`tests/${testId}`, {
      method: "PATCH",
      body: {
        title: testForm.value.title,
        description: testForm.value.description,
        pass_threshold: parseInt(testForm.value.pass_threshold),
        time_limit: parseInt(testForm.value.time_limit),
        chapter_id: parseInt(testForm.value.chapter_id),
      },
    });

    if (response.success) {
      successMessage.value = "Test został pomyślnie zaktualizowany";
      setTimeout(() => {
        successMessage.value = "";
      }, 7000);
    }
  } catch (err) {
    console.error("Błąd podczas aktualizacji testu:", err);
    errorMessage.value = "Nie udało się zaktualizować testu.";
  } finally {
    isSaving.value = false;
  }
};

//  ------ Walidacja formularza do edytowania testu --------------------------------

const validateForm = () => {
  if (!testForm.value.title.trim()) {
    errorMessage.value = "Tytuł testu jest wymagany";
    return false;
  }

  if (!testForm.value.chapter_id) {
    errorMessage.value = "Wybierz rozdział dla testu";
    return false;
  }

  if (
    testForm.value.pass_threshold < 1 ||
    testForm.value.pass_threshold > 100
  ) {
    errorMessage.value = "Próg zaliczenia musi być liczbą od 1 do 100";
    return false;
  }

  if (testForm.value.time_limit < 0) {
    errorMessage.value = "Limit czasu nie może być ujemny";
    return false;
  }

  errorMessage.value = "";
  return true;
};

// ------ Ustawianie poprawnej odpowiedzi --------------------------

const setCorrectAnswer = (index) => {
  newQuestion.value.answers.forEach((answer, i) => {
    answer.is_correct = i === index;
  });
};

// ------ Anulowanie formularza z dodawaniem nowego pytania -------------

const cancelQuestion = () => {
  showQuestionForm.value = false;
  newQuestion.value = {
    block_type: "single_choice",
    question_text: "",
    points: 1,
    answers: [
      { text: "", is_correct: true },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ],
  };
};

// ------ Obsługa zmiany typu pytania --------------------------

const handleQuestionTypeChange = () => {
  newQuestion.value.answers = newQuestion.value.answers.map((answer) => {
    return { ...answer, is_correct: false };
  });

  if (newQuestion.value.block_type === "single_choice") {
    newQuestion.value.answers[0].is_correct = true;
  }
};

// ------ Przełączanie poprawnych odpowiedzi (dla wielokrotnego wyboru) ---------

const toggleCorrectAnswer = (index) => {
  newQuestion.value.answers[index].is_correct =
    !newQuestion.value.answers[index].is_correct;
};

// ------ Zapisywanie nowego pytania ---------------------------------

const saveQuestion = async () => {
  if (!newQuestion.value.question_text.trim()) {
    errorMessage.value = "Treść pytania jest wymagana";
    return;
  }

  if (newQuestion.value.answers.some((a) => !a.text.trim())) {
    errorMessage.value = "Wszystkie odpowiedzi muszą mieć treść";
    return;
  }

  if (!newQuestion.value.answers.some((a) => a.is_correct)) {
    errorMessage.value = "Wybierz przynajmniej jedną poprawną odpowiedź";
    return;
  }

  if (newQuestion.value.block_type === "single_choice") {
    const correctCount = newQuestion.value.answers.filter(
      (a) => a.is_correct
    ).length;
    if (correctCount !== 1) {
      errorMessage.value =
        "W pytaniu jednokrotnego wyboru musi być dokładnie jedna poprawna odpowiedź";
      return;
    }
  }

  try {
    isSavingQuestion.value = true;
    const response = await useApiFrontend(`tests/${testId}/blocks`, {
      method: "POST",
      body: newQuestion.value,
    });

    if (response && response.success) {
      await fetchQuestions();
      cancelQuestion();
      successMessage.value = "Pytanie zostało dodane";
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    }
  } catch (err) {
    console.error("Błąd podczas zapisywania pytania:", err);
    errorMessage.value = "Wystąpił błąd podczas dodawania pytania";
  } finally {
    isSavingQuestion.value = false;
  }
};

// ------ Usuwanie danego bloku z pytaniem ----------------------

const deleteQuestion = async (blockId) => {
  if (!confirm("Czy na pewno chcesz usunąć to pytanie?")) return;

  try {
    const response = await useApiFrontend(`blocks/${blockId}`, {
      method: "DELETE",
    });

    if (response && response.success) {
      await fetchQuestions();
      successMessage.value = "Pytanie zostało usunięte";
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    }
  } catch (err) {
    console.error("Błąd podczas usuwania pytania:", err);
    errorMessage.value = "Nie udało się usunąć pytania";
  }
};

// ------ Zapisywanie zmienionej kolejności pytań ----------------------

const saveQuestionsOrder = async () => {
  try {
    const order = questions.value.map((q) => q.id);

    const response = await useApiFrontend(`tests/${testId}/reorder`, {
      method: "PATCH",
      body: { order },
    });

    if (response && response.success) {
      successMessage.value = "Kolejność pytań została zaktualizowana";
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    }
  } catch (err) {
    console.error("Błąd podczas zapisywania kolejności pytań:", err);
    errorMessage.value = "Nie udało się zaktualizować kolejności pytań";
  }
};
</script>

<template>
  <div class="test-edit-page">
    <h1 class="page-title">Edycja testu</h1>

    <div
      v-if="errorMessage"
      class="error-message"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="successMessage"
      class="success-message"
    >
      {{ successMessage }}
    </div>
    <div class="test-form">
      <div class="form-group">
        <label for="chapter">Rozdział:</label>
        <select
          id="chapter"
          v-model="testForm.chapter_id"
          class="form-control"
        >
          <option value="">Wybierz rozdział</option>
          <option
            v-for="chapter in chapters"
            :key="chapter.id"
            :value="chapter.id"
          >
            {{ chapter.title }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="title">Tytuł testu:</label>
        <input
          id="title"
          v-model="testForm.title"
          type="text"
          class="form-control"
          placeholder="Wprowadź tytuł testu"
        />
      </div>

      <div class="form-group">
        <label for="description">Opis testu:</label>
        <textarea
          id="description"
          v-model="testForm.description"
          class="form-control"
          placeholder="Wprowadź opis testu (opcjonalnie)"
          rows="3"
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="pass_threshold">Próg zaliczenia (%):</label>
          <input
            id="pass_threshold"
            v-model="testForm.pass_threshold"
            type="number"
            class="form-control"
            min="1"
            max="100"
          />
        </div>

        <div class="form-group">
          <label for="time_limit">Limit czasu (min, 0 = bez limitu):</label>
          <input
            id="time_limit"
            v-model="testForm.time_limit"
            type="number"
            class="form-control"
            min="0"
          />
        </div>
      </div>

      <div class="form-actions">
        <button
          @click="updateTest"
          class="red-button"
          :disabled="isSaving"
        >
          {{ isSaving ? "Zapisywanie..." : "Zapisz zmiany" }}
        </button>
      </div>
    </div>

    <!-- -------------------------- SEKCJA Z FORMUALRZEM DO PYTAŃ ----------------------------------------------- -->

    <div class="questions-section">
      <h2 class="section-title">Pytania</h2>

      <draggable
        v-if="questions.length > 0"
        v-model="questions"
        class="questions-list"
        item-key="id"
        handle=".drag-handle"
        @end="saveQuestionsOrder"
        :animation="200"
        ghost-class="ghost-item"
      >
        <template #item="{ element: question, index }">
          <div class="question-item">
            <div class="question-header">
              <div class="drag-handle">
                <div class="grip-lines"></div>
              </div>
              <h3>Pytanie {{ index + 1 }}</h3>
              <button
                @click="deleteQuestion(question.id)"
                class="delete-btn"
              >
                Usuń
              </button>
            </div>
            <p class="question-content">{{ question.question_text }}</p>
            <div class="answers-container">
              <div
                v-for="(answer, i) in question.answers"
                :key="i"
                class="answer-row"
                :class="{ correct: answer.is_correct }"
              >
                <span class="answer-letter">{{ ["A", "B", "C", "D"][i] }}</span>
                <span>{{ answer.text }}</span>
                <span
                  v-if="answer.is_correct"
                  class="correct-mark"
                  >(poprawna)</span
                >
              </div>
            </div>
          </div>
        </template>
      </draggable>
      <div
        v-if="showQuestionForm"
        class="question-form"
      >
        <h3>Nowe pytanie</h3>

        <div class="form-group">
          <label>Typ pytania:</label>
          <select
            v-model="newQuestion.block_type"
            class="form-control"
            @change="handleQuestionTypeChange"
          >
            <option value="single_choice">Jednokrotny wybór (ABCD)</option>
            <option value="multiple_choice">Wielokrotny wybór (ABCD)</option>
          </select>
        </div>

        <div class="form-group">
          <label for="question-text">Treść pytania:</label>
          <textarea
            id="question-text"
            v-model="newQuestion.question_text"
            class="form-control"
            rows="2"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="question-points">Punkty:</label>
          <input
            id="question-points"
            v-model="newQuestion.points"
            type="number"
            min="1"
            class="form-control"
            style="width: 100px"
          />
        </div>

        <div class="form-group">
          <label>
            Odpowiedzi
            <template v-if="newQuestion.block_type === 'single_choice'"
              >(wybierz jedną poprawną):</template
            >
            <template v-else-if="newQuestion.block_type === 'multiple_choice'"
              >(zaznacz wszystkie poprawne):</template
            >
            <template v-else>(wybierz odpowiedź):</template>
          </label>
          <div
            v-for="(answer, index) in newQuestion.answers"
            :key="index"
            class="answer-input-row"
          >
            <input
              v-if="newQuestion.block_type === 'single_choice'"
              type="radio"
              name="correct-answer"
              :checked="answer.is_correct"
              @change="setCorrectAnswer(index)"
            />
            <input
              v-else-if="newQuestion.block_type === 'multiple_choice'"
              type="checkbox"
              :checked="answer.is_correct"
              @change="toggleCorrectAnswer(index)"
            />
            <input
              v-else
              type="checkbox"
              :checked="answer.is_correct"
              @change="toggleCorrectAnswer(index)"
            />
            <span class="answer-label">{{ ["A", "B", "C", "D"][index] }}</span>
            <input
              type="text"
              v-model="answer.text"
              class="form-control"
              :placeholder="`Odpowiedź ${['A', 'B', 'C', 'D'][index]}`"
            />
          </div>
        </div>

        <div class="form-actions">
          <button
            @click="cancelQuestion"
            class="cancel-btn"
          >
            Anuluj
          </button>
          <button
            @click="saveQuestion"
            class="red-button"
            :disabled="isSavingQuestion"
          >
            {{ isSavingQuestion ? "Zapisywanie..." : "Dodaj pytanie" }}
          </button>
        </div>
      </div>

      <button
        v-if="!showQuestionForm"
        @click="showQuestionForm = true"
        class="add-question-btn"
      >
        + Dodaj nowe pytanie
      </button>
    </div>
  </div>
</template>

<style scoped>
.test-edit-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 28px;
  margin-bottom: 24px;
  color: #333;
}

.error-message,
.success-message {
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  position: relative;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  border-left: 4px solid #2e7d32;
}

.test-form {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-form h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.red-button {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.red-button:hover {
  background-color: #d64545;
}

.red-button:disabled {
  background-color: #f3a5a5;
  cursor: not-allowed;
}

.section-title {
  font-size: 22px;
  margin: 30px 0 15px;
  color: #333;
}

.questions-section {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-text {
  color: #666;
  text-align: center;
  padding: 20px;
}
.questions-list {
  margin-bottom: 20px;
}

.question-item {
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.question-content {
  font-weight: 500;
  margin-bottom: 10px;
}

.answers-container {
  margin-left: 20px;
  margin-bottom: 15px;
}

.answer-row {
  padding: 5px 0;
}

.answer-letter {
  font-weight: bold;
  margin-right: 10px;
}

.correct {
  color: #2e7d32;
}

.correct-mark {
  color: #2e7d32;
  margin-left: 10px;
}

.question-form {
  background-color: #f9f9f9;
  padding: 20px;
  margin-top: 20px;
  border-radius: 4px;
}

.answer-input-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
}

.answer-input-row input[type="radio"] {
  width: auto;
  margin-right: 5px;
  flex-shrink: 0;
}

.answer-label {
  margin: 0 10px 0 0;
  font-weight: bold;
  flex-shrink: 0;
  min-width: 20px;
}

.answer-input-row .form-control {
  flex-grow: 1;
  width: auto;
}

.add-question-btn {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 10px 16px;
  width: 100%;
  border-radius: 4px;
  margin-top: 20px;
  cursor: pointer;
  font-weight: 500;
}

.delete-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}
.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.question-header h3 {
  margin: 0;
  font-size: 18px;
}

.question-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}
.answer-input-row input[type="checkbox"] {
  width: auto;
  margin-right: 5px;
  flex-shrink: 0;
  height: 16px;
  width: 16px;
  cursor: pointer;
  accent-color: #eb5757;
}
.answer-input-row input[type="checkbox"] {
  width: auto;
  margin-right: 5px;
  flex-shrink: 0;
  height: 16px;
  width: 16px;
  cursor: pointer;
  accent-color: #eb5757;
}
.drag-handle {
  cursor: grab;
  margin-right: 10px;
  color: #999;
  display: flex;
  align-items: center;
}

.drag-handle i {
  font-size: 14px;
}

.ghost-item {
  opacity: 0.5;
  background: #f3f3f3;
  border: 1px dashed #ccc;
}

.question-header {
  display: flex;
  align-items: center;
}
.drag-handle {
  cursor: grab;
  margin-right: 10px;
  color: #999;
  font-size: 18px;
  user-select: none;
}
.drag-handle {
  cursor: grab;
  margin-right: 15px;
  display: flex;
  align-items: center;
  padding: 4px;
}

.drag-handle:active {
  cursor: grabbing;
}

.grip-lines {
  width: 16px;
  height: 16px;
  background-image: linear-gradient(to bottom, #999 2px, transparent 2px);
  background-size: 100% 4px;
  background-repeat: repeat-y;
}
</style>
