
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en.json";
import fa from "../locales/fa.json";

const resources = {
  en: { translation: en },
  fa: { translation: fa },
};

export const i18n = i18next;

export async function initI18n() {
  await i18n.use(LanguageDetector).init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "fa"],
    defaultNS: "translation",

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "site-language",
    },

    interpolation: {
      escapeValue: false,
    },
  });

  applyLanguageSettings(i18n.resolvedLanguage || i18n.language);
  applyTranslations();
}

export function applyLanguageSettings(language) {
  const normalizedLanguage = language === "fa" ? "fa" : "en";

  document.documentElement.lang = normalizedLanguage;
  document.documentElement.dir =
    normalizedLanguage === "fa" ? "rtl" : "ltr";

  document.documentElement.dataset.language = normalizedLanguage;
}

export function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;

    element.textContent = i18n.t(key);
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    const [attribute, key] = element.dataset.i18nAttr.split(":");

    if (attribute && key) {
      element.setAttribute(attribute, i18n.t(key));
    }
  });

  document.querySelectorAll("[data-language-switch]").forEach((button) => {
    const isActive =
      button.dataset.languageSwitch === i18n.resolvedLanguage;

    button.setAttribute("aria-pressed", String(isActive));
  });
}

export async function changeLanguage(language) {
  if (!["en", "fa"].includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }

  await i18n.changeLanguage(language);
  applyLanguageSettings(language);
  applyTranslations();
}
