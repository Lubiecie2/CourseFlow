<script setup>
definePageMeta({
  layout: "login",
  middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const courseId = route.params.id;

const course = ref(null);
const chapters = ref([]);
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    isLoading.value = true;

    const courseResponse = await useApiFrontend(`/courses/${courseId}`);
    course.value = courseResponse;

    const chaptersResponse = await useApiFrontend(
      `/courses/${courseId}/chapters`
    );
    chapters.value = chaptersResponse || [];
  } catch (err) {
    console.error("Błąd podczas ładowania rozdział kursu:", err);
    error.value = "Błąd pobierania danych kursu";
  } finally {
    isLoading.value = false;
  }
});

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
        </NuxtLink>
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
          v-if="!$route.params.chapterId"
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
