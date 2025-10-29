// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon-96x96.png",
          sizes: "96x96",
        },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "shortcut icon", href: "/favicon.ico" },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
  },
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@nuxtjs/i18n"],

  plugins: ["~/plugins/socket.js"],

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
