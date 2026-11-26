import { SymbolView } from 'expo-symbols';
import { ComponentProps, useEffect } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ELEVATION_STYLES, useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { useReducedMotion } from '@/src/ui/motion';

type GameTopBarTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';
type GameTopBarSymbolName = ComponentProps<typeof SymbolView>['name'];

type GameTopBarProps = {
  title: string;
  subtitle?: string;
  showStatus?: boolean;
  statusTone?: GameTopBarTone;
  statusLabel?: string;
  onPressLeft?: () => void;
  leftSymbolName?: GameTopBarSymbolName;
  leftAccessibilityLabel?: string;
  onPressRight?: () => void;
  rightLabel?: string;
  rightSymbolName?: GameTopBarSymbolName;
  rightAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function GameTopBar({
  title,
  subtitle,
  showStatus = true,
  statusTone = 'success',
  statusLabel,
  onPressLeft,
  leftSymbolName = { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  leftAccessibilityLabel = 'Voltar',
  onPressRight,
  rightLabel = '?',
  rightSymbolName,
  rightAccessibilityLabel = 'Abrir opções',
  style,
}: GameTopBarProps) {
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);
  const toneColor =
    statusTone === 'neutral' ? theme.semantic.text.muted : theme.semantic.status[statusTone];

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(pulse);
      pulse.value = 1;
      return;
    }

    pulse.value = 0.65;
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    return () => cancelAnimation(pulse);
  }, [pulse, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: reduceMotion ? 1 : 0.88 + pulse.value * 0.14 }],
  }));

  return (
    <View
      style={[
        styles.container,
        ELEVATION_STYLES.card,
        {
          backgroundColor: theme.semantic.bg.surface,
          borderColor: theme.semantic.border.hairline,
        },
        style,
      ]}>
      {onPressLeft ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={leftAccessibilityLabel}
          onPress={onPressLeft}
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: theme.semantic.bg.subtle,
              borderColor: theme.semantic.border.hairline,
              opacity: pressed ? 0.72 : 1,
            },
          ]}>
          <SymbolView name={leftSymbolName} size={18} tintColor={theme.semantic.text.primary} />
        </Pressable>
      ) : null}

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
        {showStatus ? (
          statusLabel ? (
            <View
              style={[
                styles.statusPill,
                {
                  borderColor: withAlpha(toneColor, 0.28),
                  backgroundColor: withAlpha(toneColor, 0.12),
                },
              ]}>
              <Animated.View
                style={[styles.statusDot, pulseStyle, { backgroundColor: toneColor }]}
              />
              <Text
                numberOfLines={1}
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
            <Animated.View style={[styles.statusDot, pulseStyle, { backgroundColor: toneColor }]} />
          )
        ) : null}

        {onPressRight ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightAccessibilityLabel}
            onPress={onPressRight}
            style={({ pressed }) => [
              styles.iconButton,
              {
                backgroundColor: theme.semantic.bg.subtle,
                borderColor: theme.semantic.border.hairline,
                opacity: pressed ? 0.72 : 1,
              },
            ]}>
            {rightSymbolName ? (
              <SymbolView
                name={rightSymbolName}
                size={18}
                tintColor={theme.semantic.text.primary}
              />
            ) : (
              <Text
                style={[
                  styles.iconLabel,
                  {
                    color: theme.semantic.text.primary,
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
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    overflow: 'visible',
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
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
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  statusPillLabel: {
    fontSize: 12,
    lineHeight: 15,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    fontSize: 16,
    lineHeight: 18,
  },
});
