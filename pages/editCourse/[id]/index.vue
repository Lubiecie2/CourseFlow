<script setup>
const route = useRoute();
const courseId = route.params.id;
</script>

<template>
  <div class="edit-card">
    <h1 class="page-title">Wizytówka kursu</h1>
    <div class="card-form-container">
      <CourseEditForm
        :isEditing="true"
        :courseId="courseId"
      />
    </div>
  </div>
</template>

<style scoped>
.edit-card {
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
}

.card-form-container {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
}
</style>
