import type { SupportedLanguage, ErrorCodes } from '../../types';

export type Theme = 'light' | 'dark';

export type GeneralState = {
  theme: Theme;
  language: SupportedLanguage;
  errorCode: ErrorCodes | null;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setErrorCode: (errorCode: ErrorCodes | null) => void;
};
