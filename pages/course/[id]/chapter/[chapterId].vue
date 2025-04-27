<script setup>
definePageMeta({
  layout: "login",
  middleware: "auth",
});

import { ref, onMounted } from "vue";
import {
  NodeHeading,
  NodeParagraph,
  NodeList,
  NodeImage,
  NodeVideo,
} from "#components";

const route = useRoute();
const router = useRouter();
const courseId = route.params.id;
const chapterId = route.params.chapterId;
const chapter = ref(null);
const content = ref([]);
const isLoading = ref(true);
const error = ref(null);

const tests = ref([]);
const testsLoading = ref(false);
const testsError = ref(null);

const getComponent = (type) => {
  switch (type) {
    case "text":
      return NodeParagraph;
    case "heading":
      return NodeHeading;
    case "list":
      return NodeList;
    case "image":
      return NodeImage;
    case "video":
      return NodeVideo;
    default:
      return NodeParagraph;
  }
};

onMounted(async () => {
  try {
    isLoading.value = true;
    const { data, error: apiError } = await useApiServer(
      `courses/${courseId}/chapters/${chapterId}`,
      { method: "GET" }
    );
    if (apiError.value) {
      throw new Error(
        apiError.value.message || "Nie udało się załadować rozdziału"
      );
    }
    chapter.value = data.value.chapter;
    content.value = chapter.value.blocks || [];

    content.value = content.value.map((item) => {
      if (item.type === "list" && item.params) {
        if (typeof item.params.items === "string") {
          let splitItems = item.params.items.split(",");
          if (splitItems.length === 1) {
            splitItems = item.params.items.split(".");
          }
          if (splitItems.length === 1) {
            splitItems = item.params.items.split("\n");
          }
          item.params.items = splitItems
            .map((s) => s.trim())
            .filter((s) => s !== "");
          if (item.params.items.length === 0) {
            item.params.items = [item.params.items];
          }
        }
        if (!Array.isArray(item.params.items)) {
          item.params.items = [];
        }
        if (!item.params.type) {
          item.params.type = "unordered";
        }
      }
      if (typeof item.params?.format === "string") {
        item.params.format = item.params.format.split(",");
      }

      return item;
    });
    await fetchTests();
  } catch (err) {
    console.error("Błąd podczas ładowania rozdziału:", err);
    error.value = "Nie udało się załadować treści rozdziału";
  } finally {
    isLoading.value = false;
  }
});

const fetchTests = async () => {
  try {
    testsLoading.value = true;
    testsError.value = null;

    const response = await useApiFrontend(
      `chapterTest/${courseId}/chapters/${chapterId}/tests`
    );

    if (response && response.tests) {
      tests.value = response.tests;
    } else {
      tests.value = [];
    }
  } catch (err) {
    console.error("Błąd podczas pobierania testów:", err);
    testsError.value = "Nie udało się załadować testów dla tego rozdziału";
  } finally {
    testsLoading.value = false;
  }
};

const startTest = (testId) => {
  router.push(`/course/${courseId}/chapter/${chapterId}/${testId}`);
};

const goBackToCourse = () => {
  router.push(`/course/${courseId}`);
};
</script>

<template>
  <div class="chapter-container">
    <div
      v-if="isLoading"
      class="loading-wrapper"
    >
      <div class="loading-spinner"></div>
      <p>Ładowanie rozdziału...</p>
    </div>
    <div
      v-else-if="error"
      class="error-box"
    >
      <p>{{ error }}</p>
      <button
        @click="goBackToCourse"
        class="back-button"
      >
        Powrót do kursu
      </button>
    </div>
    <div v-else-if="!$route.params.testId">
      <div class="main-content">
        <h1 class="chapter-title">{{ chapter?.title }}</h1>
        <div
          v-if="chapter && content.length > 0"
          class="chapter-content"
        >
          <div
            v-for="block in content"
            :key="block.id"
            class="content-block"
          >
            <component
              :is="getComponent(block.type)"
              v-bind="block.params"
              :class="block.params.format"
            />
          </div>
        </div>
        <div
          v-else
          class="empty-content"
        >
          <p>Ten rozdział nie ma jeszcze treści.</p>
        </div>

        <div class="tests-section">
          <h2>Testy do rozdziału</h2>
          <div
            v-if="testsLoading"
            class="tests-loading"
          >
            <div class="loading-spinner"></div>
            <p>Ładowanie testów...</p>
          </div>
          <div
            v-else-if="testsError"
            class="tests-error"
          >
            <p>{{ testsError }}</p>
          </div>
          <div
            v-else-if="tests.length === 0"
            class="no-tests"
          >
            <p>Brak dostępnych testów dla tego rozdziału.</p>
          </div>
          <div
            v-else
            class="tests-list"
          >
            <div
              v-for="test in tests"
              :key="test.id"
              class="test-card"
            >
              <h3>{{ test.title }}</h3>
              <p
                v-if="test.description"
                class="test-description"
              >
                {{ test.description }}
              </p>
              <div class="test-info">
                <div class="info-item">
                  <span class="info-label">Próg zaliczenia:</span>
                  <span class="info-value">{{ test.pass_threshold }}%</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Czas:</span>
                  <span class="info-value">{{
                    test.time_limit ? `${test.time_limit} min` : "Bez limitu"
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Liczba pytań:</span>
                  <span class="info-value">{{
                    test._count?.test_blocks || 0
                  }}</span>
                </div>
              </div>
              <button
                @click="startTest(test.id)"
                class="start-test-btn"
              >
                Rozpocznij test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="chapter-actions">
        <button
          @click="goBackToCourse"
          class="back-button"
        >
          Powrót do kursu
        </button>
      </div>
    </div>
    <NuxtPage />
  </div>
</template>

<style scoped>
.chapter-container {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chapter-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
}

.chapter-content {
  font-size: 16px;
  line-height: 1.6;
  color: #343a40;
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

.error-box {
  background-color: #fef2f2;
  padding: 20px;
  border-radius: 8px;
  color: #eb5757;
}

.empty-content {
  padding: 20px;
  background-color: #f8f9fa;
  border-left: 4px solid #eb5757;
  border-radius: 4px;
  color: #6c757d;
  margin: 20px 0;
}

.chapter-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-start;
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
}

.back-button:hover {
  background-color: #d63031;
}

.font-bold {
  font-weight: bold;
}

.italic {
  font-style: italic;
}

.underline {
  text-decoration: underline;
}

.text-xs {
  font-size: 0.75rem;
}

.text-sm {
  font-size: 1rem;
}

.text-base {
  font-size: 1.125rem;
}

.text-lg {
  font-size: 1.25rem;
}

.text-xl {
  font-size: 1.5rem;
}

.text-2xl {
  font-size: 2rem;
}

.text-red {
  color: #dc3545;
}

.text-blue {
  color: #0066cc;
}

.text-green {
  color: #28a745;
}

.text-orange {
  color: #fd7e14;
}

.text-purple {
  color: #6f42c1;
}

.text-teal {
  color: #20c997;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}
.image-sm {
  max-width: 25%;
}

.image-md {
  max-width: 50%;
}

.image-lg {
  max-width: 75%;
}

.image-full {
  width: 100%;
}

.video-sm {
  max-width: 25%;
}

.video-md {
  max-width: 50%;
}

.video-lg {
  max-width: 75%;
}

.video-full {
  width: 100%;
}

.image-container.text-center,
.video-container.text-center {
  margin-left: auto;
  margin-right: auto;
  display: block;
}

.image-container.text-right,
.video-container.text-right {
  margin-left: auto;
  margin-right: 0;
  display: block;
}

.tests-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.tests-section h2 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
}

.tests-loading {
  text-align: center;
  padding: 20px 0;
}

.tests-error {
  background-color: #fef2f2;
  padding: 15px;
  border-radius: 4px;
  color: #eb5757;
  margin-bottom: 20px;
}

.no-tests {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #6c757d;
}

.tests-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.test-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.test-card h3 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 10px;
  color: #343a40;
}

.test-description {
  color: #6c757d;
  margin-bottom: 15px;
  font-size: 14px;
}

.test-info {
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
}

.info-label {
  color: #6c757d;
}

.info-value {
  font-weight: 600;
  color: #343a40;
}

.start-test-btn {
  background-color: #eb5757;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-top: auto;
  transition: background-color 0.2s;
}

.start-test-btn:hover {
  background-color: #d63031;
}

@media (max-width: 768px) {
  .tests-list {
    grid-template-columns: 1fr;
  }
}
</style>
