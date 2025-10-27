<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  courseId: {
    type: [String, Number],
    required: true,
  },
});

const course = ref({
  title: "",
  category: "",
  description: "",
  image: null,
});

const originalImageUrl = ref(null);
const previewImage = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const fetchCourseData = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await useApiFrontend(`/courses/${props.courseId}`);

    course.value = {
      title: response.title || "",
      category: response.category || "",
      description: response.short_description || "",
    };

    if (response.course_image) {
      originalImageUrl.value = `https://api.courseflow.pl/uploads/${response.course_image}`;
      previewImage.value = originalImageUrl.value;
    }
  } catch (error) {
    console.error("Błąd podczas pobierania danych kursu:", error);
    errorMessage.value = "Nie udało się załadować danych kursu.";
  } finally {
    isLoading.value = false;
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  course.value.image = file;
  previewImage.value = URL.createObjectURL(file);
};

const validateForm = () => {
  if (!course.value.title.trim()) {
    errorMessage.value = "Tytuł jest wymagany";
    return false;
  }

  if (!course.value.category) {
    errorMessage.value = "Kategoria jest wymagana";
    return false;
  }

  return true;
};

const submitForm = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!validateForm()) return;

  isSaving.value = true;

  try {
    const formData = new FormData();
    formData.append("title", course.value.title);
    formData.append("category", course.value.category);
    formData.append("description", course.value.description);

    if (course.value.image) {
      formData.append("image", course.value.image);
    }

    const response = await useApiFrontend(`/courses/${props.courseId}`, {
      method: "PATCH",
      body: formData,
    });

    successMessage.value = "Kurs został zaktualizowany pomyślnie";

    if (response.course && response.course.course_image) {
      originalImageUrl.value = `https://api.courseflow.pl/uploads/${response.course.course_image}`;
      previewImage.value = originalImageUrl.value;
    }

    course.value.image = null;

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    console.error("Błąd podczas aktualizacji kursu:", error);
    errorMessage.value = "Wystąpił błąd podczas aktualizacji kursu";
  } finally {
    isSaving.value = false;
  }
};

onMounted(fetchCourseData);
</script>

<template>
  <div class="course-card-form">
    <div
      v-if="isLoading"
      class="loading-state"
    >
      <div class="spinner"></div>
      <p>Ładowanie danych kursu...</p>
    </div>

    <template v-else>
      <div class="form-header">
        <h2 class="form-title">Edycja wizytówki kursu</h2>
        <div class="underline-animated"></div>
      </div>

      <div
        v-if="errorMessage"
        class="error-message"
      >
        <span>⚠️</span> {{ errorMessage }}
      </div>

      <div
        v-if="successMessage"
        class="success-message"
      >
        <span>✅</span> {{ successMessage }}
      </div>

      <div class="form-group">
        <label for="course-title">Nazwa kursu</label>
        <div class="input-container">
          <input
            id="course-title"
            v-model="course.title"
            type="text"
            placeholder="Wpisz nazwę kursu"
            class="form-control"
            :disabled="isSaving"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="course-category">Kategoria</label>
        <div class="input-container">
          <select
            id="course-category"
            v-model="course.category"
            class="form-control"
            :disabled="isSaving"
          >
            <option value="">Wybierz kategorię</option>
            <option value="programowanie">Programowanie</option>
            <option value="design">Design</option>
            <option value="biznes">Biznes</option>
            <option value="matematyka">Matematyka</option>
            <option value="jezyki">Języki obce</option>
            <option value="nauki">Nauki ścisłe</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="course-image">Miniaturka kursu</label>
        <div class="file-upload-container">
          <div
            class="file-preview"
            v-if="previewImage"
          >
            <img
              :src="previewImage"
              alt="Podgląd kursu"
            />
            <div class="preview-overlay">
              <span>Kliknij, aby zmienić</span>
            </div>
          </div>
          <div
            class="file-upload"
            :class="{ 'has-preview': previewImage }"
          >
            <input
              id="course-image"
              type="file"
              @change="handleImageUpload"
              accept="image/*"
              class="file-input"
              :disabled="isSaving"
            />
            <div class="upload-placeholder">
              <span class="upload-icon">📷</span>
              <span class="upload-text">
                {{ previewImage ? "Zmień zdjęcie" : "Wybierz zdjęcie" }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="course-description">Opis kursu</label>
        <div class="input-container">
          <textarea
            id="course-description"
            v-model="course.description"
            placeholder="Krótki opis kursu, który będzie widoczny na wizytówce"
            class="form-control textarea-control"
            rows="4"
            :disabled="isSaving"
          ></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button
          class="submit-button"
          @click="submitForm"
          :disabled="isSaving"
        >
          <span
            v-if="isSaving"
            class="loading-spinner"
            >⟳</span
          >
          <span class="button-text">
            {{ isSaving ? "Zapisywanie..." : "Zapisz zmiany" }}
          </span>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.course-card-form {
  max-width: 600px;
  margin: 40px auto;
  padding: 32px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #eb5757;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.form-header {
  margin-bottom: 28px;
}

.form-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
  text-align: center;
  position: relative;
}

.underline-animated {
  content: "";
  position: relative;
  display: block;
  width: 60px;
  height: 3px;
  margin: 10px auto 0;
  background-color: #eb5757;
}

.error-message,
.success-message {
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-message {
  color: #d64545;
}

.success-message {
  color: #27ae60;
}

.form-group {
  margin-bottom: 22px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 15px;
}

.input-container {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
}

.form-control {
  width: 100%;
  padding: 13px 13px 13px 13px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
  background-color: #fafafa;
}

.textarea-control {
  padding-top: 12px;
  padding-bottom: 12px;
  min-height: 110px;
  resize: vertical;
  line-height: 1.5;
}

.form-control:focus {
  outline: none;
  background-color: #fff;
  border-color: #eb5757;
  box-shadow: 0 0 0 3px rgba(235, 87, 87, 0.2);
}

.file-upload-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-preview {
  width: 100%;
  max-height: 200px;
  overflow: hidden;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.file-preview img {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 6px;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-preview:hover .preview-overlay {
  opacity: 1;
}

.file-upload {
  position: relative;
  height: 100px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  background-color: #fafafa;
}

.file-upload:hover {
  border-color: #eb5757;
  background-color: #f5f5f5;
}

.file-upload.has-preview {
  height: 60px;
  background-color: #f8f8f8;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #555;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 36px;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eb5757;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 2px 6px rgba(235, 87, 87, 0.3);
}

.submit-button:hover {
  background-color: #d64545;
}

.submit-button:active {
  transform: scale(0.98);
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: 10px;
  font-size: 18px;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-icon {
  margin-right: 10px;
  font-size: 18px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

@media (max-width: 768px) {
  .course-card-form {
    padding: 24px;
    margin: 20px 15px;
  }

  .submit-button {
    width: 100%;
  }
}
</style>
