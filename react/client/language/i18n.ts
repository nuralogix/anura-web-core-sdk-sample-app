import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SupportedLanguage } from '../types';
import Backend from 'i18next-fetch-backend';
import { supportedLanguages } from './constants';

const initI18n = () => {
  const browserLanguage = navigator.language.split('-')[0];
  const matchedLanguage = (
    supportedLanguages.includes(browserLanguage)
      ? browserLanguage
      : 'en'
  ) as SupportedLanguage;

  return i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
      lng: matchedLanguage,
      fallbackLng: 'en',
      backend: {
        loadPath: '/language/strings.{{lng}}.json',
        requestOptions: {
          credentials: 'same-origin',
          mode: 'cors', 
          headers: {
            'Content-Type': 'application/json',
          },
        },
      },
      interpolation: {
        escapeValue: false, // React already escapes
      },
    });
};

initI18n();
