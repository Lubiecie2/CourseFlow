<script setup>
definePageMeta({
  layout: "login",
  middleware: (to) => {
    if (!to.query.token) {
      return navigateTo("/resetPassword");
    }
  },
});

const route = useRoute();
const router = useRouter();

const token = computed(() => route.query.token);
const newPassword = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");
const isSuccess = ref(false);

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{10,}$/;

  if (!passwordRegex.test(password)) {
    return "Hasło musi mieć co najmniej 10 znaków, zawierać jedną dużą literę i jedną cyfrę.";
  }
  return "";
};

const handleSetNewPassword = async () => {
  if (!token.value) {
    errorMessage.value = "Nieprawidłowy token resetowania hasła";
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = "Hasła nie są zgodne";
    return;
  }

  const passwordValidationError = validatePassword(newPassword.value);
  if (passwordValidationError) {
    errorMessage.value = passwordValidationError;
    return;
  }

  try {
    await useApiFrontend("/auth/resetPassword", {
      method: "POST",
      body: {
        token: token.value,
        newPassword: newPassword.value,
      },
    });

    isSuccess.value = true;
    errorMessage.value = "";

    setTimeout(() => {
      router.push("/login");
    }, 3000);
  } catch (error) {
    console.error("Błąd podczas resetowania hasła:", error);
    errorMessage.value =
      "Wystąpił błąd podczas resetowania hasła. Token może być nieważny lub wygasły.";
  }
};
</script>

<template>
  <div class="set-password-container">
    <div class="set-password-form-wrapper">
      <div class="welcome-text">
        <h2>Ustaw nowe hasło</h2>
        <div class="title-underline"></div>
        <p v-if="!isSuccess">Wprowadź i potwierdź swoje nowe hasło.</p>
      </div>

      <div
        v-if="!isSuccess"
        class="password-input"
      >
        <form @submit.prevent="handleSetNewPassword">
          <div class="form-group">
            <label for="newPassword">Nowe hasło:</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                type="password"
                id="newPassword"
                v-model="newPassword"
                placeholder="Wprowadź nowe hasło"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Potwierdź hasło:</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                placeholder="Potwierdź nowe hasło"
                required
              />
            </div>
          </div>

          <p
            v-if="errorMessage"
            class="error-message"
          >
            <span class="error-icon">⚠️</span> {{ errorMessage }}
          </p>

          <div class="submit-button-container">
            <button
              class="submit-button"
              type="submit"
            >
              Zapisz nowe hasło
            </button>
          </div>
        </form>
      </div>

      <div
        v-else
        class="success-message"
      >
        <div class="success-icon">✓</div>
        <p>
          Twoje hasło zostało pomyślnie zmienione. Za chwilę zostaniesz
          przekierowany do strony logowania.
        </p>
        <div class="submit-button-container">
          <button
            class="submit-button"
            @click="router.push('/login')"
          >
            Przejdź do logowania
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.set-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
  box-sizing: border-box;
  background-image: linear-gradient(to bottom right, #f9f9f9, #f0f0f0);
}

.set-password-form-wrapper {
  background-color: white;
  padding: 30px 35px;
  border-radius: 12px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;
}

.welcome-text {
  margin-bottom: 25px;
}

.welcome-text h2 {
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

.welcome-text p {
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #444;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
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

input:disabled {
  background-color: #f9f9f9;
  cursor: not-allowed;
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
}

.error-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.submit-button-container {
  margin-top: 20px;
}

.submit-button {
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-button:hover {
  background-color: #d64545;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(235, 87, 87, 0.15);
}

.submit-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(235, 87, 87, 0.1);
}

.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;
}

.success-message .submit-button {
  width: auto;
  min-width: 180px;
  white-space: nowrap;
  margin-top: 10px;
}

.success-icon {
  background-color: #2ecc71;
  color: white;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 20px;
  animation: pulse 1.5s ease-in-out;
}

.success-message p {
  color: #2c3e50;
  margin-bottom: 20px;
  line-height: 1.7;
  background-color: #f0fdf4;
  padding: 15px;
  border-radius: 10px;
  font-size: 14px;
  border-left: 3px solid #2ecc71;
  text-align: left;
}

@media (max-width: 480px) {
  .set-password-form-wrapper {
    padding: 25px 20px;
    margin-top: 15px;
    margin-bottom: 15px;
  }

  .welcome-text h2 {
    font-size: 20px;
  }

  .title-underline {
    margin-bottom: 10px;
    width: 40px;
  }

  .welcome-text p {
    font-size: 13px;
    margin-bottom: 20px;
  }

  label {
    font-size: 13px;
  }

  input {
    padding: 12px 12px 12px 40px;
    font-size: 14px;
  }

  .input-icon {
    font-size: 16px;
  }

  .submit-button {
    padding: 12px 20px;
    font-size: 14px;
  }

  .error-message {
    font-size: 13px;
    padding: 10px;
  }

  .success-message p {
    font-size: 13px;
  }

  .success-icon {
    width: 55px;
    height: 55px;
    font-size: 26px;
  }
}
</style>
