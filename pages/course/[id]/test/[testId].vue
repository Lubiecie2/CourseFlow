<script setup>
// ------ Importy i Meta ---------------------------------------------------

import { useTestStore } from "~/stores/testStore";

definePageMeta({
  layout: "login",
  middleware: "auth",
});

// ------ Inicjalizacja routera i parametrów trasy -------------------------

const route = useRoute();
const router = useRouter();
const courseId = route.params.id;
const testId = route.params.testId;
const testStore = useTestStore();

// ------ Zmienne ----------------------------------------------------------

const currentTest = ref(null);
const isLoading = ref(true);
const error = ref(null);
const userAnswers = ref({});
const textInputAnswers = ref({});
const matchingAnswers = ref({});
const isSubmitting = ref(false);
const hasAttempted = ref(false);
const showResults = ref(false);
const testResults = ref(null);
const timerInterval = ref(null);
const remainingTime = ref(null);

// ------ Walidacja formularza ---------------------------------------------

const isFormValid = computed(() => {
  if (!currentTest.value || !currentTest.value.questions) return false;

  return currentTest.value.questions.every((question) => {
    if (question.block_type === "multiple_choice") {
      return (
        Array.isArray(userAnswers.value[question.id]) &&
        userAnswers.value[question.id].length > 0
      );
    } else if (question.block_type === "text_input") {
      return textInputAnswers.value[question.id]?.trim() !== "";
    } else if (question.block_type === "matching") {
      const matches = matchingAnswers.value[question.id] || {};
      return (
        question.answers.leftItems &&
        Object.keys(matches).length === question.answers.leftItems.length &&
        Object.values(matches).every(
          (item) => item !== undefined && item !== ""
        )
      );
    }
    return userAnswers.value[question.id] != null;
  });
});

// ------ Ładowanie danych po odpaleniu strony -----------------------------

onMounted(async () => {
  await checkTestAttempts();
  await loadTest();
});

// ------ Czyszczenie Timera po opuszczeniu strony -------------------------

onBeforeUnmount(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
});

// ------ Sprawdzanie czy użytkownik rozwiązał test ------------------------

const checkTestAttempts = async () => {
  try {
    const response = await useApiFrontend(`userTest/${testId}/attempts`);

    if (response && response.attempts && response.attempts.length > 0) {
      hasAttempted.value = true;
      const lastAttempt = response.attempts[0];
      const maxScore = lastAttempt.max_score || 1;
      const percentage = Math.round((lastAttempt.score / maxScore) * 100);

      testResults.value = {
        score: lastAttempt.score,
        totalPoints: maxScore,
        passed: lastAttempt.passed,
        percentage: isFinite(percentage) ? percentage : 0,
        testThreshold: lastAttempt.tests?.pass_threshold || 70,
      };
      showResults.value = true;

      if (lastAttempt.user_test_answers) {
        lastAttempt.user_test_answers.forEach((answer) => {
          userAnswers.value[answer.block_id] = answer.selected_answer_id;
        });
      }
    }
  } catch (err) {
    console.error("Błąd podczas sprawdzania historii testu:", err);
  }
};

// ------ Ładowanie testu i pytań ----------------------------------------

const loadTest = async () => {
  try {
    isLoading.value = true;
    const response = await useApiFrontend(`userTest/${testId}`);

    if (response && response.test) {
      const questionsResponse = await useApiFrontend(
        `userTest/${testId}/blocks`
      );

      if (questionsResponse && questionsResponse.blocks) {
        const isFinal =
          response.test.is_course_final === true ||
          response.test.is_course_final === 1 ||
          response.test.is_course_final === "1" ||
          response.test.is_course_final === "true";

        currentTest.value = {
          ...response.test,
          is_course_final: isFinal,
          questions: questionsResponse.blocks,
        };

        if (!hasAttempted.value) {
          userAnswers.value = {};
          textInputAnswers.value = {};
          matchingAnswers.value = {};

          currentTest.value.questions.forEach((question) => {
            if (question.block_type === "multiple_choice") {
              userAnswers.value[question.id] = [];
            } else if (question.block_type === "text_input") {
              textInputAnswers.value[question.id] = "";
            } else if (question.block_type === "matching") {
              matchingAnswers.value[question.id] = {};
              if (question.answers && question.answers.leftItems) {
                question.answers.leftItems.forEach((item) => {
                  matchingAnswers.value[question.id][item.id] = "";
                });
              }
            } else {
              userAnswers.value[question.id] = null;
            }
          });

          startTimer();
        }
      }
    }
  } catch (err) {
    console.error("Błąd podczas ładowania testu:", err);
    error.value = "Nie udało się załadować testu";
  } finally {
    isLoading.value = false;
  }
};

// ------ Zaznaczanie odpowiedzi przez użytkownika ----------------------

const selectAnswer = (question, answerId) => {
  if (hasAttempted.value) return;

  if (question.block_type === "multiple_choice") {
    if (!userAnswers.value[question.id]) {
      userAnswers.value[question.id] = [];
    }

    const index = userAnswers.value[question.id].indexOf(answerId);
    if (index > -1) {
      userAnswers.value[question.id].splice(index, 1);
    } else {
      userAnswers.value[question.id].push(answerId);
    }
  } else if (
    question.block_type !== "text_input" &&
    question.block_type !== "matching"
  ) {
    userAnswers.value[question.id] = answerId;
  }
};

// ------ Obsługa inputów tekstowych ------------------------------------

const handleTextInput = (questionId, value) => {
  if (hasAttempted.value) return;
  textInputAnswers.value[questionId] = value;
};

// ------ Obsługa pytań matching ---------------------------------------

const updateMatching = (questionId, leftId, rightItem) => {
  if (hasAttempted.value) return;
  if (!matchingAnswers.value[questionId]) {
    matchingAnswers.value[questionId] = {};
  }
  matchingAnswers.value[questionId][leftId] = rightItem;
};

// ------ Sprawdzanie czy odpowiedz została zaznaczona --------------------

const isAnswerSelected = (questionId, answerId) => {
  if (!userAnswers.value[questionId]) return false;

  if (Array.isArray(userAnswers.value[questionId])) {
    return userAnswers.value[questionId].includes(answerId);
  }

  return userAnswers.value[questionId] === answerId;
};

// ------ Uruchamianie licznika czasu -------------------------------------

const startTimer = () => {
  if (
    !currentTest.value ||
    !currentTest.value.time_limit ||
    currentTest.value.time_limit <= 0
  ) {
    return;
  }

  const timeLimit = currentTest.value.time_limit * 60;
  remainingTime.value = timeLimit;

  timerInterval.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
    } else {
      clearInterval(timerInterval.value);
      submitTest();
    }
  }, 1000);
};

// ------ Formatowanie czasu -----------------------------------------------

const formatTime = (seconds) => {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// ------ Wysyłanie odpowiedzi i wyświetlanie wyników ----------------------

const submitTest = async () => {
  try {
    isSubmitting.value = true;
    const allAnswers = { ...userAnswers.value };
    for (const questionId in textInputAnswers.value) {
      allAnswers[questionId] = textInputAnswers.value[questionId];
    }
    for (const questionId in matchingAnswers.value) {
      allAnswers[questionId] = matchingAnswers.value[questionId];
    }

    const response = await useApiFrontend(`userTest/${testId}/submit`, {
      method: "POST",
      body: { answers: allAnswers },
    });

    if (response && response.passed) {
      testStore.markTestAsPassed(testId);

      if (currentTest.value.is_course_final) {
        await generateCertificate();
      }
    }

    if (response) {
      const totalPoints = response.totalPoints || response.totalQuestions || 1;
      const percentage = Math.round((response.score / totalPoints) * 100);

      testResults.value = {
        score: response.score,
        totalPoints,
        passed: response.passed,
        percentage: isFinite(percentage) ? percentage : 0,
        testThreshold:
          response.testThreshold || currentTest.value.pass_threshold,
      };

      showResults.value = true;
      hasAttempted.value = true;
    }

    if (timerInterval.value) {
      clearInterval(timerInterval.value);
    }
  } catch (err) {
    console.error("Błąd podczas przesyłania odpowiedzi:", err);
    error.value = "Wystąpił błąd podczas przesyłania odpowiedzi";
  } finally {
    isSubmitting.value = false;
  }
};

// ------ Generowanie certyfikatów ----------------------------------------

const generateCertificate = async () => {
  try {
    const generateResponse = await useApiFrontend(
      `/certificates/generate/${courseId}`,
      {
        method: "POST",
      }
    );

    if (generateResponse.success) {
      console.log("Certyfikat wygenerowany pomyślnie!");
      return true;
    } else {
      console.error("Błąd generowania certyfikatu:", generateResponse.message);
      return false;
    }
  } catch (err) {
    console.error("Błąd podczas generowania certyfikatu:", err);
    return false;
  }
};

const goToCertificates = () => {
  router.push("/profile/badges");
};

// ------ Resetowanie testu ---------------------------------------------

const resetTest = () => {
  showResults.value = false;
  hasAttempted.value = false;

  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }

  if (currentTest.value && currentTest.value.questions) {
    userAnswers.value = {};
    textInputAnswers.value = {};
    matchingAnswers.value = {};

    currentTest.value.questions.forEach((question) => {
      if (question.block_type === "multiple_choice") {
        userAnswers.value[question.id] = [];
      } else if (question.block_type === "text_input") {
        textInputAnswers.value[question.id] = "";
      } else if (question.block_type === "matching") {
        matchingAnswers.value[question.id] = {};
        if (question.answers && question.answers.leftItems) {
          question.answers.leftItems.forEach((item) => {
            matchingAnswers.value[question.id][item.id] = "";
          });
        }
      } else {
        userAnswers.value[question.id] = null;
      }
    });

    startTimer();
  } else {
    loadTest();
  }
};

// ------ Powrót do strony kursu ----------------------------------------

const backToCourse = () => {
  router.push(`/course/${courseId}`);
};
</script>

<template>
  <div class="test-page-container">
    <div
      v-if="isLoading"
      class="loading-wrapper"
    >
      <div class="loading-spinner"></div>
      <p>Ładowanie testu...</p>
    </div>

    <div
      v-else-if="error"
      class="error-box"
    >
      <p>{{ error }}</p>
      <button
        @click="backToCourse"
        class="back-button"
      >
        Powrót do kursu
      </button>
    </div>

    <div
      v-else-if="currentTest"
      class="test-container"
    >
      <h1 class="test-title">{{ currentTest.title }}</h1>
      <p
        v-if="currentTest.description"
        class="test-description"
      >
        {{ currentTest.description }}
      </p>

      <div
        v-if="currentTest.time_limit && !showResults"
        class="timer-container"
      >
        <div
          class="timer"
          :class="{ 'time-low': remainingTime < 60 }"
        >
          <span class="timer-icon">⏱️</span>
          <span class="timer-text">{{ formatTime(remainingTime) }}</span>
        </div>
      </div>

      <div
        v-if="!showResults"
        class="questions-container"
      >
        <div
          v-for="(question, index) in currentTest.questions"
          :key="question.id"
          class="question-card"
        >
          <h2 class="question-number">Pytanie {{ index + 1 }}</h2>
          <p class="question-text">{{ question.question_text }}</p>
          <p class="points-info">Punkty: {{ question.points }}</p>

          <div
            v-if="question.block_type === 'text_input'"
            class="text-input-container"
          >
            <input
              type="text"
              v-model="textInputAnswers[question.id]"
              class="text-answer-input"
              placeholder="Wpisz odpowiedź..."
              :disabled="hasAttempted"
            />
          </div>
          <div
            v-else-if="question.block_type === 'matching'"
            class="matching-question-container"
          >
            <div class="matching-items">
              <div class="matching-left-column">
                <div
                  v-for="leftItem in question.answers.leftItems"
                  :key="leftItem.id"
                  class="matching-left-item"
                >
                  <span class="matching-item-text">{{
                    leftItem.left_item
                  }}</span>
                  <span class="matching-arrow">→</span>
                </div>
              </div>

              <div class="matching-right-column">
                <div
                  v-for="leftItem in question.answers.leftItems"
                  :key="leftItem.id"
                  class="matching-right-item"
                >
                  <select
                    v-model="matchingAnswers[question.id][leftItem.id]"
                    class="matching-select"
                    :disabled="hasAttempted"
                    @change="
                      updateMatching(
                        question.id,
                        leftItem.id,
                        $event.target.value
                      )
                    "
                  >
                    <option value="">Wybierz...</option>
                    <option
                      v-for="(rightItem, index) in question.answers.rightItems"
                      :key="index"
                      :value="rightItem"
                      :disabled="
                        Object.values(
                          matchingAnswers[question.id] || {}
                        ).includes(rightItem) &&
                        matchingAnswers[question.id][leftItem.id] !== rightItem
                      "
                    >
                      {{ rightItem }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="answers-list"
          >
            <div
              v-for="answer in question.answers"
              :key="answer.id"
              class="answer-option"
              :class="{
                selected: isAnswerSelected(question.id, answer.id),
                disabled: hasAttempted,
              }"
              @click="selectAnswer(question, answer.id)"
            >
              <div
                class="answer-checkbox"
                :class="{
                  checked: isAnswerSelected(question.id, answer.id),
                  'checkbox-multiple':
                    question.block_type === 'multiple_choice',
                }"
              >
                <div
                  class="checkbox-inner"
                  :class="{
                    'checkbox-multiple-inner':
                      question.block_type === 'multiple_choice',
                  }"
                ></div>
              </div>
              <div class="answer-content">
                <span class="answer-text">{{ answer.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!showResults"
        class="test-actions"
      >
        <button
          @click="backToCourse"
          class="cancel-button"
        >
          Anuluj
        </button>
        <button
          @click="submitTest"
          class="submit-button"
          :disabled="isSubmitting || !isFormValid"
        >
          {{ isSubmitting ? "Przetwarzanie..." : "Zakończ test" }}
        </button>
      </div>

      <div
        v-if="showResults"
        class="results-container"
      >
        <h2 class="results-title">Wyniki testu</h2>
        <div
          class="results-summary"
          :class="{ passed: testResults.passed, failed: !testResults.passed }"
        >
          <div class="result-status">
            <span
              v-if="testResults.passed"
              class="passed-badge"
              >ZALICZONO</span
            >
            <span
              v-else
              class="failed-badge"
              >NIEZALICZONO</span
            >
          </div>
          <div class="result-details">
            <div class="result-item">
              <span class="result-label">Zdobyte punkty:</span>
              <span class="result-value"
                >{{ testResults.score }} / {{ testResults.totalPoints }}</span
              >
            </div>
            <div class="result-item">
              <span class="result-label">Wynik procentowy:</span>
              <span class="result-value">{{ testResults.percentage }}%</span>
            </div>
            <div class="result-item">
              <span class="result-label">Wymagany próg:</span>
              <span class="result-value">{{ testResults.testThreshold }}%</span>
            </div>
          </div>
        </div>
        <div
          v-if="showResults && testResults && testResults.passed"
          class="certificate-section"
        >
          <div class="success-card">
            <div class="success-icon">🎓</div>
            <h3>Gratulacje! Ukończyłeś kurs!</h3>
            <p>
              Zdobyłeś wszystkie niezbędne umiejętności i pomyślnie ukończyłeś
              kurs.
            </p>
            <div class="certificate-buttons">
              <button
                @click="goToCertificates"
                class="view-certificates-btn"
              >
                Wszystkie certyfikaty
              </button>
            </div>
          </div>
        </div>
        <div class="results-actions">
          <button
            @click="backToCourse"
            class="back-button"
          >
            Powrót do kursu
          </button>
          <button
            v-if="!testResults.passed"
            @click="resetTest"
            class="retry-button"
          >
            Rozwiąż ponownie
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-page-container {
  min-height: calc(100vh - 120px);
  padding: 20px;
  background-color: white;
  border-radius: 8px;
}

.test-container {
  max-width: 800px;
  margin: 0 auto;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin-bottom: 15px;
  border: 4px solid rgba(235, 87, 87, 0.2);
  border-top-color: rgba(235, 87, 87, 0.85);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-box {
  background-color: #f8d7da;
  color: #721c24;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin: 30px auto;
  max-width: 600px;
}

.test-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #333;
}

.test-description {
  color: #6c757d;
  margin-bottom: 20px;
  font-size: 16px;
}

.timer-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}

.timer {
  display: inline-flex;
  align-items: center;
  background-color: #f8f9fa;
  padding: 8px 12px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

.timer.time-low {
  background-color: #ffecec;
  color: rgba(235, 87, 87, 0.85);
  animation: pulse 1s infinite;
}

.timer-icon {
  margin-right: 8px;
}

.timer-text {
  font-size: 16px;
  letter-spacing: 0.5px;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

.questions-container {
  margin-bottom: 30px;
}

.question-card {
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.question-number {
  font-size: 14px;
  font-weight: 600;
  color: #6c757d;
  margin-top: 0;
  margin-bottom: 15px;
}

.question-text {
  font-size: 18px;
  margin-bottom: 10px;
  font-weight: 500;
}

.points-info {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 20px;
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.answer-option {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.answer-option:hover:not(.disabled) {
  background-color: #f8f9fa;
}

.answer-option.selected {
  background-color: #f1f8ff;
  border-color: rgba(235, 87, 87, 0.85);
}

.answer-option.disabled {
  cursor: default;
  opacity: 0.8;
}

.answer-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #adb5bd;
  border-radius: 50%;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-checkbox.checked {
  border-color: rgba(235, 87, 87, 0.85);
  background-color: rgba(235, 87, 87, 0.85);
}

.answer-checkbox.checkbox-multiple {
  border-radius: 4px;
}

.checkbox-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: white;
  opacity: 0;
}

.answer-checkbox.checked .checkbox-inner {
  opacity: 1;
}

.checkbox-inner.checkbox-multiple-inner {
  border-radius: 2px;
}

.answer-content {
  flex: 1;
}

.answer-text {
  font-size: 15px;
}

.test-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  margin-bottom: 40px;
}

.cancel-button {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #ced4da;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background-color: #e9ecef;
}

.submit-button {
  background-color: #eb5757;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #d63031;
}

.submit-button:disabled {
  background-color: #f8a8a8;
  cursor: not-allowed;
}

.results-container {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px dashed #e9ecef;
}

.results-title {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
}

.results-summary {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.results-summary.passed {
  border: 2px solid #28a745;
}

.results-summary.failed {
  border: 2px solid #dc3545;
}

.result-status {
  margin-bottom: 25px;
  text-align: center;
}

.passed-badge,
.failed-badge {
  display: inline-block;
  padding: 10px 20px;
  font-size: 20px;
  font-weight: 700;
  border-radius: 30px;
}

.passed-badge {
  background-color: #d4edda;
  color: #155724;
}

.failed-badge {
  background-color: #f8d7da;
  color: #721c24;
}

.result-details {
  text-align: left;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.result-item:last-child {
  border-bottom: none;
}

.result-label {
  color: #6c757d;
  font-weight: 500;
}

.result-value {
  font-weight: 700;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 25px;
}

.back-button {
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  margin-top: 50px;
  margin-bottom: 50px;
}

.back-button:hover {
  background-color: #5a6268;
}

.retry-button {
  background-color: #eb5757;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #d63031;
}

@media (max-width: 768px) {
  .test-actions {
    flex-direction: column;
    gap: 10px;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }

  .results-actions {
    flex-direction: column;
  }

  .back-button,
  .retry-button {
    width: 100%;
  }
}
.certificate-section {
  margin-top: 30px;
  width: 100%;
}

.success-card {
  background-color: #f0f8ff;
  border-radius: 8px;
  padding: 25px;
  text-align: center;
  border-left: 5px solid #2ecc71;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.success-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.certificate-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.download-certificate-btn,
.view-certificates-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.download-certificate-btn {
  background-color: #eb5757;
  color: white;
}

.view-certificates-btn {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #d1d1d1;
}

.download-certificate-btn:hover {
  background-color: #d63030;
}

.view-certificates-btn:hover {
  background-color: #e9ecef;
}

.btn-icon {
  margin-right: 8px;
  font-size: 18px;
}

.text-input-container {
  margin-top: 10px;
}

.text-answer-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.text-answer-input:focus {
  outline: none;
  border-color: rgba(235, 87, 87, 0.85);
  box-shadow: 0 0 0 2px rgba(235, 87, 87, 0.85);
}

.text-answer-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.text-input-container {
  margin-top: 10px;
}

.text-answer-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.text-answer-input:focus {
  outline: none;
  border-color: rgba(235, 87, 87, 0.85);
  box-shadow: 0 0 0 2px rgba(235, 87, 87, 0.85);
}

.text-answer-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.matching-question-container {
  margin: 20px 0;
  padding: 10px;
}

.matching-items {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.matching-left-column,
.matching-right-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.matching-left-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 10px 15px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  min-height: 50px;
}

.matching-right-item {
  display: flex;
}

.matching-item-text {
  font-weight: 500;
}

.matching-arrow {
  color: #6c757d;
  margin: 0 10px;
}

.matching-select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  height: 100%;
  min-height: 50px;
}

.matching-select:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}
</style>
