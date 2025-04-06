<script setup>
const route = useRoute();
const courseId = route.params.id;

definePageMeta({
  middleware: ["auth", "admin-auth"],
  layout: "login",
});
</script>

<template>
  <AdminNavbar />
  <div class="course-management">
    <div class="sidebar">
      <h3 class="sidebar-title">Zarządzanie kursem</h3>

      <nav class="sidebar-nav">
        <NuxtLink
          :to="`/editCourse/${courseId}/`"
          class="nav-item"
          exact-active-class="active"
        >
          <span class="nav-text">Wizytówka kursu</span>
        </NuxtLink>

        <NuxtLink
          :to="`/editCourse/${courseId}/editChapter`"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-text">Sekcje kursu</span>
        </NuxtLink>

        <NuxtLink
          :to="`/editCourse/${courseId}/editTests`"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-text">Quizy i testy</span>
        </NuxtLink>

        <NuxtLink
          :to="`/editCourse/${courseId}/editSettings`"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-text">Ustawienia</span>
        </NuxtLink>
      </nav>
    </div>

    <div class="content-area">
      <NuxtPage />
    </div>
  </div>
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
  color: #dc3545;
  font-weight: 500;
}

.nav-icon {
  margin-right: 12px;
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.content-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
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
