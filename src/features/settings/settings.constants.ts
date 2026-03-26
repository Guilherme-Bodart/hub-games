import type { Locale } from '@/src/i18n';

export type SettingsLanguageOption = {
  locale: Locale;
  labelKey: 'settings.portuguese' | 'settings.english';
};

export const SETTINGS_LANGUAGE_OPTIONS: SettingsLanguageOption[] = [
  { locale: 'pt', labelKey: 'settings.portuguese' },
  { locale: 'en', labelKey: 'settings.english' },
];
