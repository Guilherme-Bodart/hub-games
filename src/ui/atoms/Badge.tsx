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

  const palette =
    variant === 'success'
      ? {
          backgroundColor: theme.semantic.badge.successBg,
          textColor: theme.semantic.badge.successText,
        }
      : variant === 'error'
        ? {
            backgroundColor: theme.semantic.badge.errorBg,
            textColor: theme.semantic.badge.errorText,
          }
        : variant === 'warning'
          ? {
              backgroundColor: theme.semantic.badge.warningBg,
              textColor: theme.semantic.badge.warningText,
            }
          : variant === 'info'
            ? {
                backgroundColor: theme.semantic.badge.infoBg,
                textColor: theme.semantic.badge.infoText,
              }
            : variant === 'host'
              ? {
                  backgroundColor: theme.semantic.badge.hostBg,
                  textColor: theme.semantic.badge.hostText,
                }
        : {
            backgroundColor: theme.semantic.badge.neutralBg,
            textColor: theme.semantic.badge.neutralText,
          };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palette.backgroundColor,
          borderRadius: theme.semantic.layout.radius.full,
          paddingHorizontal: theme.semantic.layout.spacing.sm,
          paddingVertical: theme.semantic.layout.spacing.xs,
        },
        style,
      ]}>
      <Text
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
  badge: { alignSelf: 'flex-start' },
  label: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
