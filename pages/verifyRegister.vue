<script setup lang="ts">
definePageMeta({
  layout: "login",
});
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const verificationCode = ref("");
const email = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const router = useRouter();
const route = useRoute();
const isResending = ref(false);
const resendMessage = ref("");

onMounted(() => {
  if (route.query.email) {
    email.value = route.query.email as string;
  }
});

// --------- WERYFIKACJA KODU ---------

const submitCode = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  const cleanCode = verificationCode.value.trim();
  if (!cleanCode || cleanCode.length !== 8) {
    errorMessage.value = "Kod weryfikacyjny musi zawierać 8 znaków";
    return;
  }

  try {
    const response = await useApiFrontend("/auth/verify-registration", {
      method: "POST",
      body: {
        email: email.value.trim(),
        code: cleanCode,
      },
    });

    if (response && response.message) {
      successMessage.value = response.message;
      errorMessage.value = "";
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else if (response && response.error) {
      errorMessage.value = response.error;
      successMessage.value = "";
    } else {
      errorMessage.value = "Niepoprawny kod weryfikacyjny.";
      successMessage.value = "";
    }
  } catch (error: any) {
    console.error("Błąd weryfikacji:", error);
    successMessage.value = "";

    if (error.response?.data?.error) {
      errorMessage.value = error.response.data.error;
    } else {
      errorMessage.value = "Wystąpił błąd. Spróbuj ponownie później.";
    }
  }
};

// --------- PONOWNE WYSŁANIE KODU ---------

const resendCode = async () => {
  if (isResending.value) return;

  try {
    isResending.value = true;
    resendMessage.value = "";
    errorMessage.value = "";

    const response = await useApiFrontend("/auth/resend-code", {
      method: "POST",
      body: { email: email.value },
    });

    resendMessage.value =
      "Kod weryfikacyjny został ponownie wysłany na Twój adres email.";
    setTimeout(() => {
      resendMessage.value = "";
    }, 5000);
  } catch (error: any) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error &&
      error.response.data.error.includes("Proszę poczekać")
    ) {
      resendMessage.value =
        "Proszę poczekać 2 minuty przed ponownym wysłaniem kodu.";
    } else {
      resendMessage.value =
        "Wystąpił błąd podczas wysyłania kodu. Spróbuj ponownie później.";
    }
    console.error("Błąd ponownego wysłania kodu:", error);
  } finally {
    isResending.value = false;
  }
};
</script>

<template>
  <div class="verify-container">
    <div class="verify-content">
      <h2>Sprawdź skrzynkę odbiorczą</h2>
      <p>
        Wprowadź kod weryfikacyjny, który właśnie przesłaliśmy na adres
        {{ email }}
      </p>

      <div class="input-container">
        <input
          type="text"
          id="verificationCode"
          v-model="verificationCode"
          placeholder="Wprowadź kod weryfikacyjny"
          maxlength="8"
          required
          @input="verificationCode = verificationCode.replace(/\s/g, '')"
        />
      </div>

      <div
        v-if="errorMessage"
        class="error-message"
      >
        <span class="error-icon">&#x2716;</span> {{ errorMessage }}
      </div>
      <div
        v-if="successMessage"
        class="success-message"
      >
        <span class="success-icon">&#x2714;</span> {{ successMessage }}
      </div>

      <div
        v-if="resendMessage"
        class="resend-message"
        :class="{
          'error-message':
            resendMessage.includes('błąd') ||
            resendMessage.includes('Proszę poczekać'),
          'success-message':
            !resendMessage.includes('błąd') &&
            !resendMessage.includes('Proszę poczekać'),
        }"
      >
        <span
          v-if="
            resendMessage.includes('błąd') ||
            resendMessage.includes('Proszę poczekać')
          "
          class="error-icon"
          >&#x2716;</span
        >
        <span
          v-else
          class="success-icon"
          >&#x2714;</span
        >
        {{ resendMessage }}
      </div>

      <div class="button-container">
        <button
          @click="submitCode"
          :disabled="!verificationCode"
          class="verify-button"
        >
          Kontynuuj
        </button>
      </div>

      <div class="resend-container">
        <p
          class="resend-text"
          @click="resendCode"
          :class="{ disabled: isResending }"
        >
          <span class="underline-text">
            <span v-if="isResending">Wysyłanie...</span>
            <span v-else>Ponownie wyślij wiadomość e-mail</span>
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verify-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f8f8;
}

.verify-content {
  background-color: white;
  padding: 40px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

h2 {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

p {
  margin-bottom: 20px;
  font-size: 16px;
  color: #555;
}

.input-container {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  text-align: center;
}

input:focus {
  outline: none;
  border-color: #4caf50;
}

.error-message {
  color: #f44336;
  font-size: 14px;
  display: flex;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 20px;
  padding: 8px 12px;
  border: 1px solid #f44336;
  border-radius: 8px;
}

.error-icon {
  margin-right: 8px;
  font-size: 18px;
}

.success-message {
  color: #4caf50;
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 20px;
  padding: 8px 12px;
  border: 1px solid #4caf50;
  border-radius: 8px;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.verify-button {
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.verify-button:hover {
  background-color: #45a049;
}

.verify-button:disabled {
  background-color: #dcdcdc;
  cursor: not-allowed;
}

.resend-container {
  margin-top: 20px;
}

.resend-text {
  font-size: 14px;
  color: #555;
}

.underline-text {
  color: black;
  text-decoration: underline;
  cursor: pointer;
}

.underline-text:hover {
  color: black;
}

.resend-message {
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 20px;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.success-icon {
  margin-right: 8px;
  font-size: 18px;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
}
</style>
