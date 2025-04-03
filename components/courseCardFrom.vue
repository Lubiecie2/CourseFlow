<script setup>
import { ref } from "vue";

const course = ref({
  title: "",
  category: "",
  description: "",
  image: null,
});

const previewImage = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");
const emit = defineEmits(["submit"]);

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  course.value.image = file;

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const validateForm = () => {
  if (!course.value.title.trim()) {
    errorMessage.value = "Tytuł kursu jest wymagany.";
    return false;
  }

  if (!course.value.category) {
    errorMessage.value = "Kategoria jest wymagana.";
    return false;
  }

  return true;
};

const submitForm = async () => {
  errorMessage.value = "";

  if (!validateForm()) return;

  try {
    isLoading.value = true;

    const formData = new FormData();
    formData.append("title", course.value.title);
    formData.append("category", course.value.category);
    formData.append("description", course.value.description);

    if (course.value.image) {
      formData.append("image", course.value.image);
    }

    const response = await useApiFrontend("/courses", {
      method: "POST",
      body: formData,
    });

    emit("submit", {
      ...course.value,
      id: response.course.id,
      imageUrl: response.course.image_url,
    });
  } catch (error) {
    console.error("Błąd podczas zapisywania kursu:", error);
    errorMessage.value =
      error?.data?.message ||
      "Wystąpił błąd podczas zapisywania wizytówki kursu.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="course-card-form">
    <div class="form-header">
      <h2 class="form-title">Tworzenie wizytówki kursu</h2>
      <div class="underline-animated"></div>
    </div>

    <div
      v-if="errorMessage"
      class="error-message"
    >
      <span>⚠️</span> {{ errorMessage }}
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
          :disabled="isLoading"
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
          :disabled="isLoading"
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
      <label for="course-image">Dodaj miniaturkę</label>
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
            @change="handleFileUpload"
            accept="image/*"
            class="file-input"
            :disabled="isLoading"
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
          :disabled="isLoading"
        ></textarea>
      </div>
    </div>

    <div class="form-actions">
      <button
        class="submit-button"
        @click="submitForm"
        :disabled="isLoading"
      >
        <span class="button-text">
          {{ isLoading ? "Zapisywanie..." : "Zapisz wizytówkę" }}
        </span>
      </button>
    </div>
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

.form-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 28px;
  color: #333;
  text-align: center;
  position: relative;
}

.form-title:after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: #eb5757;
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

.form-control {
  width: 100%;
  padding: 13px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
  background-color: #fafafa;
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
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  position: relative;
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
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
  font-weight: 500;
  border-radius: 6px;
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
  margin-bottom: 8px;
}

.textarea-control {
  min-height: 120px;
  resize: vertical;
}

.form-actions {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.submit-button {
  background-color: #eb5757;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s, transform 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
}

.error-message {
  background-color: rgba(235, 87, 87, 0.1);
  border-left: 3px solid #eb5757;
  color: #d64545;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

input:invalid,
select:invalid {
  border-color: #eb5757;
}

.submit-button:not(:disabled):hover {
  background-color: #d64545;
  transform: translateY(-2px);
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
