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

onMounted(() => {
  if (route.query.email) {
    email.value = route.query.email as string;
  }
});

// --------- WERYFIKACJA KODU ---------

const submitCode = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  try {
    const response = await useApiFrontend("/auth/verify-registration", {
      method: "POST",
      body: { email: email.value, code: verificationCode.value },
    });
    if (response.message) {
      successMessage.value = response.message;
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      errorMessage.value = "Niepoprawny kod weryfikacyjny.";
    }
  } catch (error) {
    errorMessage.value = "Wystąpił błąd. Spróbuj ponownie później.";
  }
};

// --------- PONOWNE WYSŁANIE KODU ---------

const resendCode = async () => {
  try {
    await useApiFrontend("/auth/resend-code", {
      method: "POST",
      body: { email: email.value },
    });
    console.log("Weryfikacja się powiodła!");
  } catch (error) {
    console.error("Wystąpił błąd. Spróbuj ponownie później.");
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
          placeholder="Wprowadź kod weryfikacyjny "
          maxlength="6"
          required
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
        >
          <span class="underline-text">Ponownie wyślij wiadomość e-mail</span>
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
</style>
