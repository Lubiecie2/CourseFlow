<script setup>
definePageMeta({
  layout: "login",
  middleware: "auth",
});

// ------ Parametry ------------------------------

const route = useRoute();
const router = useRouter();
const courseId = route.params.id;

// ------ Zmienne --------------------------------

const chapters = ref([]);
const tests = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showDeleteDialog = ref(false);
const testToDelete = ref(null);

const testForm = ref({
  title: "",
  description: "",
  pass_threshold: 70,
  time_limit: 0,
  chapter_id: "",
});

// ------ Pobieranie rozdziałów w danym kursie ---------------------

const fetchChapters = async () => {
  try {
    const response = await useApiFrontend(`courses/${courseId}/chapters`);
    chapters.value = response || [];
  } catch (err) {
    console.error("Błąd podczas pobierania rozdziałów:", err);
    errorMessage.value = "Nie udało się załadować rozdziałów kursu.";
  }
};

// ------ Pobieranie testów  --------------------------------------------

const fetchTests = async () => {
  try {
    const allTests = [];

    for (const chapter of chapters.value) {
      const response = await useApiFrontend(
        `chapterTest/${courseId}/chapters/${chapter.id}/tests`
      );
      if (response?.tests?.length > 0) {
        const testsWithChapter = response.tests.map((test) => ({
          ...test,
          chapterTitle: chapter.title,
        }));
        allTests.push(...testsWithChapter);
      }
    }

    tests.value = allTests;
  } catch (err) {
    console.error("Błąd podczas pobierania testów:", err);
    errorMessage.value = "Nie udało się załadować testów.";
  }
};

// ------ Tworzenie nowego testu -----------------------------------

const createTest = async () => {
  if (!validateForm()) return;

  try {
    const response = await useApiFrontend(
      `chapterTest/${courseId}/chapters/${testForm.value.chapter_id}/tests`,
      {
        method: "POST",
        body: {
          title: testForm.value.title,
          description: testForm.value.description,
          pass_threshold: parseInt(testForm.value.pass_threshold),
          time_limit: parseInt(testForm.value.time_limit),
        },
      }
    );

    if (response.success) {
      successMessage.value = "Test został pomyślnie utworzony";
      resetForm();
      await fetchTests();

      if (response.test && response.test.id) {
        router.push(`/editCourse/${courseId}/editTests/${response.test.id}`);
      }
    }
  } catch (err) {
    console.error("Błąd podczas tworzenia testu:", err);
    errorMessage.value = "Nie udało się utworzyć testu.";
  }
};

// ------ Walidacja formularza ----------------------------------

const validateForm = () => {
  if (!testForm.value.title.trim()) {
    errorMessage.value = "Tytuł testu jest wymagany";
    return false;
  }

  if (!testForm.value.chapter_id) {
    errorMessage.value = "Wybierz rozdział dla testu";
    return false;
  }

  if (
    testForm.value.pass_threshold < 1 ||
    testForm.value.pass_threshold > 100
  ) {
    errorMessage.value = "Próg zaliczenia musi być liczbą od 1 do 100";
    return false;
  }

  if (testForm.value.time_limit < 0) {
    errorMessage.value = "Limit czasu nie może być ujemny";
    return false;
  }

  return true;
};

// ------ Czyszczenie formularza --------------------------------

const resetForm = () => {
  testForm.value = {
    title: "",
    description: "",
    pass_threshold: 70,
    time_limit: 0,
    chapter_id: "",
  };
};

// ------ Przejście do edycji testu -----------------------------

const editTest = (testId) => {
  router.push(`/editCourse/${courseId}/editTests/${testId}`);
};

// ------ Potwierdzenie / anulowanie usunięcia testu ----------------

const confirmDelete = (test) => {
  testToDelete.value = test;
  showDeleteDialog.value = true;
};

const cancelDelete = () => {
  testToDelete.value = null;
  showDeleteDialog.value = false;
};

// ------ Usuwanie testu --------------------------------------------

const deleteTest = async () => {
  try {
    const response = await useApiFrontend(`tests/${testToDelete.value.id}`, {
      method: "DELETE",
    });

    if (response.success) {
      successMessage.value = "Test został pomyślnie usunięty";
      await fetchTests();

      setTimeout(() => {
        successMessage.value = "";
      }, 7000);
    }
  } catch (err) {
    console.error("Błąd podczas usuwania testu:", err);
    errorMessage.value = "Nie udało się usunąć testu.";
  } finally {
    showDeleteDialog.value = false;
    testToDelete.value = null;
  }
};

// ------ Pobranie danych po załadowaniu strony -----------------------

onMounted(async () => {
  await fetchChapters();
  await fetchTests();
});
</script>

<template>
  <div class="tests-management">
    <h1 class="page-title">Zarządzanie testami</h1>

    <div
      v-if="errorMessage"
      class="error-message"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="successMessage"
      class="success-message"
    >
      {{ successMessage }}
    </div>

    <div class="test-form">
      <h2>Utwórz nowy test</h2>

      <div class="form-group">
        <label for="chapter">Rozdział:</label>
        <select
          id="chapter"
          v-model="testForm.chapter_id"
          class="form-control"
        >
          <option value="">Wybierz rozdział</option>
          <option
            v-for="chapter in chapters"
            :key="chapter.id"
            :value="chapter.id"
          >
            {{ chapter.title }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="title">Tytuł testu:</label>
        <input
          id="title"
          v-model="testForm.title"
          type="text"
          class="form-control"
          placeholder="Wprowadź tytuł testu"
        />
      </div>

      <div class="form-group">
        <label for="description">Opis testu:</label>
        <textarea
          id="description"
          v-model="testForm.description"
          class="form-control"
          placeholder="Wprowadź opis testu (opcjonalnie)"
          rows="3"
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="pass_threshold">Próg zaliczenia (%):</label>
          <input
            id="pass_threshold"
            v-model="testForm.pass_threshold"
            type="number"
            class="form-control"
            min="1"
            max="100"
          />
        </div>

        <div class="form-group">
          <label for="time_limit">Limit czasu (min, 0 = bez limitu):</label>
          <input
            id="time_limit"
            v-model="testForm.time_limit"
            type="number"
            class="form-control"
            min="0"
          />
        </div>
      </div>

      <div class="form-actions">
        <button
          @click="createTest"
          class="red-button"
        >
          Utwórz test
        </button>
        <button
          @click="resetForm"
          class="btn-cancel"
        >
          Wyczyść formularz
        </button>
      </div>
    </div>

    <h2 class="section-title">Lista testów</h2>

    <div
      v-if="tests.length === 0"
      class="no-tests"
    >
      <p>Nie znaleziono żadnych testów.</p>
      <p v-if="chapters.length === 0">
        Najpierw utwórz rozdział, aby móc dodać test.
      </p>
    </div>

    <div
      v-else
      class="tests-table-container"
    >
      <table class="tests-table">
        <thead>
          <tr>
            <th>Tytuł testu</th>
            <th>Rozdział</th>
            <th>Próg zaliczenia</th>
            <th>Limit czasu</th>
            <th>Pytania</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="test in tests"
            :key="test.id"
          >
            <td>{{ test.title }}</td>
            <td>{{ test.chapterTitle }}</td>
            <td>{{ test.pass_threshold }}%</td>
            <td>{{ test.time_limit ? `${test.time_limit} min` : "Brak" }}</td>
            <td>{{ test._count?.test_blocks || 0 }}</td>
            <td class="actions-cell">
              <button
                @click="editTest(test.id)"
                class="red-button action-btn"
              >
                Edytuj pytania
              </button>
              <button
                @click="confirmDelete(test)"
                class="delete-btn"
              >
                Usuń test
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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
      <h3>Potwierdź usunięcie</h3>
      <p>Czy na pewno chcesz usunąć test "{{ testToDelete?.title }}"?</p>
      <p class="warning">
        Ta operacja jest nieodwracalna i spowoduje usunięcie wszystkich pytań
        tego testu.
      </p>
      <div class="dialog-actions">
        <button
          @click="cancelDelete"
          class="btn-cancel"
        >
          Anuluj
        </button>
        <button
          @click="deleteTest"
          class="red-button"
        >
          Usuń test
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tests-management {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 28px;
  margin-bottom: 24px;
  color: #333;
}

.section-title {
  font-size: 22px;
  margin: 30px 0 15px;
  color: #333;
}

.error-message,
.success-message {
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  position: relative;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  border-left: 4px solid #2e7d32;
}

.test-form {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-form h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.red-button {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.red-button:hover {
  background-color: #d64545;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: #e5e5e5;
}

.tests-table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tests-table {
  width: 100%;
  border-collapse: collapse;
}

.tests-table th,
.tests-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.tests-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
}

.tests-table tr:last-child td {
  border-bottom: none;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  font-size: 14px;
}

.delete-btn {
  background-color: #ff5252;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #ff3838;
}

.no-tests {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  color: #666;
}

.delete-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  position: relative;
  z-index: 1001;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.dialog-content h3 {
  margin-top: 0;
  color: #333;
}

.warning {
  color: #f44336;
  font-weight: 500;
}

.dialog-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
