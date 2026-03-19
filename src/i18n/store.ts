import { create } from 'zustand';

import { Locale } from '@/src/i18n/types';

type I18nState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useI18nStore = create<I18nState>((set) => ({
  locale: 'pt',
  setLocale: (locale) => set({ locale }),
}));

export const setLocale = (locale: Locale): void => {
  useI18nStore.getState().setLocale(locale);
};
