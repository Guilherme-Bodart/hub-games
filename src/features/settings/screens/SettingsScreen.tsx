import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsLanguageCard } from '@/src/features/settings/components/SettingsLanguageCard';
import { useSettingsScreen } from '@/src/features/settings/hooks/useSettingsScreen';
import { styles } from '@/src/features/settings/styles/settingsStyles';
import { useTheme } from '@/src/theme';

export default function SettingsScreen() {
  const { t, setLocale, languageOptions } = useSettingsScreen();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
      <View style={styles.page}>
        <SettingsLanguageCard
          title={t('settings.language')}
          subtitle={t('settings.subtitle')}
          options={languageOptions}
          onSelectLanguage={setLocale}
        />
      </View>
    </SafeAreaView>
  );
}
