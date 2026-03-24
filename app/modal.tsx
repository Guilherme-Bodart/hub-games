import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '@/src/i18n';
import { resolveThemeSystemGradient, ThemeName, useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { Screen } from '@/src/ui/atoms';

const resolveThemePreview = (themeName: ThemeName): [string, string] =>
  resolveThemeSystemGradient(themeName);

export default function ModalScreen() {
  const { theme, themeName, options, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const [bgStart, bgEnd] = resolveThemeSystemGradient(themeName);

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <LinearGradient
        pointerEvents="none"
        colors={[bgStart, bgEnd]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.backgroundMilkOverlay} />

      <View
        style={[
          styles.glassCard,
          {
            borderColor: 'rgba(255,255,255,0.86)',
            backgroundColor: 'rgba(255,255,255,0.5)',
          },
        ]}>
        <Text style={styles.sectionTitle}>{t('settings.theme')}</Text>
        <Text style={styles.sectionSubtitle}>{t('settings.subtitle')}</Text>

        <View style={styles.optionStack}>
          {options.slice(0, 3).map((option) => {
            const selected = themeName === option.name;
            const [startColor, endColor] = resolveThemePreview(option.name);

            return (
              <Pressable
                key={option.name}
                onPress={() => setTheme(option.name)}
                style={({ pressed }) => [
                  styles.themeOptionWrap,
                  {
                    opacity: pressed ? 0.9 : 1,
                    borderColor: selected ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.58)',
                    backgroundColor: selected ? 'transparent' : 'rgba(255,255,255,0.24)',
                  },
                ]}>
                {selected ? (
                  <LinearGradient
                    colors={[startColor, endColor]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.themeOptionGradient}
                  />
                ) : null}
                <Text style={[styles.themeOptionText, selected ? styles.themeOptionTextSelected : null]}>
                  {option.label.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={[
          styles.glassCard,
          {
            borderColor: 'rgba(255,255,255,0.86)',
            backgroundColor: 'rgba(255,255,255,0.5)',
          },
        ]}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.optionStack}>
          <Pressable
            onPress={() => setLocale('pt')}
            style={({ pressed }) => [
              styles.langOption,
              locale === 'pt'
                ? {
                    backgroundColor: theme.semantic.button.secondary.bg,
                    borderColor: withAlpha(theme.semantic.button.secondary.bg, 0.88),
                  }
                : {
                    backgroundColor: 'rgba(255,255,255,0.28)',
                    borderColor: withAlpha(theme.semantic.border.subtle, 0.56),
                  },
              pressed ? styles.optionPressed : null,
            ]}>
            <Text
              style={[
                styles.langOptionText,
                locale === 'pt'
                  ? { color: theme.semantic.button.secondary.text }
                  : { color: '#2B2A46' },
              ]}>
              {t('settings.portuguese').toUpperCase()}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLocale('en')}
            style={({ pressed }) => [
              styles.langOption,
              locale === 'en'
                ? {
                    backgroundColor: theme.semantic.button.secondary.bg,
                    borderColor: withAlpha(theme.semantic.button.secondary.bg, 0.88),
                  }
                : {
                    backgroundColor: 'rgba(255,255,255,0.28)',
                    borderColor: withAlpha(theme.semantic.border.subtle, 0.56),
                  },
              pressed ? styles.optionPressed : null,
            ]}>
            <Text
              style={[
                styles.langOptionText,
                locale === 'en'
                  ? { color: theme.semantic.button.secondary.text }
                  : { color: '#2B2A46' },
              ]}>
              {t('settings.english').toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backgroundMilkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
  },
  glassCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  sectionTitle: {
    color: '#2B2A46',
    fontSize: 30,
    lineHeight: 30,
    fontFamily: 'Baloo2_700Bold',
    letterSpacing: 0.4,
  },
  sectionSubtitle: {
    color: '#4A4A6F',
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Nunito_700Bold',
  },
  optionStack: {
    gap: 10,
  },
  themeOptionWrap: {
    position: 'relative',
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  themeOptionGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  themeOptionText: {
    color: '#2B2A46',
    fontSize: 24,
    lineHeight: 24,
    fontFamily: 'Baloo2_700Bold',
    letterSpacing: 0.8,
  },
  themeOptionTextSelected: {
    color: '#1E1B33',
  },
  langOption: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  langOptionText: {
    color: '#2B2A46',
    fontSize: 24,
    lineHeight: 24,
    fontFamily: 'Baloo2_700Bold',
    letterSpacing: 0.8,
  },
  optionPressed: {
    opacity: 0.88,
  },
});

