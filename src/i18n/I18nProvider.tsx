import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useI18nStore } from '@/src/i18n/store';
import { translations } from '@/src/i18n/translations';
import { Locale, TranslationKey } from '@/src/i18n/types';

const LOCALE_STORAGE_KEY = 'hub-games:locale';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const isLocale = (value: string): value is Locale => value === 'pt' || value === 'en';

const formatMessage = (
  message: string,
  params?: Record<string, string | number>
): string => {
  if (!params) {
    return message;
  }

  return Object.entries(params).reduce(
    (accumulator, [key, value]) => accumulator.replaceAll(`{${key}}`, String(value)),
    message
  );
};

export function I18nProvider({ children }: PropsWithChildren) {
  const locale = useI18nStore((state) => state.locale);
  const updateLocale = useI18nStore((state) => state.setLocale);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        const storedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);

        if (active && storedLocale && isLocale(storedLocale)) {
          updateLocale(storedLocale);
        }
      } finally {
        if (active) {
          setIsHydrated(true);
        }
      }
    };

    restore();

    return () => {
      active = false;
    };
  }, [updateLocale]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale).catch(() => undefined);
  }, [isHydrated, locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: updateLocale,
      t: (key, params) => formatMessage(translations[locale][key], params),
    }),
    [locale, updateLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider.');
  }

  return context;
}
