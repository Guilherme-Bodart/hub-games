import { SymbolView } from 'expo-symbols';
import { ComponentProps, useEffect } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';

type GameTopBarTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';
type GameTopBarSymbolName = ComponentProps<typeof SymbolView>['name'];

type GameTopBarProps = {
  title: string;
  subtitle?: string;
  showStatus?: boolean;
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
  showStatus = true,
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
          borderRadius: 24,
          borderWidth: theme.semantic.layout.borderWidth.subtle,
          borderColor: '#D9E2EF',
          backgroundColor: '#FFFFFF',
          paddingHorizontal: theme.semantic.layout.spacing.md,
          paddingVertical: theme.semantic.layout.spacing.md,
          gap: theme.semantic.layout.spacing.sm,
          shadowColor: '#000000',
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        },
        style,
      ]}>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.04)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.topGloss}
      />
      <View style={styles.titleWrap}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            {
              color: '#23254D',
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
                color: '#5B6585',
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightActions}>
        {showStatus
          ? statusLabel ? (
              <View
                style={[
                  styles.statusPill,
                  {
                    borderColor: withAlpha(toneColor, 0.3),
                    backgroundColor: withAlpha(toneColor, 0.14),
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
                      color: '#2B2A46',
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
            )
          : null}
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
                borderColor: 'rgba(0,0,0,0.12)',
                backgroundColor: '#FFFFFF',
                shadowColor: '#000000',
                shadowOpacity: 0.3,
                shadowRadius: 6,
                shadowOffset: { width: 4, height: 4 },
                elevation: 7,
                opacity: pressed ? theme.semantic.motion.feedback.pressedOpacity : 1,
              },
            ]}>
            {rightSymbolName ? (
              <SymbolView
                name={rightSymbolName}
                size={18}
                tintColor="#2B2A46"
              />
            ) : (
              <Text
                style={[
                  styles.iconLabel,
                  {
                    color: '#2B2A46',
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
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topGloss: {
    ...StyleSheet.absoluteFillObject,
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
    shadowOpacity: 0.26,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
