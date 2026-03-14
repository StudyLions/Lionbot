// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: i18n configuration for next-i18next
// ============================================================
/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "pt-BR", "he", "tr", "es", "fr"],
    localeDetection: true,
  },
  fallbackLng: "en",
  ns: ["common", "homepage", "donate", "skins", "legal", "errors", "study", "dashboard", "server"],
  defaultNS: "common",
  localePath: typeof window === "undefined" ? require("path").resolve("./public/locales") : "/locales",
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
