<template>
  <div>
    <div class="footer">
      <div class="footer-block">
        <div class="footer-logo">
          <img
            src="../public/images/Logo.png"
            alt="Logo"
          />
          <span class="break-line" />
          <span class="platform-name">Platforma<br />Szkoleniowa</span>
        </div>

        <div class="footer-link">
          <nuxt-link
            to="#"
            class="footer-link-item"
            >O nas</nuxt-link
          >
          <nuxt-link
            to="#"
            class="footer-link-item"
            >Kontakt</nuxt-link
          >
          <nuxt-link
            to="#"
            class="footer-link-item"
            >Opinie</nuxt-link
          >
        </div>

        <div class="footer-social">
          <a class="social-title">Znajdź nas na:</a>
          <div class="social-img">
            <a
              href="#"
              class="social-icon"
            >
              <img
                src="../public/images/facebook.png"
                alt="Facebook"
              />
            </a>
            <a
              href="#"
              class="social-icon"
            >
              <img
                src="../public/images/instagram.png"
                alt="Instagram"
              />
            </a>
            <a
              href="#"
              class="social-icon"
            >
              <img
                src="../public/images/whatsapp.png"
                alt="Whatsapp"
              />
            </a>
          </div>
        </div>
      </div>
      <div class="footer-text">
        <a>© 2025 CourseFlow. All rights reserved</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.footer {
  background-color: #f5f2ee;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.break-line {
  width: 1px;
  height: 5vh;
  background-color: black;
  border: none;
  margin: 0 5px;
}

.platform-name {
  font-weight: bold;
  font-size: 1vw;
  margin-left: 10px;
}

.footer-block {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.footer-logo {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
  flex: 1 1 200px;
}

.footer-logo img {
  width: 170px;
  height: auto;
  margin-right: 10px;
}

.footer-brand {
  font-size: 16px;
  color: #333;
}

.footer-link {
  display: flex;
  flex-direction: column;
  text-align: center;
  flex: 1 1 200px;
  margin-bottom: 20px;
}

.footer-link-item {
  color: #333;
  font-size: 16px;
  text-decoration: none;
  padding: 5px 0;
}

.footer-link-item:hover {
  color: #0073e6;
}

.footer-social {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 200px;
  text-align: center;
  margin-bottom: 20px;
}

.social-title {
  color: #333;
  font-size: 16px;
  margin-bottom: 10px;
}

.social-img {
  display: flex;
  gap: 10px;
}

.social-icon img {
  height: 40px;
  width: 40px;
  transition: transform 0.3s;
}

.social-icon img:hover {
  transform: scale(1.1);
}

.footer-text {
  text-align: center;
  color: #333;
  font-size: 14px;
}

@media (max-width: 768px) {
  .footer-block {
    flex-direction: column;
    text-align: center;
  }
  .footer-logo,
  .footer-link,
  .footer-social {
    flex: 1 1 100%;
    margin-bottom: 20px;
  }
}
</style>
