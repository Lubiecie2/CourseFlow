<script setup>
const route = useRoute();
const courseId = route.params.id;

const chapters = ref([]);
const isLoading = ref(true);
const newChapter = ref({ title: "", description: "" });
const successMessage = ref("");
const errorMessage = ref("");

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
          <div>
            <NuxtLink
              :to="{
                name: 'editCourse-id-editChapter-chapterId',
                params: { id: Number(courseId), chapterId: chapter.id },
              }"
              >Edytuj</NuxtLink
            >
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
</template>

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
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 16px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #c82333;
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
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
}

.chapter-item:last-child {
  border-bottom: none;
}

.chapter-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.chapter-description {
  font-size: 14px;
  color: #6c757d;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}
</style>
