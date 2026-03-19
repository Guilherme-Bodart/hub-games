import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { Button, Card, Screen } from '@/src/ui/atoms';

export default function ModalScreen() {
  const router = useRouter();
  const { theme, themeName, options, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <View />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.close')}
          onPress={() => router.back()}
          style={[
            styles.closeIconWrap,
            {
              borderColor: theme.semantic.border.subtle,
              backgroundColor: theme.semantic.bg.elevated,
            },
          ]}>
          <SymbolView
            name={{ ios: 'xmark', android: 'close', web: 'close' }}
            size={18}
            tintColor={theme.semantic.status.error}
          />
        </Pressable>
      </View>

      <Card title={t('settings.theme')} subtitle={t('settings.subtitle')}>
        <View style={styles.group}>
          <View style={styles.buttons}>
            {options.map((option) => (
              <Button
                key={option.name}
                label={option.label}
                variant={themeName === option.name ? 'primary' : 'ghost'}
                onPress={() => setTheme(option.name)}
              />
            ))}
          </View>
        </View>
      </Card>

      <Card title={t('settings.language')}>
        <View style={styles.buttons}>
          <Button
            label={t('settings.portuguese')}
            variant={locale === 'pt' ? 'secondary' : 'ghost'}
            onPress={() => setLocale('pt')}
          />
          <Button
            label={t('settings.english')}
            variant={locale === 'en' ? 'secondary' : 'ghost'}
            onPress={() => setLocale('en')}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: {
    gap: 8,
  },
  buttons: {
    gap: 8,
  },
});

