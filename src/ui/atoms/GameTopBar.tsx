import { SymbolView } from 'expo-symbols';
import { ComponentProps, useEffect } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';

type GameTopBarTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';
type GameTopBarSymbolName = ComponentProps<typeof SymbolView>['name'];

type GameTopBarProps = {
  title: string;
  subtitle?: string;
  statusTone?: GameTopBarTone;
  statusLabel?: string;
  onPressRight?: () => void;
  rightLabel?: string;
  rightSymbolName?: GameTopBarSymbolName;
  rightAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const resolveToneColor = (tone: GameTopBarTone, fallback: string, themeStatus: Record<string, string>) => {
  if (tone === 'neutral') {
    return fallback;
  }

  return themeStatus[tone];
};

export function GameTopBar({
  title,
  subtitle,
  statusTone = 'success',
  statusLabel,
  onPressRight,
  rightLabel = '?',
  rightSymbolName,
  rightAccessibilityLabel = 'abrir opcoes',
  style,
}: GameTopBarProps) {
  const { theme } = useTheme();
  const pulse = useSharedValue(0.64);
  const toneColor = resolveToneColor(statusTone, theme.semantic.text.muted, theme.semantic.status);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 860 }), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.84 + pulse.value * 0.2 }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: theme.semantic.layout.radius.xl,
          borderWidth: theme.semantic.layout.borderWidth.subtle,
          borderColor: theme.semantic.border.subtle,
          backgroundColor: withAlpha(theme.semantic.bg.overlay, 0.74),
          paddingHorizontal: theme.semantic.layout.spacing.md,
          paddingVertical: theme.semantic.layout.spacing.md,
          gap: theme.semantic.layout.spacing.sm,
          shadowColor: theme.semantic.shadow.neon,
          shadowOpacity: theme.semantic.elevation.low.shadowOpacity,
          shadowRadius: theme.semantic.elevation.low.shadowRadius,
          shadowOffset: { width: 0, height: 0 },
          elevation: theme.semantic.elevation.low.elevation,
        },
        style,
      ]}>
      <View style={styles.titleWrap}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            {
              color: theme.semantic.text.primary,
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[
              styles.subtitle,
              {
                color: theme.semantic.text.secondary,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightActions}>
        {statusLabel ? (
          <View
            style={[
              styles.statusPill,
              {
                borderColor: withAlpha(toneColor, 0.46),
                backgroundColor: withAlpha(toneColor, 0.16),
                borderWidth: theme.semantic.layout.borderWidth.subtle,
                borderRadius: theme.semantic.layout.radius.full,
                paddingHorizontal: theme.semantic.layout.spacing.sm,
                paddingVertical: theme.semantic.layout.spacing.xs,
              },
            ]}>
            <Animated.View
              style={[
                styles.statusDot,
                pulseStyle,
                {
                  backgroundColor: toneColor,
                  shadowColor: toneColor,
                },
              ]}
            />
            <Text
              style={[
                styles.statusPillLabel,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {statusLabel}
            </Text>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.statusDot,
              pulseStyle,
              {
                backgroundColor: toneColor,
                shadowColor: toneColor,
              },
            ]}
          />
        )}
        {onPressRight ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightAccessibilityLabel}
            onPress={onPressRight}
            style={({ pressed }) => [
              styles.iconButton,
              {
                width: theme.semantic.layout.minTouchTarget,
                height: theme.semantic.layout.minTouchTarget,
                borderRadius: theme.semantic.layout.radius.full,
                borderWidth: theme.semantic.layout.borderWidth.subtle,
                borderColor: theme.semantic.border.subtle,
                backgroundColor: theme.semantic.bg.elevated,
                opacity: pressed ? theme.semantic.motion.feedback.pressedOpacity : 1,
              },
            ]}>
            {rightSymbolName ? (
              <SymbolView
                name={rightSymbolName}
                size={18}
                tintColor={theme.semantic.button.secondary.bg}
              />
            ) : (
              <Text
                style={[
                  styles.iconLabel,
                  {
                    color: theme.semantic.button.secondary.bg,
                    fontFamily: theme.semantic.typography.numberFamily,
                    fontWeight: theme.semantic.typography.numberWeight,
                  },
                ]}>
                {rightLabel}
              </Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 24,
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 16,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    shadowOpacity: 0.76,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  statusPillLabel: {
    fontSize: 12,
    lineHeight: 14,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    fontSize: 18,
    lineHeight: 18,
  },
});
