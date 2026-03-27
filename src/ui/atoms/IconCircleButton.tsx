import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '@/src/theme';
import { resolveIconButtonTone, tactileShadowStyle } from '@/src/ui/atoms/tactile';

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
  size = 44,
  iconSize = 18,
  disabled = false,
  style,
}: IconCircleButtonProps) {
  const { theme } = useTheme();
  const standardRadius = size / 2;
  const resolvedTone = resolveIconButtonTone(theme, tone);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        tactileShadowStyle,
        {
          width: size,
          height: size,
          borderRadius: standardRadius,
          backgroundColor: resolvedTone.backgroundColor,
          borderColor: resolvedTone.borderColor,
          opacity: pressed ? theme.semantic.motion.feedback.pressedOpacity : 1,
        },
        style,
      ]}>
      <Ionicons name={icon} size={iconSize} color={resolvedTone.iconColor} />
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
});
