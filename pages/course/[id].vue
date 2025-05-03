<script setup>
import { useTestStore } from "~/stores/testStore";

definePageMeta({
  layout: "login",
  middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const courseId = route.params.id;

const course = ref(null);
const chapters = ref([]);
const courseTests = ref([]);
const isLoading = ref(true);
const error = ref(null);
const chapterTestsStatus = ref({});
const testStore = useTestStore();

const allChapterTestsPassed = computed(() => {
  if (Object.keys(chapterTestsStatus.value).length === 0) return false;

  for (const chapterId in chapterTestsStatus.value) {
    if (!chapterTestsStatus.value[chapterId]) {
      return false;
    }
  }
  return true;
});

defineExpose({
  updateChapterStatus(chapterId, isPassed) {
    chapterTestsStatus.value[chapterId] = isPassed;
  },
});

watch(
  () => testStore.recentlyPassedTests,
  async (newTests) => {
    if (newTests.length > 0) {
      const recentPasses = [...newTests].sort(
        (a, b) => b.timestamp - a.timestamp
      );

      for (const passedTest of recentPasses) {
        if (passedTest.chapterId) {
          chapterTestsStatus.value[passedTest.chapterId] = true;
        }
      }
    }
  },
  { deep: true }
);

onMounted(async () => {
  try {
    isLoading.value = true;

    const courseResponse = await useApiFrontend(`/courses/${courseId}`);
    course.value = courseResponse;

    const chaptersResponse = await useApiFrontend(
      `/courses/${courseId}/chapters`
    );
    chapters.value = chaptersResponse || [];

    const courseTestsResponse = await useApiFrontend(
      `tests/courses/${courseId}/tests`
    );
    if (courseTestsResponse && courseTestsResponse.tests) {
      courseTests.value = courseTestsResponse.tests;
    }

    await checkChapterTestsStatus();
  } catch (err) {
    console.error("Błąd podczas ładowania danych kursu:", err);
    error.value = "Błąd pobierania danych kursu";
  } finally {
    isLoading.value = false;
  }
});

const checkChapterTestsStatus = async () => {
  try {
    for (const chapter of chapters.value) {
      const testsResponse = await useApiFrontend(
        `chapterTest/${courseId}/chapters/${chapter.id}/tests`
      );

      if (testsResponse?.tests?.length > 0) {
        let chapterPassed = false;

        for (const test of testsResponse.tests) {
          const attemptsResponse = await useApiFrontend(
            `userTest/${test.id}/attempts`
          );

          if (attemptsResponse && attemptsResponse.attempts) {
            const passedAttempt = attemptsResponse.attempts.find(
              (a) => a.passed
            );
            if (passedAttempt) {
              chapterPassed = true;
              break;
            }
          }
        }

        chapterTestsStatus.value[chapter.id] = chapterPassed;
      } else {
        chapterTestsStatus.value[chapter.id] = true;
      }
    }
  } catch (err) {
    console.error("Błąd podczas sprawdzania statusu testów:", err);
  }
};

const goToTest = (testId) => {
  router.push(`/course/${courseId}/test/${testId}`);
};

const goToChapter = (chapterId) => {
  router.push(`/course/${courseId}/chapter/${chapterId}`);
};
</script>

<template>
  <UserNavbar />
  <div class="course-management">
    <div class="sidebar">
      <h3 class="sidebar-title">{{ course?.title || "Kurs" }}</h3>
      <div
        v-if="isLoading"
        class="sidebar-loading"
      >
        <div class="loading-spinner sidebar-spinner"></div>
        <p>Ładowanie...</p>
      </div>
      <div
        v-else-if="error"
        class="sidebar-error"
      >
        <p>{{ error }}</p>
      </div>
      <nav
        v-else
        class="sidebar-nav"
      >
        <!-- Sekcja rozdziałów -->
        <div class="sidebar-section">
          <h4 class="sidebar-section-title">Rozdziały</h4>
          <div
            v-if="chapters.length === 0"
            class="empty-chapters"
          >
            Brak rozdziałów w kursie.
          </div>
          <NuxtLink
            v-for="chapter in chapters"
            :key="chapter.id"
            :to="`/course/${courseId}/chapter/${chapter.id}`"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-text">{{ chapter.title }}</span>
            <span
              v-if="chapterTestsStatus[chapter.id]"
              class="chapter-badge passed"
              title="Test zaliczony"
              >✓</span
            >
          </NuxtLink>
        </div>

        <!-- Sekcja testów kursu -->
        <div
          v-if="courseTests.length > 0"
          class="sidebar-section"
        >
          <h4 class="sidebar-section-title">Test końcowy</h4>
          <div
            v-for="test in courseTests"
            :key="test.id"
            class="test-nav-item"
            :class="{ disabled: !allChapterTestsPassed }"
          >
            <button
              @click="allChapterTestsPassed ? goToTest(test.id) : null"
              :disabled="!allChapterTestsPassed"
              class="test-button"
            >
              {{ test.title }}
            </button>
            <div
              v-if="!allChapterTestsPassed"
              class="test-locked-info"
            >
              Zalicz testy rozdziałowe, aby odblokować test końcowy
            </div>
          </div>
        </div>
      </nav>
    </div>

    <div class="content-area">
      <div
        v-if="isLoading"
        class="loading-wrapper"
      >
        <div class="loading-spinner"></div>
        <p>Ładowanie kursu...</p>
      </div>
      <div
        v-else-if="error"
        class="error-box"
      >
        <p>{{ error }}</p>
      </div>
      <div
        v-else
        class="course-content"
      >
        <div class="course-header">
          <h1 class="course-title">{{ course?.title }}</h1>
        </div>
        <p
          class="instruction"
          v-if="!$route.params.chapterId && !$route.params.testId"
        >
          Wybierz rozdział z menu po lewej stronie, by rozpocząć naukę.
        </p>
        <NuxtPage />
      </div>
    </div>
  </div>
  <foter></foter>
</template>

<style scoped>
.course-management {
  display: flex;
  height: calc(100vh - 64px);
  background-color: #f8f9fa;
}

.sidebar {
  width: 280px;
  background-color: white;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  padding: 20px;
  margin: 0;
  color: #343a40;
  font-size: 18px;
  border-bottom: 1px solid #e9ecef;
  background-color: #eb5757;
  color: white;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 15px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  text-decoration: none;
  color: #495057;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: #f1f3f5;
  color: #212529;
}

.nav-item.active {
  background-color: #f8f9fa;
  color: #eb5757;
  font-weight: 500;
  border-left: 3px solid #eb5757;
}

.content-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.loading-wrapper,
.sidebar-loading {
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

.sidebar-spinner {
  width: 24px;
  height: 24px;
}

.sidebar-error,
.sidebar-loading {
  padding: 20px;
  text-align: center;
  font-size: 14px;
  color: #6c757d;
}

.empty-chapters {
  padding: 20px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.error-box {
  background-color: #fef2f2;
  padding: 20px;
  border-radius: 8px;
  color: #eb5757;
}

.course-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.course-header {
  background-color: #eb5757;
  color: white;
  padding: 30px;
}

.course-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.instruction {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-left: 4px solid #eb5757;
  border-radius: 4px;
}

.sidebar-section {
  margin-bottom: 20px;
}

.sidebar-section-title {
  padding: 10px 20px;
  margin: 0;
  font-size: 14px;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
}

.test-nav-item {
  padding: 0 20px;
  margin: 10px 0;
}

.test-button {
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #eb5757;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
}

.test-button:hover:not(:disabled) {
  background-color: #d63030;
}

.test-button:disabled {
  background-color: #e0e0e0;
  color: #999;
  cursor: not-allowed;
}

.test-locked-info {
  font-size: 12px;
  color: #dc3545;
  margin-top: 5px;
  padding: 0 5px;
}

.chapter-badge {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  margin-left: auto;
}

.chapter-badge.passed {
  background-color: #28a745;
  color: white;
}

.test-nav-item.disabled {
  opacity: 0.7;
}

@media (max-width: 768px) {
  .course-management {
    flex-direction: column;
    height: auto;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }
}
</style>
