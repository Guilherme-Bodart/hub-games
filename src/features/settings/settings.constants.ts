import type { ReduceMotionMode } from '@/src/features/settings/preferencesStore';
import type { Locale } from '@/src/i18n';

export type SettingsLanguageOption = {
  locale: Locale;
  shortLabel: string;
  labelKey: 'settings.portuguese' | 'settings.english';
};

export const SETTINGS_LANGUAGE_OPTIONS: SettingsLanguageOption[] = [
  { locale: 'pt', shortLabel: 'PT', labelKey: 'settings.portuguese' },
  { locale: 'en', shortLabel: 'EN', labelKey: 'settings.english' },
];

export const REDUCE_MOTION_OPTIONS: ReduceMotionMode[] = ['system', 'on', 'off'];
