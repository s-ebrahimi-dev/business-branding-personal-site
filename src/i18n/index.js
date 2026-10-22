import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en.json";
import fa from "../locales/fa.json";

const resources = {
  en: { translation: en },
  fa: { translation: fa },
};

export const i18n = i18next;

export const initI18n = async () => {
  await i18n.use(LanguageDetector).init({
    resources,
    fallbackLng: "fa",
    supportedLngs: ["fa", "en"],
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

  updateDocumentLanguage(i18n.resolvedLanguage || i18n.language);
};

export const updateDocumentLanguage = (language) => {
  const isPersian = language === "fa";

  document.documentElement.lang = language;
  document.documentElement.dir = isPersian ? "rtl" : "ltr";

  document.documentElement.dataset.language = language;
};


export const applyTranslations = () => {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = i18n.t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    const [attribute, key] = element.dataset.i18nAttr.split(":");

if (attribute && key) {
  const translatedValue = i18n.t(key, {
    returnObjects: true,
  });

  if (Array.isArray(translatedValue)) {
    element.setAttribute(attribute, JSON.stringify(translatedValue));
  } else if (typeof translatedValue === "string") {
    element.setAttribute(attribute, translatedValue);
  }
}
  });
};


export const changeLanguage = async (language) => {
  if (!["fa", "en"].includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }

  await i18n.changeLanguage(language);

  updateDocumentLanguage(language);
  applyTranslations();
};
