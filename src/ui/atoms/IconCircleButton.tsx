import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ComponentProps } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '@/src/theme';
import { resolveIconButtonTone, tactileGlossColors } from '@/src/ui/atoms/tactile';

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
  const palette = resolveIconButtonTone(theme, tone);

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
          borderRadius: size / 2,
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: pressed ? theme.semantic.motion.feedback.pressedOpacity : 1,
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
      <Ionicons name={icon} size={iconSize} color={palette.iconColor} />
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
    elevation: 4,
  },
});

