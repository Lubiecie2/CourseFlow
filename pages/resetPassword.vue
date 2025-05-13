<script setup>
definePageMeta({
  layout: "login",
});

const email = ref("");
const isSubmitted = ref(false);
const errorMessage = ref("");
const isSubmitting = ref(false);
const router = useRouter();

const handleResetPassword = async () => {
  if (!email.value) {
    errorMessage.value = "Proszę podać adres email";
    return;
  }

  try {
    isSubmitting.value = true;
    errorMessage.value = "";

    await useApiFrontend("/auth/resetPasswordRequest", {
      method: "POST",
      body: { email: email.value },
    });

    isSubmitted.value = true;

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (error) {
    console.error("Błąd podczas wysyłania żądania resetowania hasła:", error);

    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value =
        "Wystąpił błąd podczas wysyłania żądania. Spróbuj ponownie później.";
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="verify-container">
    <div class="verify-content">
      <div class="back-nav">
        <button
          class="back-button-icon-only"
          @click="$router.push('/login')"
        >
          ←
        </button>
      </div>

      <div class="title-section">
        <h2>Resetowanie hasła</h2>
        <div class="title-underline"></div>
      </div>

      <transition
        name="fade"
        mode="out-in"
      >
        <div
          v-if="!isSubmitted"
          class="reset-form"
        >
          <p class="description">
            Wprowadź swój adres email powiązany z kontem. Wyślemy Ci link
            umożliwiający ustawienie nowego hasła.
          </p>

          <div class="input-container">
            <div class="input-icon">✉️</div>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Wprowadź adres email"
              required
              @keyup.enter="handleResetPassword"
            />
          </div>

          <div
            v-if="errorMessage"
            class="error-message"
          >
            <span class="error-icon">⚠️</span> {{ errorMessage }}
          </div>

          <div class="button-container">
            <button
              @click="handleResetPassword"
              :disabled="isSubmitting || !email"
              class="verify-button"
              :class="{ loading: isSubmitting }"
            >
              <span v-if="isSubmitting">
                <span class="spinner"></span> Wysyłanie...
              </span>
              <span v-else>Zresetuj hasło</span>
            </button>
          </div>
        </div>

        <div
          v-else
          class="success-container"
        >
          <div class="success-icon">✓</div>
          <p class="success-text">
            Jeśli podany adres email istnieje w naszej bazie, wysłaliśmy na
            niego link do resetowania hasła. Sprawdź swoją skrzynkę odbiorczą
            (oraz folder spam).
          </p>
          <NuxtLink
            to="/login"
            class="verify-button"
          >
            Powrót do logowania
          </NuxtLink>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.verify-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
  box-sizing: border-box;
  background-image: linear-gradient(to bottom right, #f9f9f9, #f0f0f0);
}

.verify-content {
  background-color: white;
  padding: 30px 35px;
  border-radius: 12px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.back-nav {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  text-align: left;
  width: 100%;
  height: 36px;
}

.back-button-icon-only {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  background-color: #f5f5f5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
  font-size: 18px;
  line-height: 1;
}

.back-button-icon-only:hover {
  background-color: #eb5757;
  color: white;
  transform: translateX(-2px);
}

.title-section {
  margin-bottom: 20px;
  width: 100%;
}

h2 {
  font-size: 24px;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
}

.title-underline {
  height: 3px;
  width: 50px;
  background-color: #eb5757;
  margin: 0 auto 15px auto;
  border-radius: 2px;
}

.description {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.6;
  font-size: 14px;
}

.input-container {
  margin-bottom: 20px;
  position: relative;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
  font-size: 17px;
  pointer-events: none;
}

input {
  width: 100%;
  padding: 13px 15px 13px 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

input:focus {
  outline: none;
  border-color: #eb5757;
  box-shadow: 0 0 0 3px rgba(235, 87, 87, 0.1);
}

.error-message {
  background-color: #fff5f5;
  color: #e53e3e;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  border-left: 3px solid #e53e3e;
  font-size: 14px;
  text-align: left;
  width: 100%;
}

.error-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.button-container {
  margin-top: 20px;
  width: 100%;
}

.verify-button {
  background-color: #eb5757;
  color: white;
  border: none;
  padding: 13px 25px;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.verify-button:hover:not(:disabled) {
  background-color: #d64545;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(235, 87, 87, 0.15);
}

.verify-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(235, 87, 87, 0.1);
}

.verify-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.loading {
  background-color: #f08080 !important;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.success-container .verify-button {
  width: auto;
  min-width: 180px;
  max-width: 250px;
  text-decoration: none;
  margin-top: 10px;
}

.success-icon {
  background-color: #2ecc71;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  margin-bottom: 20px;
  animation: pulse 1.5s ease-in-out;
}

.success-text {
  color: #2c3e50;
  margin-bottom: 15px;
  line-height: 1.6;
  background-color: #f0fdf4;
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 14px;
  border-left: 3px solid #2ecc71;
  text-align: left;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 480px) {
  .verify-content {
    padding: 25px 20px;
    margin-top: 15px;
    margin-bottom: 15px;
  }

  .back-nav {
    margin-bottom: 20px;
  }

  .title-section {
    margin-top: 5px;
  }

  h2 {
    font-size: 22px;
  }

  .verify-button {
    padding: 12px 20px;
    font-size: 14px;
  }

  .input-container {
    margin-bottom: 15px;
  }

  input {
    padding: 12px 12px 12px 40px;
    font-size: 14px;
  }

  .input-icon {
    font-size: 16px;
  }

  .error-message {
    font-size: 13px;
    padding: 10px;
  }

  .success-text {
    font-size: 13px;
  }

  .success-icon {
    width: 55px;
    height: 55px;
    font-size: 28px;
  }
}
</style>
