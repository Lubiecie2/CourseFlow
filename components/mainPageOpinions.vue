<template>
  <div class="testimonial-carousel">
    <div class="testimonial-content">
      <button
        @click="prevSlide"
        class="arrow left"
      >
        &#10094;
      </button>

      <div class="testimonial-wrapper">
        <div
          class="testimonial"
          v-for="(slide, index) in slides"
          :key="index"
          :class="{ active: currentIndex === index }"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div class="testimonial-info">
            <img
              :src="slide.image"
              alt="user image"
              class="avatar"
            />
            <h3>{{ slide.name }}</h3>
            <p class="website">{{ slide.website }}</p>
            <p class="review">{{ slide.text }}</p>
          </div>
        </div>
      </div>

      <button
        @click="nextSlide"
        class="arrow right"
      >
        &#10095;
      </button>
    </div>

    <div class="dots">
      <span
        v-for="(t, index) in slides"
        :key="index"
        :class="{ active: index === currentIndex }"
        @click="goToSlide(index)"
      ></span>
    </div>
  </div>
</template>

<script>
export default {
  // przechowuje dane, które będą w opiniach
  data() {
    return {
      currentIndex: 0, // pierwszy element ma index 0
      slides: [
        {
          name: "Marcin Dudek",
          website: "edukacja.pl",
          text: "CourseFlow to niesamowita platforma do nauki.",
          image: "/images/recenzant4.jpg",
        },
        {
          name: "Mateusz Basiaga",
          website: "ekursy.pl",
          text: "Z CourseFlow nauka nigdy nie była taka łatwa !",
          image: "/images/recenzant2.jpg",
        },
        {
          name: "Michał Bernardy",
          website: "uczeniezpasji.pl",
          text: "Nigdy nauka nie była tak przyjemna!",
          image: "/images/recenzant3.jpg",
        },
        {
          name: "Adrian Gargula",
          website: "naukanajuz.pl",
          text: "Z CourseFlow mogę uczyć się w dowolnym miejscu i czasie, co jest dla mnie ogromnym plusem.",
          image: "/images/recenzant.jpg",
        },
        {
          name: "Jakub Tokarczyk",
          website: "waznekursy.pl",
          text: "CourseFlow to świetne narzędzie do nauki online. Daje mi pełną kontrolę nad moim postępem.",
          image: "/images/recenzant5.jpg",
        },
      ],
    };
  },
  methods: {
    prevSlide() {
      // metoda ta zmniejsza index o 1
      this.currentIndex =
        (this.currentIndex - 1 + this.slides.length) % this.slides.length; // gdy index będzie mniejszy niż 0 przejdzie do ostatniego slajdu (dzięki modulo)
    },
    nextSlide() {
      this.currentIndex = (this.currentIndex + 1) % this.slides.length; // analogicznie, gdy osiągnie wartość równą tablicy slides to index wróci do pierwszego slajdu
    },
    goToSlide(index) {
      this.currentIndex = index;
    },
  },
};
</script>

<style scoped>
.testimonial-carousel {
  text-align: center;
  max-width: 800px;
  margin: auto;
  margin-top: 60px;
}

.testimonial-content {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 400px;
}

.testimonial-wrapper {
  display: flex;
  overflow: hidden;
  width: 100%;
}

.testimonial {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100%;
  transition: transform 0.5s ease-in-out;
}

.testimonial-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  border-radius: 50%;
  width: 180px;
  height: 180px;
  object-fit: cover;
  border: 6px solid yellow;
  margin-bottom: 20px;
}

.testimonial h3 {
  font-weight: bold;
  margin: 10px 0 5px;
  font-size: 1.5rem;
}

.website {
  color: grey;
  font-style: italic;
  font-size: 1.1rem;
}

.review {
  font-size: 1.2rem;
  line-height: 1.6;
  max-width: 600px;
  margin: auto;
}

.arrow {
  background: none;
  border: none;
  font-size: 2.5rem;
  cursor: pointer;
  color: black;
  transition: color 0.3s;
}

.arrow:hover {
  color: #333;
}

.left {
  margin-right: 15px;
}

.right {
  margin-left: 15px;
}

.dots {
  margin-top: 50px;
  margin-bottom: 60px;
}

.dots span {
  height: 12px;
  width: 12px;
  margin: 0 10px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
  cursor: pointer;
}

.dots .active {
  background-color: yellow;
}
</style>
