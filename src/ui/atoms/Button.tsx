import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  testID,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const { theme } = useTheme();
  const palette = theme.semantic.button[variant];
  const sizeStyle =
    size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;
  const isDisabled = disabled || loading;
  const isPrimaryLike = variant === 'primary' || variant === 'accent' || variant === 'destructive';
  const glowOpacity = variant === 'primary' ? 0.78 : variant === 'accent' ? 0.68 : 0.6;
  const glowRadius = variant === 'primary' ? 22 : variant === 'accent' ? 18 : 14;
  const borderColor =
    variant === 'ghost' ? theme.semantic.border.subtle : withAlpha(palette.bg, 0.86);

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading || undefined }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        sizeStyle,
        {
          backgroundColor: palette.bg,
          opacity: isDisabled
            ? theme.semantic.motion.feedback.disabledOpacity
            : pressed
              ? theme.semantic.motion.feedback.pressedOpacity
              : 1,
          borderColor,
          shadowColor: theme.semantic.shadow.neon,
          shadowOpacity: isPrimaryLike ? glowOpacity : 0,
          shadowRadius: isPrimaryLike ? glowRadius : 0,
          shadowOffset: { width: 0, height: 0 },
          elevation: isPrimaryLike ? (variant === 'primary' ? 12 : 8) : 0,
          borderRadius: theme.semantic.layout.radius.lg,
          borderWidth: theme.semantic.layout.borderWidth.subtle,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={palette.text}
          style={styles.loader}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          {
            color: palette.text,
            fontFamily: theme.semantic.typography.titleFamily,
            fontWeight: theme.semantic.typography.titleWeight,
            opacity: loading ? 0.88 : 1,
            textTransform: 'uppercase',
          },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: 'row',
    gap: 8,
  },
  sizeSm: {
    minHeight: 44,
  },
  sizeMd: {
    minHeight: 48,
  },
  sizeLg: {
    minHeight: 56,
  },
  label: {
    fontSize: 14,
    letterSpacing: 0.8,
  },
  loader: {
    marginRight: 2,
  },
});
