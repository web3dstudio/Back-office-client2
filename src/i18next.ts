import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend';


// const namespaces = [
//   'login',
//   'common',
//   'syncModels',
//   'integralExtras',
//   'carTypes',
//   'iconRepository',
//   'manufacturers'
// ]

// Собираем все json-файлы в папке en 
const enContext = import.meta.glob('./locales/en/*.json', { eager: true });
const namespaces = Object.keys(enContext).map(path => {
  const match = path.match(/([^/]+)\.json$/);
  if (!match) throw new Error(`Invalid path format: ${path}`);
  return match[1];
});


i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend((language: any, namespace: any) =>
    import(`./locales/${language}/${namespace}.json`)
  ))
  .init({
    fallbackLng: 'he',
    debug: false,
    ns: namespaces,
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