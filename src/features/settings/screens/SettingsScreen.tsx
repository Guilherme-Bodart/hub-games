import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { useSettingsScreen } from '@/src/features/settings/hooks/useSettingsScreen';
import { SettingsLanguageCard } from '@/src/features/settings/components/SettingsLanguageCard';
import { styles } from '@/src/features/settings/settings.styles';
import { resolveThemeSystemGradient, useTheme } from '@/src/theme';
import { Screen } from '@/src/ui/atoms';

export function SettingsScreen() {
  const { themeName } = useTheme();
  const { locale, setLocale, t, languageOptions } = useSettingsScreen();
  const [bgStart, bgEnd] = resolveThemeSystemGradient(themeName);
  const subtitle =
    locale === 'pt'
      ? 'Selecione o idioma preferido para a interface e narração dos jogos.'
      : 'Choose your preferred language for the interface and narration.';

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <LinearGradient
        pointerEvents="none"
        colors={[bgStart, bgEnd]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.backgroundMilkOverlay} />

      <SettingsLanguageCard
        title={t('settings.language')}
        subtitle={subtitle}
        options={languageOptions}
        onSelectLanguage={setLocale}
      />
    </Screen>
  );
}
