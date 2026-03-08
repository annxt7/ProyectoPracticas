import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importa tus archivos JSON (asegúrate de que la ruta sea correcta)
import esTranslation from './locales/es.json';
import enTranslation from './locales/en.json';

i18n
  .use(LanguageDetector) // Detecta el idioma del navegador automáticamente
  .use(initReactI18next) // Conecta con React
  .init({
    resources: {
    es: { translation: esTranslation },
    en: { translation: enTranslation }
    },
    fallbackLng: 'es', // Si no encuentra el idioma, usa español
    interpolation: {
      escapeValue: false // React ya protege contra XSS
    }
  });

export default i18n;