<script setup>
import { ref } from "vue";

const name = ref("");
const email = ref("");
const message = ref("");
const successMessage = ref("");
const errorMessage = ref("");

// const sendEmail = async () => {
//   successMessage.value = "";
//   errorMessage.value = "";

//   try {
//     const response = await fetch("http://localhost:3001/send-email", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         name: name.value,
//         email: email.value,
//         message: message.value,
//       }),
//     });

//     const data = await response.json();
//     if (data.success) {
//       successMessage.value = "Wiadomość wysłana!";
//       name.value = "";
//       email.value = "";
//       message.value = "";
//     } else {
//       errorMessage.value = "Błąd wysyłania wiadomości.";
//     }
//   } catch (error) {
//     errorMessage.value = "Błąd połączenia z serwerem.";
//   }
// };

const onSubmit = async () => {
  try {
    const response = await $Fetch("/send-email", {
      baseURL: "http://localhost:4000",
      method: "POST",
      body: {
        name: name.value,
        email: email.value,
        message: message.value,
      },
    });
    errorMessage.value = "E-mail wysłany poprawnie!";
    isError.value = false;
    name.value = "";
    email.value = "";
    message.value = "";
  } catch (error) {
    isError.value = true;
    if (error.response?.status === 400) {
      errorMessage.value = "Wszystkie pola są wymagane";
    } else {
      errorMessage.value = "Błąd wysyłania e-maila";
    }
  }
};
</script>

<template>
  <div class="contact">
    <div class="contact-container">
      <h2>Napisz do nas</h2>
      <form @submit.prevent="sendEmail">
        <input
          v-model="name"
          type="text"
          placeholder="Twoje imię"
          required
        />
        <input
          v-model="email"
          type="email"
          placeholder="Twój email"
          required
        />
        <textarea
          v-model="message"
          placeholder="Twoja wiadomość"
          required
        ></textarea>
        <button type="submit">Wyślij</button>
      </form>
      <p
        v-if="successMessage"
        class="success"
      >
        {{ successMessage }}
      </p>
      <p
        v-if="errorMessage"
        class="error"
      >
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.contact {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.contact-container {
  width: 400px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}
.contact-container h2 {
  margin-bottom: 20px;
  color: #333;
}
input,
textarea {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
}
textarea {
  height: 100px;
  resize: none;
}
button {
  width: 100%;
  padding: 12px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:hover {
  background-color: #555;
}
.success {
  color: green;
  margin-top: 15px;
}
.error {
  color: red;
  margin-top: 15px;
}
</style>
