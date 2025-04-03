// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@nuxtjs/i18n"],

  i18n: {
    bundle: {
      optimizeTranslationDirective: false,
    },
    strategy: "no_prefix",
    lazy: true,
    langDir: "locales",
    defaultLocale: "pl",
    locales: [
      {
        code: "pl",
        file: "pl.json",
        language: "pl",
        name: "Polski",
      },
      {
        code: "en",
        file: "en.json",
        language: "en",
        name: "English",
      },
    ],
  },
});
