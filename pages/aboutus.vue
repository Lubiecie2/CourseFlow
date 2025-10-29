<script setup>
definePageMeta({
  layout: "login",
});

import { ref, onMounted } from "vue";

const isVisible = ref(false);
const teamMembers = ref([
  {
    name: "Kamil Gruca",
    role: "CEO & Założyciel",
    bio: "Ekspert z 10-letnim doświadczeniem w edukacji online, pasjonat nowoczesnych metod nauczania.",
    image: "/images/recenzant2.jpg",
  },
  {
    name: "Jakub Tokarczyk",
    role: "CEO & Założyciel",
    bio: "Pasjonat technologii i strażak z powołania.",
    image: "/images/recenzant3.jpg",
  },
  {
    name: "Dominik Żuchowicz",
    role: "CEO & Założyciel",
    bio: "Pasjonat technologii.",
    image: "/images/recenzant3.jpg",
  },
]);

const milestones = ref([
  {
    year: "2025",
    title: "Narodziny pomysłu",
    desc: "CourseFlow zaczyna się jako pomysł grupy entuzjastów edukacji.",
  },
  {
    year: "2025",
    title: "Pierwsze kursy",
    desc: "Tworzymy pierwsze kursy pilotażowe i zdobywamy pierwszych uczniów.",
  },
  {
    year: "2025",
    title: "Oficjalny start",
    desc: "Oficjalnie wprowadzamy CourseFlow na rynek edukacji online.",
  },
  {
    year: "2025",
    title: "Wzrost i rozwój",
    desc: "Rozszerzamy ofertę kursów i zdobywamy tysiące uczniów.",
  },
  {
    year: "2025",
    title: "Innowacje",
    desc: "Wprowadzamy innowacyjne funkcje i interaktywne metody nauczania.",
  },
  {
    year: "2025",
    title: "Globalna ekspansja",
    desc: "Rozpoczynamy ekspansję na rynki międzynarodowe.",
  },
]);

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true;
  }, 300);
});
</script>

<template>
  <mainNavbar></mainNavbar>
  <div class="about-container">
    <section class="story-section">
      <div class="section-container">
        <div class="section-header">
          <h2>Nasza historia</h2>
          <div class="underline"></div>
        </div>
        <div class="story-content">
          <div class="story-text">
            <p>
              CourseFlow powstał z pasji do edukacji i technologii. Zaczęliśmy
              jako mała grupa entuzjastów, którzy wierzyli, że wysokiej jakości
              edukacja powinna być dostępna dla każdego, niezależnie od miejsca
              zamieszkania czy statusu społecznego.
            </p>
            <p>
              W 2025 roku, zainspirowany własnymi doświadczeniami edukacyjnymi,
              nasz założyciel rozpoczął pracę nad platformą, która miała
              zrewolucjonizować sposób, w jaki ludzie się uczą. Niedułgo
              później, CourseFlow oficjalnie rozpoczął swoją działalność,
              oferując kursy z różnych dziedzin - od programowania, przez
              matematykę, po języki obce.
            </p>
            <p>
              Dziś, CourseFlow to dynamicznie rozwijająca się platforma
              edukacyjna, która łączy najnowsze osiągnięcia technologiczne z
              najlepszymi praktykami pedagogicznymi, aby dostarczać angażujące i
              skuteczne doświadczenia edukacyjne.
            </p>
          </div>
          <div class="story-image">
            <img
              src="/public/images/teamwork.jpg"
              alt="Historia CourseFlow"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="values-section">
      <div class="section-container">
        <div class="section-header">
          <h2>Nasze wartości</h2>
          <div class="underline"></div>
        </div>
        <div class="values-grid">
          <div class="value-card">
            <div class="value-icon">🎯</div>
            <h3>Dostępność</h3>
            <p>
              Wierzymy, że wysokiej jakości edukacja powinna być dostępna dla
              wszystkich, niezależnie od ograniczeń geograficznych czy
              finansowych.
            </p>
          </div>
          <div class="value-card">
            <div class="value-icon">💡</div>
            <h3>Innowacyjność</h3>
            <p>
              Nieustannie poszukujemy nowych, lepszych sposobów przekazywania
              wiedzy i angażowania uczniów.
            </p>
          </div>
          <div class="value-card">
            <div class="value-icon">🤝</div>
            <h3>Współpraca</h3>
            <p>
              Tworzymy społeczność, w której uczniowie i nauczyciele
              współpracują, wspierają się i inspirują nawzajem.
            </p>
          </div>
          <div class="value-card">
            <div class="value-icon">🌱</div>
            <h3>Rozwój</h3>
            <p>
              Promujemy ciągły rozwój osobisty i zawodowy, zarówno wśród naszych
              uczniów, jak i w naszym zespole.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="team-section">
      <div class="section-container">
        <div class="section-header">
          <h2>Nasz zespół</h2>
          <div class="underline"></div>
        </div>
        <p class="team-intro">
          Za sukcesem CourseFlow stoi zespół pasjonatów edukacji, technologii i
          rozwoju osobistego. Poznaj ludzi, którzy codziennie pracują nad tym,
          aby dostarczać Ci najlepsze doświadczenia edukacyjne.
        </p>
        <div class="team-grid">
          <div
            v-for="(member, index) in teamMembers"
            :key="index"
            class="team-member"
          >
            <div class="member-image">
              <img
                :src="member.image"
                :alt="member.name"
              />
            </div>
            <div class="member-info">
              <h3>{{ member.name }}</h3>
              <h4>{{ member.role }}</h4>
              <h5>
                Link do platformy GitHub:
                <a
                  :href="member.github"
                  target="_blank"
                  >{{ member.github }}</a
                >
              </h5>
              <p>{{ member.bio }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="timeline-section">
      <div class="section-container">
        <div class="section-header">
          <h2>Nasza droga</h2>
          <div class="underline"></div>
        </div>
        <div class="timeline">
          <div
            v-for="(milestone, index) in milestones"
            :key="index"
            class="timeline-item"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-year">{{ milestone.year }}</div>
              <h3>{{ milestone.title }}</h3>
              <p>{{ milestone.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  <foter></foter>
</template>

<style scoped>
.about-container {
  overflow-x: hidden;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-header h2 {
  font-size: 36px;
  color: #333;
  margin-bottom: 15px;
}

.underline {
  height: 4px;
  width: 70px;
  background-color: #eb5757;
  margin: 0 auto;
}

.story-content {
  display: flex;
  gap: 40px;
  align-items: center;
}

.story-text {
  flex: 1;
}

.story-text p {
  margin-bottom: 20px;
  line-height: 1.8;
  color: #555;
}

.story-image {
  flex: 1;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.story-image img {
  width: 100%;
  height: auto;
  display: block;
}

.values-section {
  background-color: #f9f9f9;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.value-card {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.value-card:hover {
  transform: translateY(-10px);
}

.value-icon {
  font-size: 40px;
  margin-bottom: 20px;
}

.value-card h3 {
  font-size: 22px;
  margin-bottom: 15px;
  color: #333;
}

.value-card p {
  color: #666;
  line-height: 1.6;
}

.team-intro {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 50px;
  color: #555;
  line-height: 1.8;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.team-member {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.team-member:hover {
  transform: translateY(-10px);
}

.member-image {
  height: 300px;
  overflow: hidden;
}

.member-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-info {
  padding: 20px;
}

.member-info h3 {
  font-size: 22px;
  margin-bottom: 5px;
  color: #333;
}

.member-info h4 {
  font-size: 20px;
  color: #eb5757;
  margin-bottom: 10px;
}

.member-info h5 {
  font-size: 18px;
  margin-bottom: 10px;
}

.member-info a {
  text-decoration: underline;
  color: #eb5757;
}

.member-info p {
  color: #666;
  line-height: 1.6;
}

.timeline-section {
  background-color: #f9f9f9;
}

.timeline {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.timeline::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  background-color: #eb5757;
}

.timeline-item {
  position: relative;
  margin-bottom: 50px;
}

.timeline-dot {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #eb5757;
  z-index: 1;
}

.timeline-content {
  position: relative;
  width: 45%;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.timeline-item:nth-child(odd) .timeline-content {
  margin-left: auto;
}

.timeline-year {
  display: inline-block;
  padding: 5px 10px;
  background-color: #eb5757;
  color: white;
  border-radius: 4px;
  font-weight: bold;
  margin-bottom: 10px;
}

.timeline-content h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #333;
}

.timeline-content p {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .story-content {
    flex-direction: column;
  }

  .timeline::before {
    left: 30px;
  }

  .timeline-dot {
    left: 30px;
  }

  .timeline-content {
    width: calc(100% - 60px);
    margin-left: 60px !important;
  }
}

@media (max-width: 768px) {
  .section-header h2 {
    font-size: 30px;
  }

  .values-grid {
    grid-template-columns: 1fr;
  }

  .team-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .section-container {
    padding: 60px 20px;
  }
}
</style>
