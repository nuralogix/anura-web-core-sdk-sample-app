import { proxy } from 'valtio';
import i18n from 'i18next';
import { GeneralState } from './types';

const generalState: GeneralState = proxy({
  theme: 'light',
  language: 'en',
  errorCode: null,
  setTheme: (theme) => {
    generalState.theme = theme;
  },
  setLanguage: (language) => {
    generalState.language = language;
    i18n.changeLanguage(language);
  },
  setErrorCode: (errorCode) => {
    generalState.errorCode = errorCode;
  },
});

export default generalState;
