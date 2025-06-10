<script setup>
definePageMeta({
  middleware: ["auth", "admin-auth"],
  layout: "login",
  pagePermissions: ["PANEL_CREATE_COURSES"],
});

const route = useRoute();
const courseId = route.params.id;

const chapters = ref([]);
const isLoading = ref(true);
const newChapter = ref({ title: "", description: "" });
const successMessage = ref("");
const errorMessage = ref("");
const showDeleteDialog = ref(false);
const chapterToDelete = ref(null);

const fetchChapters = async () => {
  isLoading.value = true;
  try {
    const { data, error } = await useApiServer(`/courses/${courseId}/chapters`);

    if (error.value) {
      console.error("Błąd pobierania rozdziałów:", error.value);
      errorMessage.value = "Nie udało się pobrać rozdziałów";
    } else {
      chapters.value = data.value || [];
    }
  } catch (err) {
    console.error("Błąd pobierania rozdziałów:", err);
    errorMessage.value = "Nie udało się pobrać rozdziałów";
  } finally {
    isLoading.value = false;
  }
};

const addChapter = async () => {
  if (!newChapter.value.title.trim()) {
    errorMessage.value = "Tytuł rozdziału jest wymagany";
    return;
  }

  try {
    const { data, error } = await useApiServer(
      `/courses/${courseId}/chapters`,
      {
        method: "POST",
        body: {
          title: newChapter.value.title,
          description: newChapter.value.description || "",
        },
      }
    );

    if (error.value) {
      errorMessage.value = "Wystąpił błąd podczas dodawania rozdziału";
      console.error("Błąd dodawania rozdziału:", error.value);
      return;
    }

    if (data.value) {
      await fetchChapters();

      newChapter.value = { title: "", description: "" };

      successMessage.value = "Rozdział został pomyślnie dodany";
      errorMessage.value = "";

      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    }
  } catch (err) {
    errorMessage.value = "Wystąpił błąd podczas dodawania rozdziału";
    console.error("Błąd dodawania rozdziału:", err);
  }
};
fetchChapters();
const confirmDeleteChapter = (chapter) => {
  chapterToDelete.value = chapter;
  showDeleteDialog.value = true;
};

const cancelDelete = () => {
  chapterToDelete.value = null;
  showDeleteDialog.value = false;
};

const deleteChapter = async () => {
  if (!chapterToDelete.value) return;

  try {
    const { data, error } = await useApiServer(
      `/courses/${courseId}/chapters/${chapterToDelete.value.id}`,
      {
        method: "DELETE",
      }
    );

    if (error.value) {
      errorMessage.value = "Wystąpił błąd podczas usuwania rozdziału";
      console.error("Błąd usuwania rozdziału:", error.value);
    } else {
      await fetchChapters();
      successMessage.value = "Rozdział został pomyślnie usunięty";

      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    }
  } catch (err) {
    errorMessage.value = "Wystąpił błąd podczas usuwania rozdziału";
    console.error("Błąd usuwania rozdziału:", err);
  } finally {
    cancelDelete();
  }
};
</script>

<template>
  <div class="chapters-container">
    <h1>Rozdziały kursu</h1>

    <div
      v-if="successMessage"
      class="success-message"
    >
      {{ successMessage }}
    </div>
    <div
      v-if="errorMessage"
      class="error-message"
    >
      {{ errorMessage }}
    </div>

    <div class="add-chapter-form">
      <h2>Dodaj nowy rozdział</h2>
      <div class="form-group">
        <label for="chapter-title">Tytuł rozdziału</label>
        <input
          id="chapter-title"
          v-model="newChapter.title"
          type="text"
          placeholder="Wprowadź tytuł rozdziału"
          class="form-control"
        />
      </div>

      <button
        class="btn-primary"
        @click="addChapter"
      >
        Dodaj rozdział
      </button>
    </div>

    <div
      class="chapters-list"
      v-if="!isLoading"
    >
      <h2>Lista rozdziałów</h2>

      <div
        v-if="chapters.length === 0"
        class="empty-list"
      >
        Ten kurs nie ma jeszcze żadnych rozdziałów.
      </div>

      <ul
        v-else
        class="chapters-items"
      >
        <li
          v-for="chapter in chapters"
          :key="chapter.id"
          class="chapter-item flex justify-between items-center"
        >
          <div class="chapter-title">{{ chapter.title }}</div>
          <div class="chapter-actions">
            <button
              @click.stop="confirmDeleteChapter(chapter)"
              class="btn-delete"
            >
              Usuń
            </button>
            <NuxtLink
              :to="{
                name: 'editCourse-id-editChapter-chapterId',
                params: { id: Number(courseId), chapterId: chapter.id },
              }"
              class="btn-edit"
            >
              Edytuj
            </NuxtLink>
          </div>
        </li>
      </ul>
    </div>

    <div
      v-if="isLoading"
      class="loading"
    >
      Ładowanie...
    </div>
  </div>
  <div
    v-if="showDeleteDialog"
    class="delete-dialog"
  >
    <div
      class="dialog-overlay"
      @click="cancelDelete"
    ></div>
    <div class="dialog-content">
      <p>Czy na pewno chcesz usunąć rozdział "{{ chapterToDelete?.title }}"?</p>
      <div class="button-container">
        <button
          @click="deleteChapter"
          class="confirm-delete-btn"
        >
          Potwierdź
        </button>
        <button
          @click="cancelDelete"
          class="cancel-delete-btn"
        >
          Anuluj
        </button>
      </div>
    </div>
  </div>
</template>

// ...existing code...
<style scoped>
.chapters-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

h2 {
  font-size: 18px;
  margin-bottom: 16px;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.add-chapter-form {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
}

textarea.form-control {
  resize: vertical;
}

.btn-primary {
  background-color: rgba(235, 87, 87, 0.85);
  color: white;
  border: none;
  padding: 10px 16px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: rgba(226, 78, 78, 0.85);
}

.chapters-list {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-list {
  color: #6c757d;
  text-align: center;
  padding: 20px 0;
}

.chapters-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chapter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
}

.chapter-item:last-child {
  border-bottom: none;
}

.chapter-title {
  font-weight: 600;
  font-size: 16px;
  flex: 1;
}

.chapter-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.btn-delete {
  color: #fff;
  background-color: rgba(235, 87, 87, 0.85);
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.btn-delete:hover {
  background-color: rgba(226, 78, 78, 0.85);
}

.btn-edit {
  display: inline-block;
  color: #fff;
  background-color: #007bff;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  white-space: nowrap;
  text-align: center;
}

.btn-edit:hover {
  background-color: #0069d9;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

.delete-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  position: relative;
  z-index: 1001;
  text-align: center;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.confirm-delete-btn {
  background-color: rgba(235, 87, 87, 0.85);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-delete-btn:hover {
  background-color: rgba(226, 78, 78, 0.85);
}

.cancel-delete-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
