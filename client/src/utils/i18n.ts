import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    de: {
      translation: {
        "Anreise": "Anreise"
      }
    },
    en: {
      translation: {
        "Anreise": "Commute"
      }
    },
  },
  lng: "de",
  fallbackLng: "de",
  interpolation: {
    escapeValue: false, // ← muss in interpolation rein
  },
  react: {
    useSuspense: false,
  }
});

export default i18n;