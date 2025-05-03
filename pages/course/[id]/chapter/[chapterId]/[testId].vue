<script setup>
definePageMeta({
  layout: "login",
  middleware: "auth",
});

import { ref, onMounted, computed, onBeforeUnmount } from "vue";

const route = useRoute();
const router = useRouter();
const courseId = route.params.id;
const chapterId = route.params.chapterId;
const testId = route.params.testId;
const isLoading = ref(true);
const error = ref(null);
const currentTest = ref(null);
const userAnswers = ref({});
const textInputAnswers = ref({});
const testResults = ref(null);
const showResults = ref(false);
const isSubmitting = ref(false);
const hasAttempted = ref(false);
const timeLeft = ref(0);
const timerInterval = ref(null);
const matchingAnswers = ref({});

onMounted(async () => {
  await checkPreviousAttempt();
  await loadTest();
});

const checkPreviousAttempt = async () => {
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
          if (answer.text_answer) {
            textInputAnswers.value[answer.block_id] = answer.text_answer;
          } else {
            userAnswers.value[answer.block_id] = answer.selected_answer_id;
          }
        });
      }
    }
  } catch (err) {
    console.error("Błąd podczas sprawdzania historii testu:", err);
  }
};

const loadTest = async () => {
  try {
    isLoading.value = true;
    const response = await useApiFrontend(`userTest/${testId}`);
    if (response && response.test) {
      const questionsResponse = await useApiFrontend(
        `userTest/${testId}/blocks`
      );
      if (questionsResponse && questionsResponse.blocks) {
        currentTest.value = {
          ...response.test,
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
            } else {
              userAnswers.value[question.id] = null;
            }
          });
        }
      }
      startTimer();
    }
  } catch (err) {
    console.error("Błąd podczas ładowania testu:", err);
    error.value = "Nie udało się załadować testu";
  } finally {
    isLoading.value = false;
  }
};

const selectAnswer = (question, answerId) => {
  if (hasAttempted.value) return;
  if (question.block_type === "multiple_choice") {
    if (!Array.isArray(userAnswers.value[question.id])) {
      userAnswers.value[question.id] = [];
    }
    const index = userAnswers.value[question.id].indexOf(answerId);
    if (index === -1) {
      userAnswers.value[question.id].push(answerId);
    } else {
      userAnswers.value[question.id].splice(index, 1);
    }
  } else if (question.block_type !== "text_input") {
    userAnswers.value[question.id] = answerId;
  }
};

const handleTextInputChange = (questionId, value) => {
  if (hasAttempted.value) return;
  textInputAnswers.value[questionId] = value;
};

const submitTest = async () => {
  try {
    isSubmitting.value = true;
    const answers = { ...userAnswers.value };
    Object.keys(textInputAnswers.value).forEach((questionId) => {
      answers[questionId] = textInputAnswers.value[questionId];
    });
    Object.keys(matchingAnswers.value).forEach((questionId) => {
      answers[questionId] = matchingAnswers.value[questionId];
    });

    const response = await useApiFrontend(`userTest/${testId}/submit`, {
      method: "POST",
      body: {
        answers: answers,
      },
    });

    if (response) {
      const totalPoints = response.totalPoints || response.totalQuestions || 1;
      const percentage = Math.round((response.score / totalPoints) * 100);
      testResults.value = {
        score: response.score,
        totalPoints: totalPoints,
        passed: response.passed,
        correctAnswers: response.correctAnswers,
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
      } else {
        userAnswers.value[question.id] = null;
      }
    });
    startTimer();
  }
};

const backToChapter = () => {
  router.push(`/course/${courseId}/chapter/${chapterId}`);
};

const isFormValid = computed(() => {
  if (!currentTest.value?.questions) return false;
  return currentTest.value.questions.every((q) => {
    if (q.block_type === "multiple_choice") {
      return (
        Array.isArray(userAnswers.value[q.id]) &&
        userAnswers.value[q.id].length > 0
      );
    } else if (q.block_type === "text_input") {
      return textInputAnswers.value[q.id]?.trim() !== "";
    } else if (q.block_type === "matching") {
      const matches = matchingAnswers.value[q.id] || {};
      return (
        Object.keys(matches).length === q.answers.length &&
        Object.values(matches).every(
          (item) => item !== undefined && item !== ""
        )
      );
    }
    return userAnswers.value[q.id] != null;
  });
});

const isAnswerSelected = (question, answerId) => {
  if (question.block_type === "multiple_choice") {
    return (
      Array.isArray(userAnswers.value[question.id]) &&
      userAnswers.value[question.id].includes(answerId)
    );
  }
  return userAnswers.value[question.id] === answerId;
};

const formattedTimeLeft = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
});

const startTimer = () => {
  if (hasAttempted.value || !currentTest.value?.time_limit) return;
  timeLeft.value = currentTest.value.time_limit * 60;
  timerInterval.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      clearInterval(timerInterval.value);
      if (!hasAttempted.value) {
        handleTimeUp();
      }
    }
  }, 1000);
};

const handleTimeUp = async () => {
  await submitTest();
};

onBeforeUnmount(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
});

const updateMatching = (questionId, leftId, rightItem) => {
  if (hasAttempted.value) return;
  if (!matchingAnswers.value[questionId]) {
    matchingAnswers.value[questionId] = {};
  }
  matchingAnswers.value[questionId][leftId] = rightItem;
};
</script>

<template>
  <div class="test-page-container">
    <div
      v-if="isLoading"
      class="loading-wrapper"
    >
      <div class="loading-spinner"></div>
      <p>Ładowanie...</p>
    </div>
    <div
      v-else-if="error"
      class="error-box"
    >
      <p>{{ error }}</p>
      <button
        @click="backToChapter"
        class="back-button"
      >
        Powrót do rozdziału
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
        class="timer-container"
        v-if="currentTest.time_limit && !showResults"
      >
        <div
          class="timer"
          :class="{ 'time-low': timeLeft < 60 }"
        >
          <i class="timer-icon">⏱</i>
          <span class="timer-text">{{ formattedTimeLeft }}</span>
        </div>
      </div>
      <div
        v-if="!showResults"
        v-for="(question, qIndex) in currentTest.questions"
        :key="question.id"
        class="question-card"
      >
        <h3 class="question-number">
          Pytanie {{ qIndex + 1 }}/{{ currentTest.questions.length }}
        </h3>
        <div class="question-text">{{ question.question_text }}</div>
        <div class="points-info">Punkty: {{ question.points || 1 }}</div>

        <div
          v-if="
            question.block_type !== 'text_input' &&
            question.block_type !== 'matching'
          "
          class="answers-list"
        >
          <div
            v-for="answer in question.answers"
            :key="answer.id"
            class="answer-option"
            :class="{
              selected: isAnswerSelected(question, answer.id),
              disabled: hasAttempted,
            }"
            @click="selectAnswer(question, answer.id)"
          >
            <div
              class="answer-checkbox"
              :class="{
                checked: isAnswerSelected(question, answer.id),
                'checkbox-multiple': question.block_type === 'multiple_choice',
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
              <span class="answer-letter"
                >{{ ["A", "B", "C", "D"][answer.sort_order - 1] }}.</span
              >
              <span class="answer-text">{{ answer.text }}</span>
            </div>
          </div>
        </div>

        <div
          v-else-if="question.block_type === 'text_input'"
          class="text-input-container"
        >
          <input
            type="text"
            v-model="textInputAnswers[question.id]"
            class="text-answer-input"
            placeholder="Wpisz odpowiedź..."
            :disabled="hasAttempted"
            @input="handleTextInputChange(question.id, $event.target.value)"
          />
        </div>

        <div
          v-else-if="question.block_type === 'matching'"
          class="matching-question-container"
        >
          <div class="matching-items">
            <div class="matching-left-column">
              <div
                v-for="answer in question.answers"
                :key="answer.id"
                class="matching-left-item"
              >
                <span class="matching-item-text">{{ answer.left_item }}</span>
                <span class="matching-arrow">→</span>
              </div>
            </div>

            <div class="matching-right-column">
              <div
                v-for="answer in question.answers"
                :key="answer.id"
                class="matching-right-item"
              >
                <select
                  v-model="matchingAnswers[question.id][answer.id]"
                  class="matching-select"
                  :disabled="hasAttempted"
                >
                  <option value="">Wybierz...</option>
                  <option
                    v-for="rightOption in question.answers"
                    :key="rightOption.id"
                    :value="rightOption.right_item"
                    :disabled="
                      Object.values(
                        matchingAnswers[question.id] || {}
                      ).includes(rightOption.right_item) &&
                      matchingAnswers[question.id][answer.id] !==
                        rightOption.right_item
                    "
                  >
                    {{ rightOption.right_item }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="test-actions"
        v-if="!hasAttempted && !showResults"
      >
        <button
          @click="backToChapter"
          class="cancel-button"
        >
          Anuluj test
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
              <span class="result-label">Wynik:</span>
              <span class="result-value"
                >{{ testResults.score }} /
                {{ testResults.totalPoints }} punktów</span
              >
            </div>
            <div class="result-item">
              <span class="result-label">Procent:</span>
              <span class="result-value">{{ testResults.percentage }}%</span>
            </div>
            <div class="result-item">
              <span class="result-label">Próg zaliczenia:</span>
              <span class="result-value">{{ testResults.testThreshold }}%</span>
            </div>
          </div>
        </div>
        <div class="results-actions">
          <button
            @click="backToChapter"
            class="back-button"
          >
            Wróć do rozdziału
          </button>
          <button
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
}

.loading-wrapper {
  text-align: center;
  padding: 30px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 4px solid rgba(235, 87, 87, 0.2);
  border-top-color: #eb5757;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.test-status-badge.passed {
  background-color: #d4edda;
  color: #155724;
}

.error-box {
  background-color: #fef2f2;
  padding: 20px;
  border-radius: 8px;
  color: #eb5757;
}

.test-container {
  max-width: 800px;
  margin: 0 auto;
}

.test-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 10px;
}

.test-description {
  color: #6c757d;
  margin-bottom: 20px;
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

.answer-content {
  flex: 1;
}

.answer-letter {
  font-weight: 600;
  margin-right: 10px;
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
  font-weight: 500;
  height: 45px;
  margin-top: 0;
  min-width: 150px;
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
  height: 45px;
  margin-top: 0px;
  max-width: 150px;
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
  background-color: #eb5757;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  margin-bottom: 80px;
  margin-top: 80px;
}

.back-button:hover {
  background-color: #d63031;
}

.retry-button {
  background-color: #4a90e2;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  margin-bottom: 80px;
  margin-top: 80px;
}

.retry-button:hover {
  background-color: #3a7bd5;
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
}

.answer-checkbox.chebox-multiple {
  border-radius: 4px;
}

.checkbox-inner.checkbox-multiple-inner {
  border-radius: 2px;
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
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-weight: 600;
  min-width: 90px;
}

.timer.time-low {
  background-color: #ffecec;
  color: #dc3545;
  animation: pulse 1s infinite;
}

.timer-icon {
  margin-right: 6px;
  font-style: normal;
}

.timer-text {
  font-size: 16px;
  letter-spacing: 0.5px;
  width: 40px;
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
</style>
