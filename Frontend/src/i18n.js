import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import esTranslation from './locales/es.json';
import enTranslation from './locales/en.json';
import jaTranslation from './locales/ja.json';


i18n
  .use(LanguageDetector) 
  .use(initReactI18next) 
  .init({
    resources: {
    es: { translation: esTranslation },
    en: { translation: enTranslation },
    ja: { translation: jaTranslation }
    },
    fallbackLng: 'es', 
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;