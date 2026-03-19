import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';

type GameShellHudProps = {
  gameName: string;
  roomCode: string;
  modeLabel: string;
  phaseLabel: string | null;
  connectionLabel: string;
  connectionTone: 'success' | 'warning' | 'error';
};

export function GameShellHud({
  gameName,
  roomCode: _roomCode,
  modeLabel: _modeLabel,
  phaseLabel,
  connectionLabel: _connectionLabel,
  connectionTone,
}: GameShellHudProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const toneColor = theme.semantic.status[connectionTone];
  const pulse = useSharedValue(0.68);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 840 }), -1, true);
  }, [pulse]);

  const dotPulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.85 + pulse.value * 0.2 }],
  }));

  return (
    <View pointerEvents="none" style={[styles.root, { top: insets.top + 6 }]}>
      <View
        style={[
          styles.bar,
          {
            borderColor: theme.semantic.border.subtle,
            backgroundColor: withAlpha(theme.semantic.bg.overlay, 0.72),
          },
        ]}>
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
          {gameName}
        </Text>
        <View style={styles.rightCluster}>
          {phaseLabel ? (
            <Text
              style={[
                styles.phaseLabel,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {phaseLabel}
            </Text>
          ) : null}
          <Animated.View
            style={[
              styles.dot,
              dotPulseStyle,
              {
                backgroundColor: toneColor,
                shadowColor: toneColor,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 10,
    right: 10,
    zIndex: 30,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  title: {
    fontSize: 16,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phaseLabel: {
    fontSize: 11,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    shadowOpacity: 0.75,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
