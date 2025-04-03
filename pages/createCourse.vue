<script setup>
import CourseCardFrom from "~/components/courseCardFrom.vue";

definePageMeta({
  middleware: ["auth", "admin-auth"],
  layout: "login",
});

const handleCourseCreated = (courseData) => {
  const courseId = courseData.id || (courseData.course && courseData.course.id);

  if (courseId) {
    navigateTo(`/editCourse/${courseId}`);
  } else {
    console.error("Nie można uzyskać ID kursu z odpowiedzi API");
    alert("Wystąpił błąd podczas przekierowania do edycji kursu");
  }
};
</script>

<template>
  <AdminNavbar />

  <div class="course-creation">
    <!-- Nagłówek strony -->
    <header class="page-header">
      <div class="container">
        <h1>Nowy kurs</h1>
        <p>Stwórz wizytówkę kursu, aby rozpocząć proces tworzenia</p>
      </div>
    </header>

    <!-- Główna zawartość -->
    <main class="content-wrapper">
      <div class="container">
        <div class="form-container">
          <div class="form-header">
            <h2>Wizytówka kursu</h2>
            <p>
              Te informacje będą widoczne dla uczestników przed zapisaniem się
              na kurs
            </p>
          </div>

          <div class="tips">
            <div class="tip">
              <div class="tip-icon">📝</div>
              <div class="tip-text">
                <strong>Krótki, konkretny tytuł</strong> zwiększa
                zainteresowanie kursem
              </div>
            </div>
            <div class="tip">
              <div class="tip-icon">📊</div>
              <div class="tip-text">
                <strong>Dobry opis</strong> powinien jasno komunikować czego
                nauczy się uczestnik
              </div>
            </div>
            <div class="tip">
              <div class="tip-icon">🖼️</div>
              <div class="tip-text">
                <strong>Wysokiej jakości zdjęcie</strong> przyciąga uwagę i
                buduje profesjonalizm
              </div>
            </div>
          </div>

          <div class="form-body">
            <CourseCardFrom @submit="handleCourseCreated" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.course-creation {
  min-height: calc(100vh - 64px);
  background-color: #ffffff;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  text-align: center;
  padding: 56px 0 36px;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 12px;
  letter-spacing: -0.025em;
}

.page-header p {
  font-size: 1.125rem;
  color: #6e6e73;
}

.content-wrapper {
  padding-bottom: 60px;
}

.form-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 40px;
  margin-bottom: 30px;
}

.form-header {
  margin-bottom: 32px;
  text-align: center;
}

.form-header h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 10px;
}

.form-header p {
  color: #6e6e73;
  font-size: 1.05rem;
}

.tips {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.tip {
  display: flex;
  align-items: flex-start;
}

.tip-icon {
  font-size: 1.25rem;
  margin-right: 12px;
  padding-top: 2px;
}

.tip-text {
  font-size: 0.9375rem;
  color: #424245;
  line-height: 1.5;
}

.form-body {
  padding-top: 10px;
}
@media (max-width: 768px) {
  .page-header {
    padding: 40px 0 30px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .form-container {
    padding: 30px 20px;
    border-radius: 12px;
  }

  .tips {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
