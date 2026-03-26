import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/src/features/settings/styles/settingsStyles';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { Button } from '@/src/ui/atoms';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { locale, setLocale, t } = useI18n();
  const { theme } = useTheme();

  useEffect(() => {
    navigation.setOptions({
      title: t('settings.title'),
      headerShown: true,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#2B2A46',
      headerTitleStyle: {
        fontFamily: theme.semantic.typography.titleFamily,
        fontWeight: theme.semantic.typography.titleWeight,
      },
    });
  }, [navigation, t, theme.semantic.typography.titleFamily, theme.semantic.typography.titleWeight]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.languageCard}>
          <View style={styles.languageTitleRow}>
            <View style={styles.languageAccent} />
            <Text style={styles.languageTitle}>{t('settings.language').toUpperCase()}</Text>
          </View>
          <Text style={styles.languageSubtitle}>{t('settings.subtitle')}</Text>

          <View style={styles.optionStack}>
            <Button
              label={t('settings.portuguese').toUpperCase()}
              onPress={() => setLocale('pt')}
              variant={locale === 'pt' ? 'primary' : 'secondary'}
              color={locale === 'pt' ? '#F1D35F' : '#D9DDE4'}
              textColor={locale === 'pt' ? '#1E2358' : '#8A95AB'}
              style={styles.languageButton}
            />

            <Button
              label={t('settings.english').toUpperCase()}
              onPress={() => setLocale('en')}
              variant={locale === 'en' ? 'primary' : 'secondary'}
              color={locale === 'en' ? '#F1D35F' : '#D9DDE4'}
              textColor={locale === 'en' ? '#1E2358' : '#8A95AB'}
              style={styles.languageButton}
            />

          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
