// next-i18next.config.js
const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    localeDetection: false,
  },

  localePath:
    typeof window === "undefined"
      ? path.resolve("./public/locales")
      : "/locales",

  defaultNS: "home",
  ns: ["home"],

  fallbackLng: {
    default: ["es"],
    en: ["en"],
    es: ["es"],
  },

  nonExplicitSupportedLngs: true,
  reloadOnPrerender: process.env.NODE_ENV === "development",
  debug: process.env.NODE_ENV === "development",
};