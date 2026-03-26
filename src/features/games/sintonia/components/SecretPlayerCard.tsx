import { SymbolView } from 'expo-symbols';
import { memo, useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { SintoniaPlayer } from '@/src/features/games/sintonia/types';
import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite } from '@/src/ui/atoms';

type SecretPlayerCardProps = {
  player: SintoniaPlayer;
  isRevealed: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
  canReveal: boolean;
  columns: number;
  compact: boolean;
  holdHintLabel: string;
};

export const SecretPlayerCard = memo(function SecretPlayerCard({
  player,
  isRevealed,
  onPressIn,
  onPressOut,
  canReveal,
  columns,
  compact,
  holdHintLabel,
}: SecretPlayerCardProps) {
  const { theme } = useTheme();
  const burst = useSharedValue(0);
  const remotePulse = useSharedValue(0.6);
  const shouldShowSecret = isRevealed;

  useEffect(() => {
    if (!shouldShowSecret) {
      burst.value = 0;
      return;
    }

    burst.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 260, easing: Easing.in(Easing.cubic) })
    );
  }, [burst, shouldShowSecret]);

  const burstStyle = useAnimatedStyle(() => ({
    opacity: interpolate(burst.value, [0, 1], [0, 0.55]),
    transform: [{ scale: interpolate(burst.value, [0, 1], [0.6, 1.35]) }],
  }));

  useEffect(() => {
    if (player.isLocalDevice) {
      remotePulse.value = withTiming(0.2, { duration: 140 });
      return;
    }

    remotePulse.value = withRepeat(withTiming(1, { duration: 920 }), -1, true);
  }, [player.isLocalDevice, remotePulse]);

  const remoteSignalStyle = useAnimatedStyle(() => ({
    opacity: remotePulse.value,
    transform: [{ scale: 0.84 + remotePulse.value * 0.22 }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !canReveal }}
      accessibilityLabel={
        canReveal
          ? `${player.name}. ${isRevealed ? 'Numero revelado' : holdHintLabel}`
          : `${player.name}. Bloqueado neste dispositivo`
      }
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={!canReveal}
      style={({ pressed }) => [
        styles.secretCard,
        {
          backgroundColor: theme.semantic.bg.surface,
          width: columns === 1 ? '100%' : columns === 2 ? '48.8%' : '32.4%',
          minHeight: compact ? 82 : 90,
          borderColor: player.isHost
            ? '#D7A63D'
            : isRevealed
              ? theme.semantic.button.primary.bg
              : theme.semantic.border.subtle,
          borderWidth: isRevealed ? 1.7 : 1.3,
          shadowColor: isRevealed ? theme.semantic.button.primary.bg : theme.semantic.shadow.base,
          shadowOpacity: isRevealed ? 0.54 : 0.34,
          shadowRadius: isRevealed ? 14 : 8,
          elevation: isRevealed ? 10 : 4,
          opacity: canReveal ? (pressed ? 0.82 : 1) : 0.62,
        },
      ]}>
      <View
        pointerEvents="none"
        style={[styles.secretFrame, { borderColor: withAlpha(theme.semantic.text.primary, 0.13) }]}
      />
      <View
        pointerEvents="none"
        style={[styles.secretFrameInner, { borderColor: withAlpha(theme.semantic.text.primary, 0.09) }]}
      />
      {player.isHost ? (
        <View style={styles.hostCrown}>
          <SymbolView
            name={{ ios: 'crown.fill', android: 'crown', web: 'crown' }}
            size={12}
            tintColor="#D7A63D"
          />
        </View>
      ) : null}

      {!shouldShowSecret ? (
        <>
          <View
            style={[
              styles.secretAvatar,
              {
                borderColor: theme.semantic.border.subtle,
                backgroundColor: theme.semantic.bg.elevated,
              },
            ]}>
            <AvatarSprite avatarId={player.avatarId} size={38} />
          </View>
          <View
            style={[
              styles.secretLockWrap,
              {
                borderColor: withAlpha(theme.semantic.border.subtle, 0.9),
                backgroundColor: withAlpha(theme.semantic.bg.elevated, 0.75),
              },
            ]}>
            <SymbolView
              name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
              size={14}
              tintColor={theme.semantic.text.muted}
            />
          </View>
        </>
      ) : (
        <>
          <Animated.View
            style={[
              styles.secretBurst,
              {
                backgroundColor: withAlpha(theme.semantic.button.primary.bg, 0.55),
              },
              burstStyle,
            ]}
          />
          <Text
            style={[
              styles.secretNumber,
              {
                color: theme.semantic.button.primary.bg,
                fontFamily: theme.semantic.typography.numberFamily,
                fontWeight: theme.semantic.typography.numberWeight,
              },
            ]}>
            {player.secretNumber}
          </Text>
        </>
      )}

      <Text
        numberOfLines={1}
        style={[
          styles.secretName,
          {
            color: theme.semantic.text.secondary,
            fontFamily: theme.semantic.typography.bodyFamily,
            fontWeight: theme.semantic.typography.bodyWeight,
          },
        ]}>
        {player.name}
      </Text>

      {!player.isLocalDevice ? (
        <Animated.View
          style={[
            styles.remoteSignal,
            remoteSignalStyle,
            {
              borderColor: withAlpha(theme.semantic.status.success, 0.7),
              backgroundColor: withAlpha(theme.semantic.status.success, 0.12),
            },
          ]}>
          <SymbolView
            name={{ ios: 'wifi', android: 'wifi', web: 'wifi' }}
            size={10}
            tintColor={theme.semantic.status.success}
          />
        </Animated.View>
      ) : null}
      {!shouldShowSecret ? (
        <Text
          style={[
            styles.secretHint,
            {
              color: theme.semantic.text.muted,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {holdHintLabel}
        </Text>
      ) : null}
    </Pressable>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.player.id === nextProps.player.id &&
    prevProps.player.name === nextProps.player.name &&
    prevProps.player.avatarId === nextProps.player.avatarId &&
    prevProps.player.secretNumber === nextProps.player.secretNumber &&
    prevProps.player.isHost === nextProps.player.isHost &&
    prevProps.player.isLocalDevice === nextProps.player.isLocalDevice &&
    prevProps.isRevealed === nextProps.isRevealed &&
    prevProps.canReveal === nextProps.canReveal &&
    prevProps.columns === nextProps.columns &&
    prevProps.compact === nextProps.compact &&
    prevProps.holdHintLabel === nextProps.holdHintLabel
  );
});
