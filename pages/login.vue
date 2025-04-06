<script setup>
definePageMeta({
  layout: "login",
  middleware: "auth",
});

import { useRouter } from "vue-router";
const router = useRouter();

const user = useUserStore();

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const onSubmit = async () => {
  try {
    const response = await useApiFrontend("/auth/login", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
      credentials: "include",
    });

    if (response.user && response.user.is_verified === false) {
      const userStore = useUserStore();
      userStore.user = {
        id: response.user.id,
        email: response.user.email,
        is_verified: false,
      };

      try {
        await useApiFrontend("/auth/resend-code", {
          method: "POST",
          body: { email: email.value },
        });
      } catch (resendError) {
        console.error("Error resending verification code:", resendError);
      }

      router.push(`/verifyRegister?email=${email.value}`);
      return;
    }

    const user = useUserStore();
    await user.fetchUser();
    navigateTo("/");
  } catch (error) {
    if (error.response?.status === 401) {
      errorMessage.value = "Błędny email lub hasło";
    } else {
      errorMessage.value = "Błąd logowania";
    }
  }
};
</script>
<template>
  <div class="login-container">
    <div class="left-section">
      <div class="left-title">
        <h1>Zdobądź swoje umiejętności z nami</h1>
        <p>
          Zdobądź prawdziwe doświadczenie dzięki naszym <br />
          kursom prowadzonym przez ekspertów, które są oparte <br />
          na ich wiedzy i doświadczeniu
        </p>
        <img
          src="../public/images/Logo.png"
          alt="Logo"
        />
      </div>
    </div>
    <div class="right-section">
      <div class="login-form">
        <div class="back-button">
          <button
            class="square-btn"
            @click="$router.push('/')"
          >
            ←
          </button>
          <span class="back-text">Powrót</span>
        </div>
        <div class="welcome-text">
          <h2>Witaj!</h2>
          <p>Zaloguj się na swoje konto.</p>
        </div>
        <div class="login-input">
          <form @submit.prevent="onSubmit">
            <div class="form-group">
              <label for="username">Email:</label>
              <input
                type="email"
                id="email"
                v-model="email"
                required
              />
            </div>
            <div class="form-group">
              <label for="password">Hasło:</label>
              <input
                type="password"
                id="password"
                v-model="password"
                required
              />
            </div>
            <p
              v-if="errorMessage"
              class="error-message"
            >
              {{ errorMessage }}
            </p>
            <!-- <button
              class="remember-button"
              type="submit"
            >
              Nie pamiętam hasła
            </button> -->
            <div class="submit-button-container">
              <button
                class="submit-button"
                type="submit"
              >
                Zaloguj się
              </button>
            </div>
          </form>
        </div>
        <hr class="brreak-line" />
        <div class="under-text">
          <a>Nie masz konta ?</a>
          <NuxtLink
            to="/register"
            class="button-classic"
          >
            Zarejestruj się
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.login-container {
  display: flex;
  height: 100vh;
}
.left-section {
  flex: 5.5;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: url("../public/images/Login-background2.png");
  background-size: cover;
}
.left-title {
  margin-top: 25vh;
}
.left-title h1 {
  margin-bottom: 20px;
  font-size: 2rem;
}

.left-title p {
  text-align: center;
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 0 auto;
  max-width: 600px;
}
.left-title img {
  margin-top: 5vh;
  margin-left: 60px;
}

.right-section {
  flex: 4.5;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-form {
  height: 100vh;
  width: 80%;
}
.back-button {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15vh;
}

.square-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #222;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
}

.square-btn:hover {
  background-color: #5e5e5e;
}

.back-text {
  font-size: 18px;
}
.welcome-text {
  text-align: center;
  margin-top: 5vh;
}
.welcome-text h2 {
  font-size: 35px;
}
.welcome-text p {
  font-size: 30px;
}

label {
  display: block;
  margin-bottom: 5px;
  text-align: left;
  margin-left: 10px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  border-radius: 10px;
}
.remember-button {
  margin-top: 2vh;
  width: 200px;
  background-color: #fff;
  color: black;
  display: block;
  margin-left: auto;
}

.submit-button {
  width: 200px;
  margin-top: 5vh;
  background-color: #222;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  text-align: center;
}

.submit-button:hover {
  background-color: #5e5e5e;
}

.remember-button:hover {
  text-decoration: underline;
}
.form-group {
  margin-top: 2vh;
}
.submit-button-container {
  display: flex;
  justify-content: center;
}
.brreak-line {
  margin-top: 5vh;
}
.under-text {
  text-align: center;
  margin-top: 5vh;
}
.under-text a {
  padding: 0 20px;
}
.button-classic {
  display: inline-block;
  width: 150px;
  background-color: #eb5757;
  color: white;
  text-align: center;
  line-height: 30px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 16px;
}
.button-classic:hover {
  background-color: red;
}
.error-message {
  color: red;
}
@media (max-width: 1024px) {
  .left-section {
    display: none;
  }

  .right-section {
    flex: 1;
  }

  .login-form {
    width: 80%;
    max-width: none;
    padding: 20px;
  }

  .submit-button {
    width: 100%;
  }

  .back-button {
    display: none;
  }

  .submit-button {
    width: 200px;
    margin-top: 5vh;
    background-color: #222;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    text-align: center;
  }
}
</style>
