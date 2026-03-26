import { useMemo } from 'react';

import { useI18n } from '@/src/i18n';
import { SETTINGS_LANGUAGE_OPTIONS } from '@/src/features/settings/settings.constants';

export const useSettingsScreen = () => {
  const { locale, setLocale, t } = useI18n();

  const options = useMemo(
    () =>
      SETTINGS_LANGUAGE_OPTIONS.map((option) => ({
        ...option,
        label: t(option.labelKey).toUpperCase(),
        selected: option.locale === locale,
      })),
    [locale, t]
  );

  return {
    locale,
    setLocale,
    t,
    languageOptions: options,
  };
};
