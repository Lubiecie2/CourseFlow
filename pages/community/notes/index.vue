<script setup>
definePageMeta({
  middleware: "auth",
  layout: "login",
});

// ------ Zmienne -------------------------------------------------

const notes = ref([]);
const loading = ref(true);
const courses = ref([]);
const newNote = ref({ title: "", content: "", courseId: null, file: null });
const showForm = ref(false);
const error = ref(null);
const selectedCourseFilter = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const totalNotes = ref(0);
const notesPerPage = 10;
const { $socket } = useNuxtApp();
const userStore = useUserStore();
const userId = computed(() => userStore?.user?.id);
const isAdmin = computed(() => userStore?.user?.role_id === 1);
const showConfirmDeleteNote = ref(null);
const editingNote = ref(null);
const editedNoteTitle = ref("");
const editedNoteContent = ref("");
const editedNoteCourseId = ref(null);
const editedNoteFile = ref(null);
const selectedFile = ref(null);
const previewImageUrl = ref(null);
const editPreviewImageUrl = ref(null);

// ------ Inicjalizacja WebSocketa -------------------------------

const initializeSocketConnection = () => {
  if (!$socket.connected) {
    $socket.connect();
  }

  $socket.emit("join-notes-list");

  $socket.on("new-note", (note) => {
    if (!notes.value.some((n) => n.id === note.id)) {
      note.isNew = true;
      notes.value.unshift(note);
      totalNotes.value++;

      setTimeout(() => {
        const index = notes.value.findIndex((n) => n.id === note.id);
        if (index !== -1) {
          notes.value[index].isNew = false;
        }
      }, 15000);

      if (Math.ceil(totalNotes.value / notesPerPage) > totalPages.value) {
        totalPages.value++;
      }
    }
  });

  $socket.on("note-updated", (updatedNote) => {
    const noteId =
      typeof updatedNote.id === "string"
        ? parseInt(updatedNote.id)
        : updatedNote.id;

    const index = notes.value.findIndex((n) => n.id === noteId);
    if (index !== -1) {
      const oldNote = notes.value[index];

      notes.value[index] = {
        ...oldNote,
        ...updatedNote,
      };
    }
  });

  $socket.on("note-removed", (removedNoteId) => {
    notes.value = notes.value.filter((n) => n.id !== parseInt(removedNoteId));
    totalNotes.value--;
    if (notes.value.length === 0 && currentPage.value > 1) {
      goToPage(currentPage.value - 1);
    }
  });
};

// ------ Filtrowanie notatek -----------------------------------------

const filteredNotes = computed(() => {
  if (!notes.value.length) return [];

  if (selectedCourseFilter.value) {
    return notes.value.filter(
      (n) => n.course_id === selectedCourseFilter.value
    );
  }

  return notes.value;
});

// ------ Pobieranie notatek ------------------------------------------

const fetchNotes = async (page = 1) => {
  try {
    loading.value = true;
    error.value = null;

    let url = `notes?page=${page}&limit=${notesPerPage}`;

    if (selectedCourseFilter.value) {
      url += `&courseId=${selectedCourseFilter.value}`;
    }

    const response = await useApiFrontend(url);

    if (response && response.success) {
      notes.value = response.notes || [];

      if (response.pagination) {
        totalPages.value = response.pagination.totalPages || 1;
        currentPage.value = page;
        totalNotes.value = response.pagination.total || notes.value.length;
      }
    } else {
      throw new Error("Nie udało się pobrać notatek");
    }
  } catch (err) {
    console.error("Błąd podczas pobierania notatek:", err);
    error.value =
      "Wystąpił problem podczas ładowania notatek. Spróbuj odświeżyć stronę.";
  } finally {
    loading.value = false;
  }
};

// ------ Pobieranie kursów ------------------------------------------

const fetchCourses = async () => {
  try {
    const response = await useApiFrontend("courses");
    if (Array.isArray(response)) {
      courses.value = response;
    }
  } catch (err) {
    console.error("Błąd podczas pobierania kursów:", err);
  }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    newNote.value.file = file;
    selectedFile.value = file.name;

    if (file.type.match(/^image\//)) {
      previewImageUrl.value = URL.createObjectURL(file);
    } else {
      previewImageUrl.value = null;
    }
  }
};

const handleEditFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    editedNoteFile.value = file;

    if (file.type.match(/^image\//)) {
      editPreviewImageUrl.value = URL.createObjectURL(file);
    } else {
      editPreviewImageUrl.value = null;
    }
  }
};

// ------ Dodawanie nowej notatki -------------------------------------

const addNote = async () => {
  if (!newNote.value.title || !newNote.value.content) return;

  try {
    const formData = new FormData();
    formData.append("title", newNote.value.title);
    formData.append("content", newNote.value.content);
    formData.append("courseId", newNote.value.courseId || "");

    if (newNote.value.file) {
      formData.append("document", newNote.value.file);
    }

    const response = await useApiFrontend("notes", {
      method: "POST",
      body: formData,
      headers: {},
    });

    if (response && response.success) {
      newNote.value = { title: "", content: "", courseId: null, file: null };
      selectedFile.value = null;
      previewImageUrl.value = null;
      showForm.value = false;
      fetchNotes();
    }
  } catch (err) {
    console.error("Błąd podczas dodawania notatki:", err);
  }
};

// ------ Usuwanie notatki --------------------------------------

const confirmDeleteNote = (note, event) => {
  if (event) event.stopPropagation();
  showConfirmDeleteNote.value = note;
};

const cancelDelete = () => {
  showConfirmDeleteNote.value = null;
};

const deleteNote = async () => {
  try {
    const response = await useApiFrontend(
      `notes/${showConfirmDeleteNote.value.id}`,
      {
        method: "DELETE",
      }
    );

    if (response && response.success) {
      notes.value = notes.value.filter(
        (n) => n.id !== showConfirmDeleteNote.value.id
      );
      totalNotes.value--;
      if (notes.value.length === 0 && currentPage.value > 1) {
        goToPage(currentPage.value - 1);
      }
      if ($socket && $socket.connected) {
        $socket.emit("note-deleted", showConfirmDeleteNote.value.id);
      }
    }
  } catch (err) {
    console.error("Błąd podczas usuwania notatki:", err);
  } finally {
    showConfirmDeleteNote.value = null;
  }
};

// ------ Edycja notatki ----------------------------------------

const startEditNote = (note, event) => {
  if (event) event.stopPropagation();
  editingNote.value = note.id;
  editedNoteTitle.value = note.title;
  editedNoteContent.value = note.content;
  editedNoteCourseId.value = note.course_id || null;
  editedNoteFile.value = null;
};

const cancelEditNote = (event) => {
  if (event) event.stopPropagation();
  editingNote.value = null;
  editPreviewImageUrl.value = null;
};

const saveEditedNote = async (event) => {
  if (event) event.stopPropagation();

  try {
    if (!editedNoteTitle.value || !editedNoteContent.value) return;

    const formData = new FormData();
    formData.append("title", editedNoteTitle.value);
    formData.append("content", editedNoteContent.value);

    if (editedNoteCourseId.value) {
      formData.append("courseId", editedNoteCourseId.value);
    }

    if (editedNoteFile.value) {
      formData.append("document", editedNoteFile.value);
    }

    const response = await useApiFrontend(`notes/${editingNote.value}`, {
      method: "PATCH",
      body: formData,
      headers: {},
    });

    if (response && response.success) {
      const index = notes.value.findIndex((n) => n.id === editingNote.value);
      if (index !== -1) {
        notes.value[index].title = editedNoteTitle.value;
        notes.value[index].content = editedNoteContent.value;
        notes.value[index].course_id = editedNoteCourseId.value;

        if (response.note.file_path) {
          notes.value[index].file_path = response.note.file_path;
          notes.value[index].file_name = response.note.file_name;
        }
      }

      if ($socket && $socket.connected) {
        $socket.emit("note-edited", {
          id: editingNote.value,
          title: editedNoteTitle.value,
          content: editedNoteContent.value,
          course_id: editedNoteCourseId.value,
          updated_at: new Date(),
        });
      }

      editingNote.value = null;
    }
  } catch (err) {
    console.error("Błąd podczas edycji notatki:", err);
  }
};

// ------ Sprawdzanie uprawnień -----------------------------------

const canManageNote = (note) => {
  return userId.value === note.user_id || isAdmin.value;
};

// ------ Zmiana strony ------------------------------------------------

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchNotes(page);
};

// ------ Obsługa filtrów ----------------------------------------------

const applyFilter = () => {
  currentPage.value = 1;
  fetchNotes(1);
};

watch([selectedCourseFilter], () => {
  applyFilter();
});

// ------ Przejście na stronę ze szczegółami notatki -------------------

const viewNote = (id) => {
  navigateTo(`/community/notes/${id}`);
};

// ------ Formatowanie daty --------------------------------------------

const formatDate = (date) => {
  return new Date(date).toLocaleString("pl");
};

// ------ Montowanie po odpaleniu strony -------------------------------

onBeforeUnmount(() => {
  if ($socket && $socket.connected) {
    $socket.emit("leave-notes-list");
    $socket.off("new-note");
    $socket.off("note-updated");
    $socket.off("note-removed");
    $socket.disconnect();
  }
});

onMounted(() => {
  fetchNotes();
  fetchCourses();
  initializeSocketConnection();
});
</script>

<template>
  <MainNavbar />
  <div class="community-layout">
    <div class="sidebar">
      <h3 class="sidebar-title">Społeczność</h3>
      <nav class="sidebar-nav">
        <NuxtLink
          to="/community/questions"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-text">Pytania i odpowiedzi</span>
        </NuxtLink>
        <NuxtLink
          to="/community/notes"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-text">Notatki</span>
        </NuxtLink>
      </nav>
    </div>

    <div class="main-content">
      <div class="notes-page">
        <div class="header-section">
          <h1>Notatki do kursów</h1>
          <div class="header-decoration"></div>
          <p class="subtitle">
            Przeglądaj, twórz i udostępniaj notatki ze swoich kursów
          </p>
        </div>

        <div class="content-container">
          <div class="top-actions">
            <div class="filters-section">
              <select
                v-model="selectedCourseFilter"
                class="filter-select"
              >
                <option :value="null">Wszystkie notatki</option>
                <option
                  v-for="course in courses"
                  :key="course.id"
                  :value="course.id"
                >
                  {{ course.title }}
                </option>
              </select>

              <button
                @click="showForm = !showForm"
                class="ask-button"
              >
                {{ showForm ? "Anuluj" : "Dodaj notatkę" }}
              </button>
            </div>
          </div>

          <div
            v-if="showForm"
            class="note-form"
          >
            <h3>Nowa notatka</h3>
            <input
              v-model="newNote.title"
              placeholder="Tytuł notatki"
              class="form-input"
            />
            <textarea
              v-model="newNote.content"
              placeholder="Treść notatki"
              rows="4"
              class="form-textarea"
            ></textarea>
            <select
              v-model="newNote.courseId"
              class="form-select"
            >
              <option :value="null">
                Notatka ogólna (bez przypisania do kursu)
              </option>
              <option
                v-for="course in courses"
                :key="course.id"
                :value="course.id"
              >
                Notatka do kursu: {{ course.title }}
              </option>
            </select>
            <div class="file-input-container">
              <div
                v-if="previewImageUrl"
                class="image-preview-container"
              >
                <img
                  :src="previewImageUrl"
                  alt="Podgląd obrazu"
                  class="image-preview"
                />
              </div>

              <label
                for="file-upload"
                class="file-input-label"
              >
                Dołącz plik
                <input
                  type="file"
                  id="file-upload"
                  @change="handleFileChange"
                  class="file-input"
                />
              </label>
              <span
                v-if="selectedFile"
                class="selected-file"
                >{{ selectedFile }}</span
              >
            </div>
            <div class="form-actions">
              <button
                @click="addNote"
                class="submit-button"
                :disabled="!newNote.title || !newNote.content"
              >
                Wyślij notatkę
              </button>
            </div>
          </div>

          <div
            v-if="loading"
            class="loading-state"
          >
            <p>Wczytywanie notatek...</p>
          </div>

          <div
            v-else-if="error"
            class="error-message"
          >
            {{ error }}
            <button
              @click="fetchNotes(currentPage)"
              class="retry-button"
            >
              Spróbuj ponownie
            </button>
          </div>

          <div
            v-else-if="filteredNotes.length === 0"
            class="empty-state"
          >
            <h3>Brak notatek</h3>
            <p v-if="selectedCourseFilter">
              Nie znaleziono notatek spełniających wybrane kryteria.
            </p>
            <p v-else>
              Dodaj pierwszą notatkę, aby rozpocząć dzielenie się wiedzą!
            </p>
          </div>

          <div
            v-else
            class="notes-list"
          >
            <div
              v-for="note in filteredNotes"
              :key="note.id"
              class="note-item"
              :class="{
                new: note.isNew,
                editing: editingNote === note.id,
              }"
            >
              <div
                v-if="editingNote === note.id"
                class="note-edit-form"
                @click.stop
              >
                <h3>Edycja notatki</h3>
                <input
                  v-model="editedNoteTitle"
                  placeholder="Tytuł notatki"
                  class="form-input"
                />
                <textarea
                  v-model="editedNoteContent"
                  placeholder="Treść notatki"
                  rows="4"
                  class="form-textarea"
                ></textarea>
                <select
                  v-model="editedNoteCourseId"
                  class="form-select"
                >
                  <option :value="null">
                    Notatka ogólna (bez przypisania do kursu)
                  </option>
                  <option
                    v-for="course in courses"
                    :key="course.id"
                    :value="course.id"
                  >
                    Notatka do kursu: {{ course.title }}
                  </option>
                </select>
                <div class="file-input-container">
                  <div
                    v-if="editPreviewImageUrl"
                    class="image-preview-container"
                  >
                    <img
                      :src="editPreviewImageUrl"
                      alt="Podgląd obrazu"
                      class="image-preview"
                    />
                  </div>

                  <label
                    for="edit-file-upload"
                    class="file-input-label"
                  >
                    Zmień załącznik
                    <input
                      type="file"
                      id="edit-file-upload"
                      @change="handleEditFileChange"
                      class="file-input"
                    />
                  </label>
                  <span
                    v-if="editedNoteFile"
                    class="selected-file"
                    >{{ editedNoteFile.name }}</span
                  >
                </div>
                <div class="form-actions">
                  <button
                    @click="cancelEditNote"
                    class="cancel-button"
                  >
                    Anuluj
                  </button>
                  <button
                    @click="saveEditedNote"
                    class="submit-button"
                    :disabled="!editedNoteTitle || !editedNoteContent"
                  >
                    Zapisz zmiany
                  </button>
                </div>
              </div>

              <template v-else>
                <div class="note-header">
                  <h3
                    class="note-title"
                    @click="viewNote(note.id)"
                  >
                    {{ note.title }}
                  </h3>
                  <div
                    v-if="note.course_title"
                    class="course-badge"
                  >
                    {{ note.course_title }}
                  </div>

                  <div
                    v-if="canManageNote(note)"
                    class="note-actions"
                  >
                    <button
                      @click="startEditNote(note, $event)"
                      class="edit-button small"
                      title="Edytuj notatkę"
                      v-if="userId === note.user_id"
                    >
                      <i class="icon-edit">✏️</i>
                    </button>
                    <button
                      @click="confirmDeleteNote(note, $event)"
                      class="delete-button small"
                      title="Usuń notatkę"
                    >
                      <i class="icon-delete">🗑️</i>
                    </button>
                  </div>
                </div>
                <div
                  class="note-content"
                  @click="viewNote(note.id)"
                >
                  {{ note.content.substring(0, 150)
                  }}{{ note.content.length > 150 ? "..." : "" }}
                </div>
                <div class="note-footer">
                  <span class="author">
                    Autor: {{ note.first_name }}
                    {{ note.last_name }}
                  </span>
                  <span class="date">
                    Data: {{ formatDate(note.created_at) }}
                  </span>
                  <span
                    v-if="note.file_path"
                    class="file-badge"
                  >
                    <i class="icon-file">📎</i> Zawiera załącznik
                  </span>
                </div>
              </template>
            </div>
          </div>

          <div
            v-if="filteredNotes.length > 0"
            class="pagination"
          >
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="pagination-button"
            >
              &laquo; Poprzednia
            </button>
            <span class="page-info">
              Strona {{ currentPage }} z {{ totalPages }}
            </span>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="pagination-button"
            >
              Następna &raquo;
            </button>
          </div>
        </div>

        <div
          v-if="showConfirmDeleteNote"
          class="confirm-delete-dialog"
        >
          <div class="dialog-content">
            <h3>Potwierdź usunięcie</h3>
            <p>
              Czy na pewno chcesz usunąć notatkę "{{
                showConfirmDeleteNote.title
              }}"?
            </p>
            <div class="dialog-actions">
              <button
                @click="cancelDelete"
                class="cancel-button"
              >
                Anuluj
              </button>
              <button
                @click="deleteNote"
                class="delete-dialog-button"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notes-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 120px);
  background-color: #f9f9f9;
}

.header-section {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}

.header-section h1 {
  font-size: 28px;
  margin-bottom: 5px;
  color: #333;
  position: relative;
  display: inline-block;
}

.header-decoration {
  width: 80px;
  height: 3px;
  background-color: #eb5757;
  margin: 0 auto 10px;
  border-radius: 2px;
}

.subtitle {
  color: #666;
  margin-bottom: 15px;
  font-size: 14px;
}

.content-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

.top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters-section {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  min-width: 200px;
  transition: border-color 0.2s;
}

.filter-select:focus {
  border-color: #eb5757;
  outline: none;
}

.ask-button {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.ask-button:hover {
  background-color: #d64545;
}

.note-form {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.note-form h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: #eb5757;
  outline: none;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.file-input-container {
  margin-bottom: 15px;
}

.file-input-label {
  display: inline-block;
  background-color: #f0f0f0;
  color: #333;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.file-input-label:hover {
  background-color: #e0e0e0;
}

.file-input {
  display: none;
}

.selected-file {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}

.submit-button {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #d64545;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-state {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  color: #eb5757;
  background-color: #fff3f3;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid #ffcdd2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.retry-button {
  background: none;
  border: 1px solid #eb5757;
  color: #eb5757;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #fff3f3;
}

.empty-state {
  text-align: center;
  padding: 30px 0;
  color: #666;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.note-item {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;
}

.note-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.note-header {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.note-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.course-badge {
  display: inline-flex;
  align-items: center;
  margin-top: 5px;
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.note-content {
  padding: 12px 15px;
  color: #555;
  line-height: 1.4;
  cursor: pointer;
}

.note-item.new {
  animation: highlightNewNote 2s ease-out;
  position: relative;
  border-left: 4px solid #eb5757;
}

.note-item.editing {
  cursor: default;
}

.note-item.editing:hover {
  transform: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.note-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  z-index: 2;
}

.edit-button,
.delete-button {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-edit,
.icon-delete {
  font-style: normal;
  font-size: 16px;
}

.edit-button {
  background-color: #4a90e2;
  color: white;
}

.edit-button:hover {
  background-color: #3a80d2;
  transform: translateY(-2px);
}

.delete-button {
  background-color: #e74c3c;
  color: white;
}

.delete-button:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

.small {
  font-size: 12px;
}

.note-edit-form {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.note-edit-form h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.note-footer {
  padding: 10px 15px;
  background: #f8f9fa;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 12px;
  color: #666;
}

.author,
.date,
.file-badge {
  display: flex;
  align-items: center;
}

.file-badge {
  color: #4a90e2;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 15px;
}

.pagination-button {
  background-color: #eb5757;
  border: none;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  font-weight: 500;
}

.pagination-button:hover:not(:disabled) {
  background-color: #d64545;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.pagination-button:disabled {
  background-color: #f0a0a0;
  color: #fff;
  cursor: not-allowed;
  opacity: 0.7;
}

.page-info {
  font-size: 14px;
  color: #666;
}

.confirm-delete-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
}

.dialog-content h3 {
  margin-top: 0;
  color: #333;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-button {
  background-color: #999;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 10px;
}

.cancel-button:hover {
  background-color: #888;
}

.delete-dialog-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-dialog-button:hover {
  background-color: #c0392b;
}

@keyframes highlightNewNote {
  0% {
    background-color: rgba(235, 87, 87, 0.2);
    transform: translateY(-5px);
  }
  30% {
    background-color: rgba(235, 87, 87, 0.15);
    transform: translateY(0);
  }
  100% {
    background-color: rgba(255, 240, 240, 0.5);
  }
}

@media (max-width: 600px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select,
  .ask-button {
    width: 100%;
  }

  .note-footer {
    flex-direction: column;
    gap: 5px;
  }

  .note-actions {
    position: static;
    margin-top: 10px;
    justify-content: flex-end;
  }
}

.community-layout {
  display: flex;
  min-height: calc(100vh - 64px);
  background-color: #f8f9fa;
}

.sidebar {
  width: 250px;
  background-color: white;
  border-right: 1px solid #e9ecef;
  flex-shrink: 0;
}

.sidebar-title {
  padding: 15px;
  margin: 0;
  font-weight: 600;
  font-size: 18px;
  color: #333;
  border-bottom: 1px solid #e9ecef;
}

.sidebar-nav {
  padding: 10px 0;
}

.nav-item {
  padding: 12px 15px;
  display: block;
  text-decoration: none;
  color: #495057;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f1f3f5;
}

.nav-item:hover {
  background-color: #f8f9fa;
}

.nav-item.active {
  background-color: #f8f9fa;
  color: #eb5757;
  font-weight: 500;
}

.main-content {
  flex-grow: 1;
  padding: 0 20px;
  width: 100%;
}

@media (max-width: 768px) {
  .community-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }
}

.image-preview-container {
  margin: 0 0 10px 0;
  position: relative;
  display: block;
  max-width: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  text-align: left;
}

.image-preview {
  width: 100%;
  height: auto;
  display: block;
}
</style>
