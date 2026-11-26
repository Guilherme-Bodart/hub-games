import { useNavigation } from 'expo-router';
import { useEffect, useMemo } from 'react';

import {
  usePreferencesStore,
  type ReduceMotionMode,
} from '@/src/features/settings/preferencesStore';
import {
  REDUCE_MOTION_OPTIONS,
  SETTINGS_LANGUAGE_OPTIONS,
} from '@/src/features/settings/settings.constants';
import { useI18n, type Locale } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { triggerGameFeedback } from '@/src/ui/feedback';

export const useSettingsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { locale, setLocale, t } = useI18n();

  const soundEnabled = usePreferencesStore((state) => state.soundEnabled);
  const hapticsEnabled = usePreferencesStore((state) => state.hapticsEnabled);
  const reduceMotionMode = usePreferencesStore((state) => state.reduceMotionMode);
  const hydrate = usePreferencesStore((state) => state.hydrate);
  const setSoundEnabled = usePreferencesStore((state) => state.setSoundEnabled);
  const setHapticsEnabled = usePreferencesStore((state) => state.setHapticsEnabled);
  const setReduceMotionMode = usePreferencesStore((state) => state.setReduceMotionMode);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const languageOptions = useMemo(
    () =>
      SETTINGS_LANGUAGE_OPTIONS.map((option) => ({
        ...option,
        label: t(option.labelKey),
        selected: option.locale === locale,
      })),
    [locale, t]
  );

  const reduceMotionOptions = useMemo(
    () =>
      REDUCE_MOTION_OPTIONS.map((mode) => ({
        mode,
        label:
          mode === 'system'
            ? locale === 'pt'
              ? 'Sistema'
              : 'System'
            : mode === 'on'
              ? locale === 'pt'
                ? 'Ativado'
                : 'On'
              : locale === 'pt'
                ? 'Desativado'
                : 'Off',
        selected: mode === reduceMotionMode,
      })),
    [locale, reduceMotionMode]
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

  const handleSelectLanguage = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }
    setLocale(nextLocale);
    triggerGameFeedback('confirm');
  };

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    if (enabled) {
      triggerGameFeedback('confirm');
    }
  };

  const handleToggleHaptics = (enabled: boolean) => {
    setHapticsEnabled(enabled);
    if (enabled) {
      triggerGameFeedback('confirm');
    }
  };

  const handleSelectReduceMotion = (mode: ReduceMotionMode) => {
    if (mode === reduceMotionMode) {
      return;
    }
    setReduceMotionMode(mode);
    triggerGameFeedback('confirm');
  };

  return {
    locale,
    t,
    languageOptions,
    soundEnabled,
    hapticsEnabled,
    reduceMotionOptions,
    handleSelectLanguage,
    handleToggleSound,
    handleToggleHaptics,
    handleSelectReduceMotion,
  };
};
