import { Pressable, Text, View } from 'react-native';

import { styles } from '@/src/features/settings/styles/settingsStyles';
import type { Locale } from '@/src/i18n';
import { HUB_DEFAULT_ACCENT, useTheme } from '@/src/theme';
import { Card } from '@/src/ui/atoms';

type SettingsLanguageOptionView = {
  locale: Locale;
  shortLabel: string;
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
    <Card title={title} subtitle={subtitle} variant="elevated">
      <View
        style={[
          styles.pillTrack,
          {
            backgroundColor: theme.semantic.bg.subtle,
            borderColor: theme.semantic.border.hairline,
          },
        ]}>
        {options.map((option) => (
          <Pressable
            key={option.locale}
            onPress={() => onSelectLanguage(option.locale)}
            accessibilityRole="button"
            accessibilityState={{ selected: option.selected }}
            accessibilityLabel={option.label}
            style={[
              styles.pillOptionPlinth,
              {
                backgroundColor: option.selected
                  ? HUB_DEFAULT_ACCENT.plinth
                  : 'transparent',
                paddingBottom: option.selected ? 3 : 0,
              },
            ]}>
            {({ pressed }) => (
              <View
                style={[
                  styles.pillOptionFace,
                  {
                    backgroundColor: option.selected
                      ? HUB_DEFAULT_ACCENT.primary
                      : 'transparent',
                    borderColor: option.selected
                      ? HUB_DEFAULT_ACCENT.plinth
                      : 'transparent',
                    transform: [{ translateY: pressed && option.selected ? 2 : 0 }],
                    opacity: pressed && !option.selected ? 0.72 : 1,
                  },
                ]}>
                <Text
                  style={[
                    styles.pillShortCode,
                    {
                      color: option.selected
                        ? HUB_DEFAULT_ACCENT.textOnPrimary
                        : theme.semantic.text.muted,
                      fontFamily: theme.semantic.typography.numberFamily,
                    },
                  ]}>
                  {option.shortLabel}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.pillLabel,
                    {
                      color: option.selected
                        ? HUB_DEFAULT_ACCENT.textOnPrimary
                        : theme.semantic.text.primary,
                      fontFamily: theme.semantic.typography.titleFamily,
                      fontWeight: theme.semantic.typography.titleWeight,
                    },
                  ]}>
                  {option.label}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </Card>
  );
}
