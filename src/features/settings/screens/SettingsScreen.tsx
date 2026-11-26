import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SettingsLanguageCard,
  SettingsPreferencesCard,
} from '@/src/features/settings/components';
import { useSettingsScreen } from '@/src/features/settings/hooks/useSettingsScreen';
import { styles } from '@/src/features/settings/styles/settingsStyles';
import { useTheme } from '@/src/theme';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const {
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
  } = useSettingsScreen();

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}>
        <SettingsLanguageCard
          title={t('settings.language')}
          subtitle={t('settings.subtitle')}
          options={languageOptions}
          onSelectLanguage={handleSelectLanguage}
        />

        <SettingsPreferencesCard
          locale={locale}
          soundEnabled={soundEnabled}
          hapticsEnabled={hapticsEnabled}
          reduceMotionOptions={reduceMotionOptions}
          onToggleSound={handleToggleSound}
          onToggleHaptics={handleToggleHaptics}
          onSelectReduceMotion={handleSelectReduceMotion}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
