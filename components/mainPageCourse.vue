<script lang="ts" setup></script>

<template>
  <div>
    <h2 class="course-header">
      Wybierz swój kurs i rozwijaj swoje umiejętności!
    </h2>
    <div class="main-course-container">
      <div class="course-block">
        <div class="course-block-img">
          <img
            src="/public/images/fizyka.jpg"
            alt="img"
          />
        </div>
        <div class="course-block-text">
          <h3>Tytuł kursu</h3>
          <p>
            Krótki opis kursu, który zachęci Cię do poznania jego zawartości.
          </p>
        </div>
        <div class="course-block-button">
          <button class="ctta-button">Więcej informacji</button>
        </div>
      </div>
      <div class="course-block">
        <div class="course-block-img">
          <img
            src="/public/images/math.jpg"
            alt="img"
          />
        </div>
        <div class="course-block-text">
          <h3>Tytuł kursu</h3>
          <p>
            Krótki opis kursu, który zachęci Cię do poznania jego zawartości.
          </p>
        </div>
        <div class="course-block-button">
          <button class="ctta-button">Więcej informacji</button>
        </div>
      </div>
      <div class="course-block">
        <div class="course-block-img">
          <img
            src="/public/images/programmer.jpg"
            alt="img"
          />
        </div>
        <div class="course-block-text">
          <h3>Tytuł kursu</h3>
          <p>
            Krótki opis kursu, który zachęci Cię do poznania jego zawartości.
          </p>
        </div>
        <div class="course-block-button">
          <button class="ctta-button">Więcej informacji</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.course-header {
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  margin: 120px auto 20px auto;
  opacity: 0;
  animation: slideIn 0.5s ease-out forwards;
  animation-delay: 0.1s;
}

.main-course-container {
  min-height: 900px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.course-block {
  height: 580px;
  width: 400px;
  background-color: white;
  margin: 0 40px;
  margin-bottom: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  opacity: 0;
  animation: slideIn 0.5s ease-out forwards;
}

.course-block:nth-child(1) {
  animation-delay: 0.2s;
}

.course-block:nth-child(2) {
  animation-delay: 0.4s;
}

.course-block:nth-child(3) {
  animation-delay: 0.6s;
}

.course-block:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.course-block-img {
  width: 100%;
  height: 400px;
}

.course-block-img img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.course-block h3 {
  margin: 20px 0 5px 0;
  font-size: 20px;
  font-weight: bold;
}

.course-block-text {
  margin: 0 20px;
}

.course-block-button {
  margin-top: 15px;
  margin-left: 20px;
  text-align: center;
}

.course-block p {
  margin: 0;
  font-size: 16px;
}

.ctta-button {
  background-color: #333;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 16px;
}

.ctta-button:hover {
  background-color: #555;
}

@media (max-width: 1200px) {
  .main-course-container {
    flex-direction: column;
    align-items: center;
  }
  .course-block {
    width: 90%;
  }
}
</style>
