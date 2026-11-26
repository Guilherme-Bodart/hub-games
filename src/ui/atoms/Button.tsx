import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { ELEVATION_STYLES, useTheme } from '@/src/theme';
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
  plinthColor?: string;
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
  plinthColor,
  textColor,
}: ButtonProps) {
  const { theme } = useTheme();
  const palette = theme.semantic.button[variant];
  const isDisabled = disabled || loading;
  const isGhost = variant === 'ghost';

  const baseFace = color ?? palette.bg;
  const resolvedPlinth =
    plinthColor ?? (color ? shiftHexColor(color, -0.16) : palette.plinth);
  const resolvedText = textColor ?? palette.text;
  const faceBorderColor =
    variant === 'secondary' || isGhost
      ? theme.semantic.border.hairline
      : shiftHexColor(baseFace, -0.06);

  const minHeight = size === 'sm' ? 40 : size === 'lg' ? 50 : 46;
  const fontSize = size === 'sm' ? 15 : size === 'lg' ? 18 : 17;
  const lineHeight = size === 'sm' ? 20 : size === 'lg' ? 23 : 22;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading || undefined }}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.plinth,
        !isDisabled && !isGhost ? ELEVATION_STYLES.card : ELEVATION_STYLES.flat,
        {
          backgroundColor: isGhost ? 'transparent' : resolvedPlinth,
          paddingBottom: isGhost ? 0 : 4,
          opacity: isDisabled ? theme.semantic.motion.feedback.disabledOpacity : 1,
        },
        style,
      ]}>
      {({ pressed }) => (
        <View
          style={[
            styles.face,
            {
              minHeight,
              backgroundColor: baseFace,
              borderColor: faceBorderColor,
              transform: [{ translateY: pressed && !isDisabled ? (isGhost ? 1 : 3) : 0 }],
            },
          ]}>
          {loading ? (
            <ActivityIndicator size="small" color={resolvedText} style={styles.loader} />
          ) : null}
          <Text
            numberOfLines={1}
            style={[
              styles.label,
              {
                color: resolvedText,
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
                fontSize,
                lineHeight,
              },
            ]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  plinth: {
    borderRadius: 16,
  },
  face: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  label: {
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  loader: {
    marginRight: 8,
  },
});
