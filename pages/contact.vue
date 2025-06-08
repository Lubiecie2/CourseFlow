<script setup>
definePageMeta({
  layout: "login",
});

const errorMessage = ref("");
const isLoading = ref(false);
const formStatus = ref({
  submitted: false,
  success: false,
  message: "",
});
const contactForm = ref({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const submitForm = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    const response = await useApiFrontend("/contact", {
      method: "POST",
      body: {
        name: contactForm.value.name,
        email: contactForm.value.email,
        subject: contactForm.value.subject,
        message: contactForm.value.message,
      },
    });

    formStatus.value = {
      submitted: true,
      success: true,
      message: "Wiadomość została wysłana. Skontaktujemy się z Tobą wkrótce!",
    };

    contactForm.value = {
      name: "",
      email: "",
      subject: "",
      message: "",
    };

    setTimeout(() => {
      formStatus.value.submitted = false;
    }, 5000);
  } catch (error) {
    console.error("Błąd podczas wysyłania wiadomości:", error);

    formStatus.value = {
      submitted: true,
      success: false,
      message:
        "Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.",
    };
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <mainNavbar></mainNavbar>

  <div class="contact-container">
    <div class="contact-header">
      <h1>Skontaktuj się z nami</h1>
      <div class="underline"></div>
      <p>
        Jesteśmy tutaj, aby odpowiedzieć na Twoje pytania i pomóc Ci w najlepszy
        możliwy sposób.
      </p>
    </div>

    <div class="contact-content">
      <div class="contact-info">
        <div class="info-card">
          <div class="info-icon">📍</div>
          <h3>Adres</h3>
          <p>ul. Zamenhofa 1a</p>
          <p>33-300 Nowy Sącz</p>
        </div>

        <div class="info-card">
          <div class="info-icon">📞</div>
          <h3>Telefon</h3>
          <p>+48 123 456 789</p>
          <p>Poniedziałek - Piątek, 9:00 - 17:00</p>
        </div>

        <div class="info-card">
          <div class="info-icon">✉️</div>
          <h3>Email</h3>
          <p>kontakt@courseflow.pl</p>
          <p>wsparcie@courseflow.pl</p>
        </div>

        <div class="info-card">
          <div class="info-icon">🕒</div>
          <h3>Godziny pracy</h3>
          <p>Poniedziałek - Piątek: 9:00 - 17:00</p>
          <p>Weekendy: Zamknięte</p>
        </div>
      </div>

      <div class="contact-form-container">
        <h2>Wyślij wiadomość</h2>
        <form
          class="contact-form"
          @submit.prevent="submitForm"
        >
          <div class="form-group">
            <label for="name">Imię i nazwisko</label>
            <input
              type="text"
              id="name"
              v-model="contactForm.name"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="contactForm.email"
              required
            />
          </div>

          <div class="form-group">
            <label for="subject">Temat</label>
            <input
              type="text"
              id="subject"
              v-model="contactForm.subject"
              required
            />
          </div>

          <div class="form-group">
            <label for="message">Wiadomość</label>
            <textarea
              id="message"
              v-model="contactForm.message"
              rows="5"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            class="submit-button"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Wysyłanie...</span>
            <span v-else>Wyślij wiadomość</span>
          </button>

          <div
            v-if="formStatus.submitted"
            class="form-status"
            :class="{ success: formStatus.success }"
          >
            {{ formStatus.message }}
          </div>
        </form>
      </div>
    </div>

    <div class="map-container">
      <h2>Znajdź nas</h2>
      <div class="map-wrapper">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2585.4162389314497!2d20.70228525440328!3d49.608757029050025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473de53b65b66de1%3A0x8245ea69a763e717!2sLudwika%20Zamenhofa%2C%2033-300%20Nowy%20S%C4%85cz!5e0!3m2!1spl!2spl!4v1746868467318!5m2!1spl!2spl"
          width="100%"
          height="450"
          style="border: 0"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        >
        </iframe>
      </div>
    </div>

    <div class="faq-container">
      <h2>Często zadawane pytania</h2>
      <div class="faq-list">
        <div class="faq-item">
          <h3>Jak mogę się zapisać na kurs?</h3>
          <p>
            Aby zapisać się na kurs, należy założyć konto na naszej platformie,
            a następnie wybrać interesujący Cię kurs i kliknąć przycisk "Zapisz
            się".
          </p>
        </div>

        <div class="faq-item">
          <h3>Czy w przyszłości będą dostępne inne kurys?</h3>
          <p>
            Tak, w przyszłosci planujemy dodanie nowych kursów i dalszy rozwój
            strony.
          </p>
        </div>

        <div class="faq-item">
          <h3>Jak długo mam dostęp do kursu?</h3>
          <p>
            Po dołączeniu do kursu masz do niego bezterminowy dostęp, możesz
            wracać do materiałów w dowolnym momencie.
          </p>
        </div>

        <div class="faq-item">
          <h3>Czy kursy posiadają certyfikaty ukończenia?</h3>
          <p>
            Tak, po ukończeniu kursu i zaliczeniu wszystkich testów otrzymasz
            certyfikat ukończenia, który możesz pobrać i udostępniać.
          </p>
        </div>
      </div>
    </div>
  </div>

  <foter></foter>
</template>

<style scoped>
.contact-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: Arial, sans-serif;
}

.contact-header {
  text-align: center;
  margin-bottom: 60px;
}

.contact-header h1 {
  font-size: 42px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.underline {
  width: 80px;
  height: 4px;
  background-color: #eb5757;
  margin: 0 auto 20px;
}

.contact-header p {
  font-size: 18px;
  color: #555;
  max-width: 700px;
  margin: 0 auto;
}

.contact-content {
  display: flex;
  flex-wrap: wrap;
  gap: 50px;
  margin-bottom: 60px;
}

.contact-info {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.info-card {
  background-color: #f8f8f8;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.info-icon {
  font-size: 32px;
  margin-bottom: 15px;
}

.info-card h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.info-card p {
  font-size: 16px;
  color: #555;
  line-height: 1.5;
  margin-bottom: 8px;
}

.contact-form-container {
  flex: 1;
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.contact-form-container h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 25px;
  color: #333;
}

.contact-form .form-group {
  margin-bottom: 20px;
}

.contact-form label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.contact-form input:focus,
.contact-form textarea:focus {
  border-color: #eb5757;
  outline: none;
}

.submit-button {
  background-color: #eb5757;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  margin-top: 10px;
}

.submit-button:hover {
  background-color: #d64545;
}

.form-status {
  margin-top: 20px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f8d7da;
  color: #721c24;
  text-align: center;
}

.form-status.success {
  background-color: #d4edda;
  color: #155724;
}

.map-container {
  margin-bottom: 60px;
}

.map-container h2 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 25px;
  color: #333;
  text-align: center;
}

.map-wrapper {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.faq-container {
  margin-bottom: 60px;
}

.faq-container h2 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 25px;
  color: #333;
  text-align: center;
}

.faq-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 25px;
}

.faq-item {
  background-color: #f8f8f8;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.faq-item h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.faq-item p {
  font-size: 16px;
  color: #555;
  line-height: 1.6;
}

@media (max-width: 960px) {
  .contact-content {
    flex-direction: column;
  }

  .contact-info {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .faq-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .contact-header h1 {
    font-size: 32px;
  }

  .contact-form-container {
    padding: 20px;
  }
}
</style>
