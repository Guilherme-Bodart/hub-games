import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { v2Tokens } from '@/src/v2/design-system';

type ClayButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function ClayButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
  accessibilityLabel,
}: ClayButtonProps) {
  const palette =
    variant === 'secondary'
      ? {
          bg: v2Tokens.colors.claySecondaryBg,
          text: v2Tokens.colors.claySecondaryText,
        }
      : variant === 'danger'
      ? {
          bg: v2Tokens.colors.clayDangerBg,
          text: v2Tokens.colors.clayDangerText,
        }
      : {
          bg: v2Tokens.colors.clayPrimaryBg,
          text: v2Tokens.colors.clayPrimaryText,
        };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: v2Tokens.colors.glassBorder,
          shadowColor: pressed ? v2Tokens.shadows.clayPressed.shadowColor : v2Tokens.shadows.clayRaised.shadowColor,
          shadowOpacity: pressed ? v2Tokens.shadows.clayPressed.shadowOpacity : v2Tokens.shadows.clayRaised.shadowOpacity,
          shadowRadius: pressed ? v2Tokens.shadows.clayPressed.shadowRadius : v2Tokens.shadows.clayRaised.shadowRadius,
          shadowOffset: pressed ? v2Tokens.shadows.clayPressed.shadowOffset : v2Tokens.shadows.clayRaised.shadowOffset,
          elevation: pressed ? v2Tokens.shadows.clayPressed.elevation : v2Tokens.shadows.clayRaised.elevation,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: v2Tokens.radius.pill,
    borderWidth: 1,
    paddingHorizontal: v2Tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: v2Tokens.typography.button,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
