import { memo, useCallback, useEffect, useMemo } from 'react';
import { LayoutChangeEvent, PanResponder, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  Layout,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { SintoniaPlayer, SintoniaRevealFeedback } from '@/src/features/games/sintonia/types';
import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite } from '@/src/ui/atoms';

type OrderingCardProps = {
  index: number;
  player: SintoniaPlayer;
  revealFeedback: SintoniaRevealFeedback;
  isDragEnabled: boolean;
  onDrop: (playerId: string, dragX: number, dragY: number) => boolean;
  onMeasure?: (layout: { width: number; height: number }) => void;
  columns: number;
  compact: boolean;
  hiddenNumberLabel: string;
};

export const OrderingCard = memo(function OrderingCard({
  index,
  player,
  revealFeedback,
  isDragEnabled,
  onDrop,
  onMeasure,
  columns,
  compact,
  hiddenNumberLabel,
}: OrderingCardProps) {
  const { theme } = useTheme();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const dragActive = useSharedValue(0);
  const flipProgress = useSharedValue(revealFeedback === 'hidden' ? 0 : 1);

  useEffect(() => {
    flipProgress.value = withTiming(revealFeedback === 'hidden' ? 0 : 1, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    });
  }, [flipProgress, revealFeedback]);

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
    zIndex: scale.value > 1 ? 30 : 0,
    shadowOpacity: 0.12 + dragActive.value * 0.58,
    shadowRadius: 8 + dragActive.value * 14,
    elevation: 2 + dragActive.value * 10,
  }));
  const dragGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(dragActive.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(dragActive.value, [0, 1], [0.98, 1.02], Extrapolation.CLAMP) }],
  }));

  const frontFaceStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg` },
    ],
    opacity: interpolate(flipProgress.value, [0, 0.45, 0.55, 1], [1, 1, 0, 0]),
  }));

  const backFaceStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [-180, 0])}deg` },
    ],
    opacity: interpolate(flipProgress.value, [0, 0.45, 0.55, 1], [0, 0, 1, 1]),
  }));

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!onMeasure) {
        return;
      }

      const { width, height } = event.nativeEvent.layout;

      if (width > 0 && height > 0) {
        onMeasure({ width, height });
      }
    },
    [onMeasure]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => isDragEnabled,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          isDragEnabled && (Math.abs(gestureState.dy) > 3 || Math.abs(gestureState.dx) > 3),
        onPanResponderGrant: () => {
          if (!isDragEnabled) {
            return;
          }

          dragActive.value = withTiming(1, { duration: 120 });
          scale.value = withTiming(1.045, { duration: 120 });
        },
        onPanResponderMove: (_, gestureState) => {
          if (!isDragEnabled) {
            return;
          }

          translateX.value = gestureState.dx;
          translateY.value = gestureState.dy;
        },
        onPanResponderRelease: (_, gestureState) => {
          let moved = false;

          if (isDragEnabled) {
            moved = onDrop(player.id, gestureState.dx, gestureState.dy);
          }

          translateX.value = withSpring(0, {
            damping: moved ? 20 : 16,
            stiffness: moved ? 320 : 280,
            overshootClamping: moved,
          });
          translateY.value = withSpring(0, {
            damping: moved ? 20 : 16,
            stiffness: moved ? 320 : 280,
            overshootClamping: moved,
          });
          if (moved) {
            scale.value = withSequence(
              withTiming(1.03, { duration: 60, easing: Easing.out(Easing.quad) }),
              withTiming(1, { duration: 120, easing: Easing.out(Easing.cubic) })
            );
            dragActive.value = withSequence(withTiming(0.72, { duration: 80 }), withTiming(0, { duration: 150 }));
            return;
          }

          scale.value = withTiming(1, { duration: 130, easing: Easing.out(Easing.cubic) });
          dragActive.value = withTiming(0, { duration: 150 });
        },
        onPanResponderTerminate: () => {
          translateX.value = withSpring(0, { damping: 16, stiffness: 280 });
          translateY.value = withSpring(0, { damping: 16, stiffness: 280 });
          scale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.cubic) });
          dragActive.value = withTiming(0, { duration: 120 });
        },
      }),
    [dragActive, isDragEnabled, onDrop, player.id, scale, translateX, translateY]
  );

  const isCorrect = revealFeedback === 'correct';
  const isIncorrect = revealFeedback === 'incorrect';
  const innerBorderColor = player.isHost
    ? '#D7A63D'
    : isCorrect
      ? theme.semantic.status.success
      : isIncorrect
        ? theme.semantic.status.error
        : theme.semantic.border.subtle;

  return (
    <Animated.View
      layout={Layout.springify().damping(18).stiffness(170)}
      onLayout={handleLayout}
      style={[
        styles.orderingCard,
        {
          width:
            columns === 1
              ? '100%'
              : columns === 2
                ? '48.2%'
                : columns === 3
                  ? '31.6%'
                  : '23.8%',
          minHeight: compact ? 82 : 74,
          shadowColor:
            innerBorderColor === theme.semantic.border.subtle
              ? theme.semantic.shadow.base
              : innerBorderColor,
        },
        dragStyle,
      ]}
      {...panResponder.panHandlers}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orderingDragGlow,
          {
            borderColor: withAlpha(theme.semantic.button.primary.bg, 0.95),
            shadowColor: theme.semantic.button.primary.bg,
          },
          dragGlowStyle,
        ]}
      />
      <View style={styles.flipShell}>
        <Animated.View
          style={[
            styles.flipFace,
            {
              backgroundColor: theme.semantic.bg.surface,
              borderColor: innerBorderColor,
            },
            frontFaceStyle,
          ]}>
          <View style={styles.cornerBadgeWrap}>
            <View
              style={[
                styles.orderBadge,
                {
                  borderColor: withAlpha(theme.semantic.button.primary.bg, 0.95),
                  backgroundColor: withAlpha(theme.semantic.button.primary.bg, 0.22),
                },
              ]}>
              <Text
                style={[
                  styles.orderBadgeText,
                  {
                    color: theme.semantic.button.primary.bg,
                    fontFamily: theme.semantic.typography.numberFamily,
                    fontWeight: theme.semantic.typography.numberWeight,
                  },
                ]}>
                {index + 1}
              </Text>
            </View>
          </View>
          <View style={styles.cardMainRow}>
            <View
              style={[
                styles.avatarWrap,
                {
                  borderColor: theme.semantic.border.subtle,
                  backgroundColor: theme.semantic.bg.elevated,
                },
              ]}>
              <AvatarSprite avatarId={player.avatarId} size={44} />
            </View>
            <View style={styles.cardMeta}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.playerName,
                  {
                    color: theme.semantic.text.primary,
                    fontFamily: theme.semantic.typography.titleFamily,
                    fontWeight: theme.semantic.typography.titleWeight,
                  },
                ]}>
                {player.name}
              </Text>
              <Text
                style={[
                  styles.playerHint,
                  {
                    color: theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {hiddenNumberLabel}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.flipFace,
            styles.flipBackFace,
            {
              backgroundColor: theme.semantic.bg.surface,
              borderColor: innerBorderColor,
            },
            backFaceStyle,
          ]}>
          <View style={styles.cornerBadgeWrap}>
            <View
              style={[
                styles.orderBadge,
                {
                  borderColor: withAlpha(theme.semantic.button.primary.bg, 0.95),
                  backgroundColor: withAlpha(theme.semantic.button.primary.bg, 0.22),
                },
              ]}>
              <Text
                style={[
                  styles.orderBadgeText,
                  {
                    color: theme.semantic.button.primary.bg,
                    fontFamily: theme.semantic.typography.numberFamily,
                    fontWeight: theme.semantic.typography.numberWeight,
                  },
                ]}>
                {index + 1}
              </Text>
            </View>
          </View>
          <View style={styles.cardMainRow}>
            <View
              style={[
                styles.avatarWrap,
                {
                  borderColor: theme.semantic.border.subtle,
                  backgroundColor: theme.semantic.bg.elevated,
                },
              ]}>
              <AvatarSprite avatarId={player.avatarId} size={44} />
            </View>
            <View style={styles.cardMeta}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.playerName,
                  {
                    color: theme.semantic.text.primary,
                    fontFamily: theme.semantic.typography.titleFamily,
                    fontWeight: theme.semantic.typography.titleWeight,
                  },
                ]}>
                {player.name}
              </Text>
              <Text
                style={[
                  styles.revealedNumber,
                  {
                    color: isCorrect
                      ? theme.semantic.status.success
                      : isIncorrect
                        ? theme.semantic.status.error
                        : theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.numberFamily,
                    fontWeight: theme.semantic.typography.numberWeight,
                  },
                ]}>
                {player.secretNumber}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.index === nextProps.index &&
    prevProps.player.id === nextProps.player.id &&
    prevProps.player.name === nextProps.player.name &&
    prevProps.player.avatarId === nextProps.player.avatarId &&
    prevProps.player.secretNumber === nextProps.player.secretNumber &&
    prevProps.player.isHost === nextProps.player.isHost &&
    prevProps.revealFeedback === nextProps.revealFeedback &&
    prevProps.isDragEnabled === nextProps.isDragEnabled &&
    prevProps.columns === nextProps.columns &&
    prevProps.compact === nextProps.compact &&
    prevProps.hiddenNumberLabel === nextProps.hiddenNumberLabel
  );
});
