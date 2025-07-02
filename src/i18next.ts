import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend((language: any, namespace: any) =>
    import(`./locales/${language}/${namespace}.json`)
  ))
  .init({
    fallbackLng: 'he',
    debug: false,
    ns: ['login', 'common', 'syncModels', 'integralExtras'],
    defaultNS: 'login',
    detection: {
      order: ['localStorage', 'cookie'],
      caches: ['localStorage', 'cookie']
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'a'],
    }
  });

export default i18n;