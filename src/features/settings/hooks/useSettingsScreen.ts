import { useNavigation } from 'expo-router';
import { useEffect, useMemo } from 'react';

import { useI18n } from '@/src/i18n';
import { SETTINGS_LANGUAGE_OPTIONS } from '@/src/features/settings/settings.constants';
import { useTheme } from '@/src/theme';

export const useSettingsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
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

  useEffect(() => {
    navigation.setOptions({
      title: t('settings.title'),
      headerShadowVisible: false,
      headerStyle: { backgroundColor: theme.semantic.bg.surface },
      headerTintColor: theme.semantic.text.primary,
      headerTitleStyle: {
        fontFamily: theme.semantic.typography.titleFamily,
        fontWeight: theme.semantic.typography.titleWeight,
      },
    });
  }, [
    navigation,
    t,
    theme.semantic.bg.surface,
    theme.semantic.text.primary,
    theme.semantic.typography.titleFamily,
    theme.semantic.typography.titleWeight,
  ]);

  return {
    locale,
    setLocale,
    t,
    languageOptions: options,
  };
};
