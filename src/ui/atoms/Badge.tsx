import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '@/src/theme';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'host' | 'neutral';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ label, variant = 'neutral', style }: BadgeProps) {
  const { theme } = useTheme();
  const b = theme.semantic.badge;

  const paletteMap: Record<BadgeVariant, { backgroundColor: string; textColor: string }> = {
    success: { backgroundColor: b.successBg, textColor: b.successText },
    error: { backgroundColor: b.errorBg, textColor: b.errorText },
    warning: { backgroundColor: b.warningBg, textColor: b.warningText },
    info: { backgroundColor: b.infoBg, textColor: b.infoText },
    host: { backgroundColor: b.hostBg, textColor: b.hostText },
    neutral: { backgroundColor: b.neutralBg, textColor: b.neutralText },
  };

  const palette = paletteMap[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: theme.semantic.border.hairline,
        },
        style,
      ]}>
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            color: palette.textColor,
            fontFamily: theme.semantic.typography.bodyFamily,
            fontWeight: theme.semantic.typography.bodyWeight,
          },
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
});
