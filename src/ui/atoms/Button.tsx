import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { tactileGlossColors, tactileShadowStyle } from '@/src/ui/atoms/tactile';

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
  const borderColor = variant === 'ghost' ? withAlpha('#000000', 0.08) : withAlpha('#000000', 0.12);
  const shadowStyle = isDisabled ? undefined : tactileShadowStyle;

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
        shadowStyle,
        {
          backgroundColor: palette.bg,
          opacity: isDisabled
            ? theme.semantic.motion.feedback.disabledOpacity
            : pressed
              ? theme.semantic.motion.feedback.pressedOpacity
              : 1,
          borderColor,
          borderRadius: theme.semantic.layout.radius.lg,
          borderWidth: theme.semantic.layout.borderWidth.medium,
        },
        style,
      ]}>
      <LinearGradient
        pointerEvents="none"
        colors={tactileGlossColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
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
    overflow: 'hidden',
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
