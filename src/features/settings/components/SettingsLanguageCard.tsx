import { Text, View } from 'react-native';

import { Button } from '@/src/ui/atoms';
import type { Locale } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { styles } from '@/src/features/settings/styles/settingsStyles';

type SettingsLanguageOptionView = {
  locale: Locale;
  label: string;
  selected: boolean;
};

type SettingsLanguageCardProps = {
  title: string;
  subtitle: string;
  options: SettingsLanguageOptionView[];
  onSelectLanguage: (locale: Locale) => void;
};

export function SettingsLanguageCard({
  title,
  subtitle,
  options,
  onSelectLanguage,
}: SettingsLanguageCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.languageCard,
        {
          borderColor: withAlpha(theme.semantic.bg.surface, 0.9),
          backgroundColor: withAlpha(theme.semantic.bg.surface, 0.86),
        },
      ]}>
      <View style={styles.languageTitleRow}>
        <View style={styles.languageAccent} />
        <Text
          style={[
            styles.languageTitle,
            {
              color: theme.semantic.text.primary,
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {title.toUpperCase()}
        </Text>
      </View>

      <Text
        style={[
          styles.languageSubtitle,
          {
            color: theme.semantic.text.muted,
            fontFamily: theme.semantic.typography.bodyFamily,
            fontWeight: theme.semantic.typography.bodyWeight,
          },
        ]}>
        {subtitle}
      </Text>

      <View style={styles.optionStack}>
        {options.map((option) => (
          <Button
            key={option.locale}
            label={option.label}
            onPress={() => onSelectLanguage(option.locale)}
            variant={option.selected ? 'primary' : 'secondary'}
            size="lg"
            color={option.selected ? '#F1D35F' : '#D9DDE4'}
            textColor={option.selected ? '#1E2358' : '#8A95AB'}
            style={styles.languageButton}
          />
        ))}
      </View>
    </View>
  );
}
