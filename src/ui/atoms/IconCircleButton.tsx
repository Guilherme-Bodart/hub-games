import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '@/src/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type IconCircleButtonTone = 'neutral' | 'primary' | 'secondary';

type IconCircleButtonProps = {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  tone?: IconCircleButtonTone;
  size?: number;
  iconSize?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconCircleButton({
  icon,
  onPress,
  accessibilityLabel,
  tone = 'neutral',
  size = 42,
  iconSize = 18,
  disabled = false,
  style,
}: IconCircleButtonProps) {
  const { theme } = useTheme();
  const standardRadius = size / 2;
  const iconColor =
    tone === 'primary'
      ? theme.semantic.button.primary.text
      : tone === 'secondary'
        ? theme.semantic.button.accent.bg
        : '#2B2A46';
  const borderColor = 'rgba(0,0,0,0.14)';
  const backgroundColor = '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles.iconShadow,
        {
          width: size,
          height: size,
          borderRadius: standardRadius,
          backgroundColor,
          borderColor,
          opacity: pressed ? theme.semantic.motion.feedback.pressedOpacity : 1,
        },
        style,
      ]}>
      <Ionicons name={icon} size={iconSize} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconShadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 4, height: 4 },
    elevation: 7,
  },
});
