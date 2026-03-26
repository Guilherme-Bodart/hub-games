import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/src/theme';
import { shiftHexColor } from '@/src/theme/utils';

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
  color?: string;
  textColor?: string;
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
  color,
  textColor,
}: ButtonProps) {
  const { theme } = useTheme();
  const palette = theme.semantic.button[variant];
  const sizeStyle =
    size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;
  const isDisabled = disabled || loading;
  const baseColor = color ?? palette.bg;
  const baseTextColor = textColor ?? palette.text;
  const backgroundColor = isDisabled ? shiftHexColor(baseColor, 0.2) : baseColor;
  const resolvedTextColor = isDisabled ? shiftHexColor(baseTextColor, -0.05) : baseTextColor;
  const contentOpacity = !isDisabled && loading ? 0.88 : 1;
  const borderColor = isDisabled
    ? shiftHexColor(baseColor, 0.06)
    : variant === 'ghost'
      ? '#D5DEEC'
      : shiftHexColor(baseColor, -0.1);
  const bottomDepthColor = isDisabled
    ? shiftHexColor(baseColor, -0.02)
    : variant === 'ghost'
      ? '#CAD5E8'
      : shiftHexColor(baseColor, -0.13);

  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading || undefined }}
      disabled={isDisabled}
      onPress={onPress}
      activeOpacity={theme.semantic.motion.feedback.pressedOpacity}
      style={[
        styles.base,
        sizeStyle,
        {
          backgroundColor,
          borderColor,
          borderRadius: 18,
          borderWidth: 1.2,
          borderBottomWidth: isDisabled ? 2 : 4,
          borderBottomColor: bottomDepthColor,
          shadowColor: '#000000',
          shadowOpacity: isDisabled ? 0.08 : 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: isDisabled ? 1 : 3,
        },
        style,
      ]}>
      <View style={styles.contentRow}>
        {loading ? <ActivityIndicator size="small" color={palette.text} style={styles.loader} /> : null}
        <Text
          style={[
            styles.label,
            {
              color: resolvedTextColor,
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
              opacity: contentOpacity,
              textTransform: 'uppercase',
            },
          ]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeSm: {
    minHeight: 44,
  },
  sizeMd: {
    minHeight: 50,
  },
  sizeLg: {
    minHeight: 54,
  },
  label: {
    fontSize: 19,
    lineHeight: 20,
    letterSpacing: 1,
  },
  loader: {
    marginRight: 8,
  },
});
