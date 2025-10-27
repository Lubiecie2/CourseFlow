<script setup>
definePageMeta({
  middleware: "auth",
  layout: "login",
});

// ------ Zmienne -------------------------------------------------

const route = useRoute();
const noteId = route.params.id;
const note = ref(null);
const loading = ref(true);
const error = ref(null);
const { $socket } = useNuxtApp();

// ------ Inicjalizacja WebSocketa -------------------------------

const initializeSocketConnection = () => {
  if (!$socket.connected) {
    $socket.connect();
  }

  $socket.emit("join-note", noteId);

  $socket.on("note-updated", (updatedNote) => {
    if (updatedNote.id === parseInt(noteId)) {
      note.value = updatedNote;
    }
  });

  $socket.on("note-removed", (removedNoteId) => {
    if (removedNoteId === noteId || removedNoteId === parseInt(noteId)) {
      navigateTo("/community/notes");
    }
  });
};

// ------ Pobieranie notatek ---------------------------------------

const fetchNote = async () => {
  try {
    loading.value = true;
    error.value = null;
    console.log("Rozpoczynam pobieranie notatki o ID:", noteId);

    const response = await useApiFrontend(`notes/${noteId}`);
    console.log("Odpowiedź z API:", response);

    if (response && response.success) {
      note.value = {
        ...response.note,
        user: {
          id: response.note.user_id,
          first_name: response.note.first_name,
          last_name: response.note.last_name,
          email: response.note.email,
        },
      };
      console.log("Notatka pobrana pomyślnie:", note.value);
    } else {
      throw new Error("Nie udało się pobrać notatki");
    }
  } catch (err) {
    console.error("Błąd podczas pobierania notatki:", err);
    error.value = "Wystąpił problem podczas ładowania notatki.";
  } finally {
    loading.value = false;
    console.log("Zakończono ładowanie");
  }
};

// ------ Pobieranie pliku ---------------------------------------

const downloadFile = async (noteId, fileName) => {
  try {
    const token = useCookie("access_token").value;

    const response = await fetch(
      `https://api.courseflow.pl/api/notes/${noteId}/download`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Błąd pobierania pliku");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
  } catch (error) {
    console.error("Błąd podczas pobierania pliku:", error);
    alert("Wystąpił problem z pobraniem pliku. Spróbuj ponownie.");
  }
};

onMounted(() => {
  fetchNote();
  initializeSocketConnection();
});

onBeforeUnmount(() => {
  if ($socket && $socket.connected) {
    $socket.off("note-updated");
    $socket.off("note-removed");
    $socket.emit("leave-note", noteId);
  }
});
</script>

<template>
  <mainNavbar></mainNavbar>
  <div class="note-detail-page">
    <div
      v-if="loading"
      class="loading-spinner"
    >
      <div class="spinner"></div>
      <p>Ładowanie notatki...</p>
    </div>

    <div
      v-else-if="error"
      class="error-message"
    >
      {{ error }}
    </div>

    <div
      v-else-if="note"
      class="note-container"
    >
      <div class="note-header">
        <div class="back-button-container">
          <NuxtLink
            to="/community/notes"
            class="back-button"
          >
            &larr; Wróć do listy notatek
          </NuxtLink>
        </div>
      </div>

      <div class="note-content">
        <h1 class="note-title">{{ note.title }}</h1>

        <div class="note-metadata">
          <span class="note-author">
            Autor: {{ note.user.first_name }} {{ note.user.last_name }}
          </span>
          <span class="note-date">
            Utworzono:
            {{ new Date(note.created_at).toLocaleDateString("pl-PL") }}
          </span>
          <span
            v-if="note.created_at !== note.updated_at"
            class="note-date"
          >
            Ostatnia edycja:
            {{ new Date(note.updated_at).toLocaleDateString("pl-PL") }}
          </span>
        </div>

        <div class="note-body">
          <p>{{ note.content }}</p>
        </div>

        <div
          v-if="note.file_path"
          class="note-attachment"
        >
          <h3>Załącznik:</h3>
          <div class="attachment-container">
            <div
              v-if="note.file_path.match(/\.(jpg|jpeg|png|gif|webp)$/i)"
              class="image-attachment"
            >
              <img
                :src="`https://api.courseflow.pl/uploads/${note.file_path
                  .split('/')
                  .pop()}`"
                alt="Załącznik do notatki"
              />
            </div>

            <div
              v-else-if="note.file_path.match(/\.pdf$/i)"
              class="file-attachment pdf-attachment"
            >
              <a
                @click.prevent="downloadFile(note.id, note.file_name)"
                class="download-link"
                href="#"
              >
                <span class="file-icon">📑</span>
                <span class="file-name">{{ note.file_name }}</span>
                <span class="download-text">Pobierz dokument PDF</span>
              </a>
            </div>

            <div
              v-else-if="note.file_path.match(/\.txt$/i)"
              class="file-attachment txt-attachment"
            >
              <a
                @click.prevent="downloadFile(note.id, note.file_name)"
                class="download-link"
                href="#"
              >
                <span class="file-icon">📝</span>
                <span class="file-name">{{ note.file_name }}</span>
                <span class="download-text">Pobierz plik tekstowy</span>
              </a>
            </div>

            <div
              v-else
              class="file-attachment"
            >
              <a
                @click.prevent="downloadFile(note.id, note.file_name)"
                class="download-link"
                href="#"
              >
                <span class="file-icon">📄</span>
                <span class="file-name">{{ note.file_name }}</span>
                <span class="download-text">Pobierz plik</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 120px);
  background-color: #f9f9f9;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.spinner {
  width: 50px;
  height: 50px;
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

.error-message {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.note-container {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.back-button {
  display: inline-flex;
  align-items: center;
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.back-button:hover {
  color: #eb5757;
}

.note-content {
  padding: 20px;
}

.note-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 10px;
}

.note-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
}

.note-body {
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 20px;
}

.note-attachment {
  margin-top: 30px;
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}

.note-attachment h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #111827;
}

.attachment-container {
  margin-top: 10px;
}

.image-attachment img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.file-attachment {
  background-color: #f3f4f6;
  padding: 15px;
  border-radius: 8px;
  display: inline-block;
}

.download-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #111827;
  font-weight: 500;
}

.file-icon {
  font-size: 24px;
  margin-right: 10px;
}

.file-name {
  margin-right: 10px;
}

.download-text {
  color: #3b82f6;
  font-weight: 600;
}

.pdf-attachment {
  background-color: #fef2f2;
  border-left: 4px solid #dc2626;
}

.txt-attachment {
  background-color: #f0f9ff;
  border-left: 4px solid #3b82f6;
}

.pdf-attachment .file-icon,
.txt-attachment .file-icon {
  font-size: 28px;
}

.pdf-attachment .download-text {
  color: #dc2626;
}

.txt-attachment .download-text {
  color: #3b82f6;
}

.image-attachment {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.image-attachment img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: block;
  margin: 0 auto;
  max-height: 600px;
  object-fit: contain;
}
</style>
