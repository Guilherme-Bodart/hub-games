import { Text, View } from 'react-native';

import { Button } from '@/src/ui/atoms';
import type { Locale } from '@/src/i18n';
import { styles } from '@/src/features/settings/settings.styles';

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
  return (
    <View style={styles.glassCard}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionTitleMarker} />
        <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      </View>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>

      <View style={styles.optionStack}>
        {options.map((option) => (
          <Button
            key={option.locale}
            label={option.label}
            onPress={() => onSelectLanguage(option.locale)}
            variant={option.selected ? 'secondary' : 'ghost'}
            size="lg"
          />
        ))}
      </View>
    </View>
  );
}
