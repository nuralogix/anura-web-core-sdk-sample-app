import type { SupportedLanguage } from '../types';
import type { Profile } from '../state/measurement/types';

export const getSavedLanguage = (): SupportedLanguage | null => {
  const saved = localStorage.getItem('language');
  if (!saved || saved === 'null') return null;
  return saved as SupportedLanguage;
};

export const getSavedTheme = () => {
  return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
};

export const markPreviouslyAuthenticated = () => {
  localStorage.setItem('hasPreviouslyAuthenticated', '1');
};

export const getHasPreviouslyAuthenticated = (): boolean => {
  return localStorage.getItem('hasPreviouslyAuthenticated') === '1';
};

export const clearPreviousAuth = () => {
  localStorage.removeItem('hasPreviouslyAuthenticated');
};

const DEMO_KEY = 'sdk_demo_v1';

export const loadSavedProfile = (): Profile | null => {
  const raw = localStorage.getItem(DEMO_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as Profile;
};
export const saveProfile = (profile: Profile) => {
  localStorage.setItem(DEMO_KEY, JSON.stringify(profile));
};
export const clearProfile = () => {
  localStorage.removeItem(DEMO_KEY);
};
