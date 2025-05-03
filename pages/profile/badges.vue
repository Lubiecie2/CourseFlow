<script setup>
import { ref, onMounted } from "vue";
definePageMeta({
  middleware: "auth",
  layout: "login",
});

const certificates = ref([]);
const isLoading = ref(true);
const error = ref(null);

const fetchCertificates = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await useApiFrontend("/certificates/user");

    if (response.success && response.certificates) {
      certificates.value = response.certificates;
    } else {
      certificates.value = [];
    }
  } catch (err) {
    console.error("Błąd podczas pobierania certyfikatów:", err);
    error.value =
      "Nie udało się pobrać certyfikatów. Spróbuj ponownie później.";
  } finally {
    isLoading.value = false;
  }
};

const downloadCertificate = async (certificateCode) => {
  try {
    const token = useCookie("access_token").value;

    const response = await fetch(
      `http://localhost:4000/api/certificates/download/${certificateCode}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Błąd pobierania certyfikatu");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `certyfikat-${certificateCode}.pdf`;
    document.body.appendChild(link);

    link.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
  } catch (error) {
    console.error("Błąd podczas pobierania certyfikatu:", error);
    alert("Wystąpił problem z pobraniem certyfikatu. Spróbuj ponownie.");
  }
};

const getCourseImage = (imagePath) => {
  if (!imagePath) return "http://localhost:4000/uploads/default-course.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  return `http://localhost:4000/uploads/${imagePath}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL");
};

onMounted(fetchCertificates);
</script>

<template>
  <UserNavbar />
  <div class="certificates-container">
    <h1>Twoje certyfikaty</h1>

    <div
      v-if="isLoading"
      class="loading-state"
    >
      <div class="spinner"></div>
      <p>Wczytywanie certyfikatów...</p>
    </div>

    <div
      v-else-if="error"
      class="error-state"
    >
      <p>{{ error }}</p>
      <button
        @click="fetchCertificates"
        class="retry-btn"
      >
        Spróbuj ponownie
      </button>
    </div>

    <div
      v-else-if="certificates.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">🔍</div>
      <h3>Nie masz jeszcze żadnych certyfikatów</h3>
      <p>Ukończ kursy, aby zdobyć certyfikaty ukończenia.</p>
      <NuxtLink
        to="/courses"
        class="browse-courses-btn"
        >Przeglądaj kursy</NuxtLink
      >
    </div>

    <div
      v-else
      class="certificates-grid"
    >
      <div
        v-for="cert in certificates"
        :key="cert.id"
        class="certificate-card"
      >
        <div class="certificate-header">
          <div class="course-image">
            <img
              :src="getCourseImage(cert.courses.course_image)"
              :alt="cert.courses.title"
            />
          </div>
          <div class="certificate-info">
            <h3>{{ cert.courses.title }}</h3>
            <span class="certificate-category">{{
              cert.courses.category
            }}</span>
          </div>
        </div>

        <div class="certificate-details">
          <div class="detail-row">
            <span class="detail-label">Data ukończenia:</span>
            <span class="detail-value">{{ formatDate(cert.issued_at) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Kod certyfikatu:</span>
            <span class="detail-value certificate-code">{{
              cert.certificate_code
            }}</span>
          </div>
        </div>

        <div class="certificate-actions">
          <button
            @click="downloadCertificate(cert.certificate_code)"
            class="download-btn"
          >
            <span class="btn-icon">📥</span> Pobierz certyfikat
          </button>
        </div>
      </div>
    </div>
  </div>
  <foter></foter>
</template>

<style scoped>
.certificates-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  min-height: 600px;
}

h1 {
  margin-bottom: 30px;
  text-align: center;
  color: #333;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 50px 20px;
  margin: 20px 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-left-color: #eb5757;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.browse-courses-btn {
  display: inline-block;
  background-color: #eb5757;
  color: white;
  padding: 10px 20px;
  margin-top: 20px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 600;
}

.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.certificate-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.certificate-card:hover {
  transform: translateY(-5px);
}

.certificate-header {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.course-image {
  width: 60px;
  height: 60px;
  overflow: hidden;
  border-radius: 5px;
  margin-right: 15px;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.certificate-info h3 {
  margin: 0 0 5px;
  font-size: 18px;
}

.certificate-category {
  display: inline-block;
  background-color: #f0f0f0;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
}

.certificate-details {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-label {
  font-weight: 600;
  color: #666;
}

.certificate-code {
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 2px 5px;
  border-radius: 3px;
}

.certificate-actions {
  padding: 15px;
  text-align: center;
}

.download-btn {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.2s ease;
}

.download-btn:hover {
  background-color: #d63030;
}

.btn-icon {
  margin-right: 8px;
}

.retry-btn {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px;
}
</style>
