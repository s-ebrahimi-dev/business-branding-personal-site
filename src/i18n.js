import i18next from 'i18next';
import fa from './locales/fa.json';
import en from './locales/en.json';

const savedLanguage = localStorage.getItem('business-mansion-language') || 'fa';

await i18next.init({
  lng: savedLanguage,
  fallbackLng: 'fa',
  resources: {
    fa: { translation: fa },
    en: { translation: en }
  },
  interpolation: {
    escapeValue: false
  }
});

export default i18next;