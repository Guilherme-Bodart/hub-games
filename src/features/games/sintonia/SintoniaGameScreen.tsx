import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { memo, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  Layout,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createHiddenRevealMap,
  createPlayersMap,
  createSintoniaRound,
  evaluateRevealStep,
  movePlayerId,
} from '@/src/features/games/sintonia/logic';
import {
  applyRemoteSintoniaRevealStep,
  finishRemoteSintoniaRound,
  initializeRemoteSintoniaRound,
  remoteSintoniaStateExists,
  setRemoteSintoniaOrder,
  setRemoteSintoniaPhase,
  startRemoteSintoniaReveal,
  subscribeRemoteSintoniaState,
} from '@/src/features/games/sintonia/realtime';
import {
  SintoniaPhase,
  SintoniaPlayer,
  SintoniaRevealFeedback,
  SintoniaRound,
  SintoniaRoundResult,
} from '@/src/features/games/sintonia/types';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { useLobbySessionStore } from '@/src/features/lobby';
import { resolveLobbyActionAuthorityMode } from '@/src/features/lobby/gameSettings';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite, Badge, BottomActionDock, Button, Card, GameScreenShell, GameTopBar, Modal } from '@/src/ui/atoms';

const CARD_DROP_VERTICAL_STEP = 92;
const ORDERING_GRID_ROW_GAP = 4;
const ORDERING_GRID_COLUMN_GAP = 10;
const REVEAL_INTERVAL_MS = 200;
const ORDER_SYNC_DEBOUNCE_MS = 90;

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

const SecretPlayerCard = memo(function SecretPlayerCard({
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

const OrderingCard = memo(function OrderingCard({
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
            dragActive.value = withSequence(
              withTiming(0.72, { duration: 80 }),
              withTiming(0, { duration: 150 })
            );
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

const waitWithTrackedTimer = (
  timersRef: MutableRefObject<Array<ReturnType<typeof setTimeout>>>,
  durationMs: number
): Promise<void> =>
  new Promise((resolve) => {
    const timeoutId = setTimeout(resolve, durationMs);
    timersRef.current.push(timeoutId);
  });

export function SintoniaGameScreen({ lobby, onExitLobby, setShellPhase }: GameRuntimeScreenProps) {
  const { theme } = useTheme();
  const { locale, t } = useI18n();
  const { width: viewportWidth } = useWindowDimensions();
  const isRemoteRealtime = lobby.mode === 'remote';
  const realtimeStatus = useLobbySessionStore((state) => state.realtimeStatus);
  const realtimeError = useLobbySessionStore((state) => state.realtimeError);
  const localDeviceId = lobby.selectedDeviceId;
  const roomCode = lobby.roomCode;

  const [round, setRound] = useState<SintoniaRound | null>(null);
  const [phase, setPhase] = useState<SintoniaPhase>('secrets');
  const [roundResult, setRoundResult] = useState<SintoniaRoundResult>('pending');
  const [orderedPlayerIds, setOrderedPlayerIds] = useState<string[]>([]);
  const [revealedById, setRevealedById] = useState<Record<string, SintoniaRevealFeedback>>({});
  const [revealedCount, setRevealedCount] = useState(0);
  const [activeSecretPlayerId, setActiveSecretPlayerId] = useState<string | null>(null);
  const [roundError, setRoundError] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(false);
  const [orderingCardMetrics, setOrderingCardMetrics] = useState<{ width: number; height: number } | null>(
    null
  );

  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const orderSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const hasBootstrappedRemoteRoundRef = useRef(false);
  const latestLobbyRef = useRef(lobby);

  useEffect(() => {
    latestLobbyRef.current = lobby;
  }, [lobby]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];

    if (orderSyncTimerRef.current) {
      clearTimeout(orderSyncTimerRef.current);
      orderSyncTimerRef.current = null;
    }
  }, []);

  const isHostDevice = useMemo(() => {
    const device = lobby.devices.find((entry) => entry.id === localDeviceId);
    return Boolean(device?.players.some((player) => player.isHost));
  }, [lobby.devices, localDeviceId]);
  const canControlCriticalActions = useMemo(
    () => resolveLobbyActionAuthorityMode(lobby.gameSettings) === 'collaborative' || isHostDevice,
    [isHostDevice, lobby.gameSettings]
  );

  const initializeRound = useCallback(() => {
    clearTimers();

    try {
      const nextRound = createSintoniaRound({ lobby, locale });
      setRound(nextRound);
      setOrderedPlayerIds(nextRound.initialOrder);
      setRevealedById(createHiddenRevealMap(nextRound.players));
      setPhase('secrets');
      setRoundResult('pending');
      setRevealedCount(0);
      setActiveSecretPlayerId(null);
      setRoundError(false);
    } catch {
      setRound(null);
      setRoundError(true);
    }
  }, [clearTimers, lobby, locale]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!isRemoteRealtime) {
      initializeRound();
      hasBootstrappedRemoteRoundRef.current = false;
    }

    return () => {
      isMountedRef.current = false;
      clearTimers();
    };
  }, [clearTimers, initializeRound, isRemoteRealtime]);

  const initializeRemoteRoundIfNeeded = useCallback(async () => {
    if (!isRemoteRealtime || !canControlCriticalActions || hasBootstrappedRemoteRoundRef.current) {
      return;
    }

    hasBootstrappedRemoteRoundRef.current = true;

    try {
      const alreadyExists = await remoteSintoniaStateExists(roomCode);

      if (alreadyExists) {
        return;
      }

      const nextRound = createSintoniaRound({
        lobby: latestLobbyRef.current,
        locale,
      });

      await initializeRemoteSintoniaRound(roomCode, nextRound, localDeviceId);
    } catch {
      hasBootstrappedRemoteRoundRef.current = false;
      setRoundError(true);
    }
  }, [canControlCriticalActions, isRemoteRealtime, locale, localDeviceId, roomCode]);

  useEffect(() => {
    if (!isRemoteRealtime) {
      return;
    }

    const unsubscribe = subscribeRemoteSintoniaState({
      roomCode,
      localDeviceId,
      onState: (remoteState) => {
        if (!remoteState) {
          void initializeRemoteRoundIfNeeded();
          return;
        }

        setRound(remoteState.round);
        setPhase(remoteState.phase);
        setRoundResult(remoteState.roundResult);
        setOrderedPlayerIds(remoteState.orderedPlayerIds);
        setRevealedById(remoteState.revealedById);
        setRevealedCount(remoteState.revealedCount);
        setRoundError(false);
      },
      onError: () => {
        setRoundError(true);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [initializeRemoteRoundIfNeeded, isRemoteRealtime, localDeviceId, roomCode]);

  const playersById = useMemo(() => (round ? createPlayersMap(round.players) : {}), [round]);
  const orderedPlayers = useMemo(
    () => orderedPlayerIds.map((playerId) => playersById[playerId]).filter(Boolean),
    [orderedPlayerIds, playersById]
  );
  const activeSecretPlayer = useMemo(
    () =>
      activeSecretPlayerId
        ? orderedPlayers.find((player) => player.id === activeSecretPlayerId) ?? null
        : null,
    [activeSecretPlayerId, orderedPlayers]
  );
  const isCompactViewport = viewportWidth < 390;
  const secretGridColumns =
    viewportWidth >= 760 ? 4 : viewportWidth >= 560 ? 3 : isCompactViewport ? 1 : 2;
  const orderingGridColumns = viewportWidth >= 900 ? 4 : viewportWidth >= 520 ? 3 : 2;
  const handleOrderingCardMeasure = useCallback((layout: { width: number; height: number }) => {
    setOrderingCardMetrics((current) => {
      if (
        current &&
        Math.abs(current.width - layout.width) < 1 &&
        Math.abs(current.height - layout.height) < 1
      ) {
        return current;
      }

      return layout;
    });
  }, []);

  const onDropPlayer = useCallback(
    (playerId: string, dragX: number, dragY: number): boolean => {
      if (phase !== 'ordering') {
        return false;
      }

      let moved = false;

      setOrderedPlayerIds((currentOrder) => {
        const fromIndex = currentOrder.indexOf(playerId);

        if (fromIndex < 0) {
          return currentOrder;
        }

        const fallbackColumnStep = orderingGridColumns === 4 ? 92 : orderingGridColumns === 3 ? 118 : 164;
        const columnStep =
          (orderingCardMetrics?.width ?? fallbackColumnStep) + ORDERING_GRID_COLUMN_GAP;
        const rowStep =
          (orderingCardMetrics?.height ?? CARD_DROP_VERTICAL_STEP) + ORDERING_GRID_ROW_GAP;
        const deltaColumns = Math.round(dragX / columnStep);
        const deltaRows = Math.round(dragY / rowStep);
        const deltaSlots = deltaRows * orderingGridColumns + deltaColumns;

        if (deltaSlots === 0) {
          return currentOrder;
        }

        const toIndex = Math.max(0, Math.min(currentOrder.length - 1, fromIndex + deltaSlots));

        if (toIndex === fromIndex) {
          return currentOrder;
        }

        const nextOrder = movePlayerId(currentOrder, fromIndex, toIndex);
        moved = true;

        if (isRemoteRealtime) {
          if (orderSyncTimerRef.current) {
            clearTimeout(orderSyncTimerRef.current);
          }

          orderSyncTimerRef.current = setTimeout(() => {
            void setRemoteSintoniaOrder(roomCode, nextOrder, localDeviceId).catch(() => {
              setRoundError(true);
            });
          }, ORDER_SYNC_DEBOUNCE_MS);
        }

        void Haptics.selectionAsync();
        return nextOrder;
      });

      return moved;
    },
    [isRemoteRealtime, localDeviceId, orderingCardMetrics, orderingGridColumns, phase, roomCode]
  );

  const revealOrder = useCallback(async () => {
    if (!round || phase !== 'ordering') {
      return;
    }

    const hiddenMap = createHiddenRevealMap(round.players);

    clearTimers();

    if (!isRemoteRealtime) {
      setPhase('revealing');
      setRoundResult('pending');
      setRevealedById(hiddenMap);
      setRevealedCount(0);
      setActiveSecretPlayerId(null);
    } else {
      if (!canControlCriticalActions) {
        return;
      }

      await startRemoteSintoniaReveal(roomCode, hiddenMap, localDeviceId);
    }

    let previousNumber: number | null = null;
    let hasFailure = false;

    for (let index = 0; index < orderedPlayerIds.length; index += 1) {
      await waitWithTrackedTimer(timersRef, REVEAL_INTERVAL_MS);

      if (!isMountedRef.current) {
        return;
      }

      const player = playersById[orderedPlayerIds[index]];

      if (!player) {
        continue;
      }

      const { isCorrect, nextPrevious } = evaluateRevealStep(previousNumber, player.secretNumber);
      previousNumber = nextPrevious;

      if (!isCorrect) {
        hasFailure = true;
      }

      if (!isRemoteRealtime) {
        setRevealedCount(index + 1);
        setRevealedById((currentState) => ({
          ...currentState,
          [player.id]: isCorrect ? 'correct' : 'incorrect',
        }));
      } else {
        await applyRemoteSintoniaRevealStep(
          roomCode,
          player.id,
          isCorrect ? 'correct' : 'incorrect',
          index + 1,
          localDeviceId
        );
      }

      void Haptics.impactAsync(
        isCorrect ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy
      );

      if (!isCorrect) {
        if (!isRemoteRealtime) {
          const remainingUpdates: Record<string, SintoniaRevealFeedback> = {};
          let remainingRevealCount = index + 1;

          for (let remainingIndex = index + 1; remainingIndex < orderedPlayerIds.length; remainingIndex += 1) {
            const remainingPlayer = playersById[orderedPlayerIds[remainingIndex]];

            if (!remainingPlayer) {
              continue;
            }

            const remainingEvaluation = evaluateRevealStep(previousNumber, remainingPlayer.secretNumber);
            previousNumber = remainingEvaluation.nextPrevious;
            remainingUpdates[remainingPlayer.id] = remainingEvaluation.isCorrect ? 'correct' : 'incorrect';
            remainingRevealCount = remainingIndex + 1;
          }

          if (Object.keys(remainingUpdates).length) {
            setRevealedCount(remainingRevealCount);
            setRevealedById((currentState) => ({
              ...currentState,
              ...remainingUpdates,
            }));
          }
        } else {
          for (let remainingIndex = index + 1; remainingIndex < orderedPlayerIds.length; remainingIndex += 1) {
            if (!isMountedRef.current) {
              return;
            }

            const remainingPlayer = playersById[orderedPlayerIds[remainingIndex]];

            if (!remainingPlayer) {
              continue;
            }

            const remainingEvaluation = evaluateRevealStep(previousNumber, remainingPlayer.secretNumber);
            previousNumber = remainingEvaluation.nextPrevious;

            await applyRemoteSintoniaRevealStep(
              roomCode,
              remainingPlayer.id,
              remainingEvaluation.isCorrect ? 'correct' : 'incorrect',
              remainingIndex + 1,
              localDeviceId
            );
          }
        }

        break;
      }
    }

    if (!isRemoteRealtime) {
      setRoundResult(hasFailure ? 'failure' : 'success');
      setPhase('finished');
    } else {
      await finishRemoteSintoniaRound(roomCode, hasFailure ? 'failure' : 'success', localDeviceId);
    }

    void Haptics.notificationAsync(
      hasFailure
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Success
    );
  }, [
    clearTimers,
    canControlCriticalActions,
    isRemoteRealtime,
    localDeviceId,
    orderedPlayerIds,
    phase,
    playersById,
    roomCode,
    round,
  ]);

  const startNewRound = useCallback(async () => {
    if (!isRemoteRealtime) {
      initializeRound();
      return;
    }

    if (!canControlCriticalActions) {
      return;
    }

    try {
      const nextRound = createSintoniaRound({
        lobby: latestLobbyRef.current,
        locale,
      });
      await initializeRemoteSintoniaRound(roomCode, nextRound, localDeviceId);
    } catch {
      setRoundError(true);
    }
  }, [canControlCriticalActions, initializeRound, isRemoteRealtime, locale, localDeviceId, roomCode]);

  const primaryAction = useMemo(
    () =>
      phase === 'secrets'
        ? {
            label: t('sintonia.goToOrdering'),
            onPress: () => {
              setActiveSecretPlayerId(null);
              if (!isRemoteRealtime) {
                setPhase('ordering');
                return;
              }

              void setRemoteSintoniaPhase(roomCode, 'ordering', localDeviceId).catch(() => {
                setRoundError(true);
              });
            },
            disabled: false,
          }
        : phase === 'ordering'
          ? {
              label: t('sintonia.revealOrder'),
              onPress: () => {
                void revealOrder();
              },
              disabled: isRemoteRealtime && !canControlCriticalActions,
            }
          : phase === 'revealing'
            ? {
                label: t('sintonia.revealingProgress', {
                  current: revealedCount,
                  total: orderedPlayerIds.length,
                }),
                onPress: () => undefined,
                disabled: true,
              }
            : {
                label: t('sintonia.newRound'),
                onPress: () => {
                  void startNewRound();
                },
                disabled: isRemoteRealtime && !canControlCriticalActions,
              },
    [
      canControlCriticalActions,
      isRemoteRealtime,
      localDeviceId,
      orderedPlayerIds.length,
      phase,
      revealOrder,
      revealedCount,
      roomCode,
      startNewRound,
      t,
    ]
  );

  const phaseBadgeLabel =
    phase === 'secrets'
      ? t('sintonia.secretPhaseTitle')
      : phase === 'ordering'
        ? t('sintonia.orderingPhaseTitle')
        : phase === 'revealing'
          ? t('sintonia.revealingPhaseTitle')
          : roundResult === 'success'
            ? t('sintonia.successTitle')
            : t('sintonia.failureTitle');
  const playersSectionLabel = locale === 'pt' ? 'Jogadores' : 'Players';
  const dragDirectionHint =
    locale === 'pt'
      ? 'Arraste para os lados e para cima/baixo para reposicionar'
      : 'Drag sideways or up/down to reposition';
  const dockHelperText =
    phase === 'secrets'
      ? locale === 'pt'
        ? 'Segure no seu card para revelar seu numero.'
        : 'Hold your card to reveal your number.'
      : phase === 'ordering'
        ? dragDirectionHint
        : phase === 'revealing'
          ? locale === 'pt'
            ? 'Aguarde a revelacao.'
            : 'Wait for reveal.'
          : locale === 'pt'
            ? 'Rodada finalizada. Pronto para outra?'
            : 'Round finished. Ready for another one?';
  const canAdvancePhase = !isRemoteRealtime || canControlCriticalActions;
  const topBarStatusTone =
    realtimeStatus === 'error'
      ? 'error'
      : realtimeStatus === 'connecting' || realtimeStatus === 'reconnecting' || realtimeStatus === 'idle'
        ? 'warning'
        : 'success';
  const titleFlicker = useSharedValue(0.8);
  const themeBorderGlow = useSharedValue(0.72);
  const themeShineOffset = useSharedValue(-260);

  useEffect(() => {
    titleFlicker.value = withRepeat(
      withSequence(
        withTiming(0.52, { duration: 90 }),
        withTiming(1, { duration: 120 }),
        withTiming(0.86, { duration: 700 }),
        withTiming(1, { duration: 580 })
      ),
      -1,
      false
    );
    themeShineOffset.value = withRepeat(
      withSequence(
        withTiming(viewportWidth + 120, { duration: 1900, easing: Easing.linear }),
        withTiming(-260, { duration: 0 })
      ),
      -1,
      false
    );
    themeBorderGlow.value = withRepeat(withTiming(1, { duration: 1400 }), -1, true);
  }, [themeBorderGlow, themeShineOffset, titleFlicker, viewportWidth]);

  const titleFlickerStyle = useAnimatedStyle(() => ({
    opacity: titleFlicker.value,
    transform: [{ scale: 0.992 + titleFlicker.value * 0.016 }],
  }));

  const themeShineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: themeShineOffset.value }, { rotate: '-7deg' }],
  }));

  const themeGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.2 + themeBorderGlow.value * 0.28,
    shadowRadius: 10 + themeBorderGlow.value * 10,
    elevation: 5 + themeBorderGlow.value * 6,
  }));

  useEffect(() => {
    if (isRemoteRealtime && !round && !roundError) {
      setShellPhase?.(t('connection.reconnecting'));
      return;
    }

    if (!round || roundError) {
      setShellPhase?.(t('game.unavailableTitle'));
      return;
    }

    setShellPhase?.(phaseBadgeLabel);
  }, [isRemoteRealtime, phaseBadgeLabel, round, roundError, setShellPhase, t]);

  if (isRemoteRealtime && !round && !roundError) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
        <View style={styles.emptyWrap}>
          <Card title={t('sintonia.title')} subtitle="Sincronizando rodada em tempo real..." />
        </View>
      </SafeAreaView>
    );
  }

  if (!round || roundError) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
        <View style={styles.emptyWrap}>
          <Card
            title={t('sintonia.notEnoughPlayersTitle')}
            subtitle={t('sintonia.notEnoughPlayersSubtitle')}>
            <Button label={t('sintonia.backLobby')} onPress={onExitLobby} />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <GameScreenShell
        footerInset={176}
        footer={
          <BottomActionDock
            helperText={dockHelperText}
            primaryAction={{
              label: primaryAction.label,
              onPress: primaryAction.onPress,
              disabled: primaryAction.disabled,
              style: {
                backgroundColor: withAlpha(theme.semantic.button.primary.bg, 0.88),
                borderColor: withAlpha(theme.semantic.button.primary.bg, 0.92),
                shadowColor: theme.semantic.button.primary.bg,
                shadowOpacity: 0.8,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 0 },
                elevation: 14,
              },
            }}
            secondaryAction={{
              label: t('sintonia.backLobby'),
              onPress: onExitLobby,
              variant: 'ghost',
              style: {
                backgroundColor: withAlpha(theme.semantic.bg.surface, 0.35),
                borderColor: withAlpha(theme.semantic.border.subtle, 0.95),
                shadowOpacity: 0,
                elevation: 0,
              },
            }}
          />
        }>
        <GameTopBar
          title={t('sintonia.title')}
          subtitle={phaseBadgeLabel}
          statusTone={topBarStatusTone}
          onPressRight={() => setRulesVisible(true)}
          style={styles.topBarSpacing}
        />

        {phase === 'secrets' && activeSecretPlayer ? (
          <Animated.View
            style={[
              styles.secretHeroOverlay,
              {
                borderColor: withAlpha(theme.semantic.button.primary.bg, 0.82),
                backgroundColor: withAlpha(theme.semantic.bg.surface, 0.9),
                shadowColor: theme.semantic.button.primary.bg,
              },
            ]}>
            <View
              style={[
                styles.secretHeroFrame,
                { borderColor: withAlpha(theme.semantic.text.primary, 0.14) },
              ]}
            />
            <View
              style={[
                styles.secretHeroFrameInner,
                { borderColor: withAlpha(theme.semantic.text.primary, 0.1) },
              ]}
            />
            <AvatarSprite avatarId={activeSecretPlayer.avatarId} size={78} />
            <Text
              numberOfLines={1}
              style={[
                styles.secretHeroName,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {activeSecretPlayer.name}
            </Text>
            <Text
              style={[
                styles.secretHeroNumber,
                {
                  color: theme.semantic.button.primary.bg,
                  fontFamily: theme.semantic.typography.numberFamily,
                  fontWeight: theme.semantic.typography.numberWeight,
                },
              ]}>
              {activeSecretPlayer.secretNumber}
            </Text>
            <Text
              style={[
                styles.secretHeroHint,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {locale === 'pt' ? 'Solte para ocultar' : 'Release to hide'}
            </Text>
          </Animated.View>
        ) : null}

        <Animated.View
          style={[
            styles.themeWrap,
            {
              borderColor: withAlpha(theme.semantic.button.primary.bg, 0.78),
              backgroundColor: withAlpha(theme.semantic.bg.surface, 0.62),
              shadowColor: withAlpha(theme.semantic.button.primary.bg, 0.95),
            },
            themeGlowStyle,
          ]}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.themeShineSweep,
              themeShineStyle,
              { backgroundColor: withAlpha(theme.semantic.text.primary, 0.12) },
            ]}
          />
          <Animated.Text
            style={[
              styles.themeText,
              titleFlickerStyle,
              {
                color: theme.semantic.text.primary,
                textShadowColor: withAlpha(theme.semantic.button.primary.bg, 0.58),
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
              },
            ]}>
            {round.theme}
          </Animated.Text>
        </Animated.View>

        <View
          style={[
            styles.voiceNotice,
            {
              borderColor: theme.semantic.border.subtle,
              backgroundColor: withAlpha(theme.semantic.bg.surface, 0.7),
            },
          ]}>
          <Text
            style={[
              styles.voiceNoticeText,
              {
                color: theme.semantic.text.secondary,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {t('sintonia.voiceNotice')}
          </Text>
        </View>
        {!canAdvancePhase ? (
          <Text
            style={[
              styles.hostHintText,
              {
                color: theme.semantic.status.warning,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {t('sintonia.hostControlHint')}
          </Text>
        ) : null}
        {isRemoteRealtime && realtimeError ? (
          <Text
            style={[
              styles.hostHintText,
              {
                color: theme.semantic.status.warning,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {realtimeError}
          </Text>
        ) : null}

        <View style={styles.playersMetaRow}>
          <Text
            style={[
              styles.playersSectionTitle,
              {
                color: theme.semantic.text.primary,
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
              },
            ]}>
            {playersSectionLabel}
          </Text>
          <Badge
            label={t('sintonia.playersBadge', { count: orderedPlayers.length })}
            variant="info"
          />
        </View>

        <View
          style={[
            styles.cardsViewport,
            {
              borderColor: withAlpha(theme.semantic.border.subtle, 0.7),
              backgroundColor: withAlpha(theme.semantic.bg.surface, 0.5),
            },
          ]}>
          {!orderedPlayers.length ? (
            <View style={styles.emptyCardsState}>
              <Text
                style={[
                  styles.emptyCardsText,
                  {
                    color: theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {locale === 'pt'
                  ? 'Aguardando jogadores para iniciar esta rodada.'
                  : 'Waiting for players to start this round.'}
              </Text>
            </View>
          ) : null}
          {phase === 'secrets' ? (
            <ScrollView
              contentContainerStyle={styles.secretGrid}
              showsVerticalScrollIndicator={false}
              bounces>
              {orderedPlayers.map((player) => (
                <SecretPlayerCard
                  key={player.id}
                  player={player}
                  columns={secretGridColumns}
                  compact={isCompactViewport}
                  holdHintLabel={locale === 'pt' ? 'Segure para revelar' : 'Hold to reveal'}
                  isRevealed={activeSecretPlayerId === player.id}
                  canReveal={player.isLocalDevice}
                  onPressIn={() => {
                    if (!player.isLocalDevice) {
                      return;
                    }

                    setActiveSecretPlayerId(player.id);
                    void Haptics.selectionAsync();
                  }}
                  onPressOut={() => {
                    setActiveSecretPlayerId((currentPlayerId) =>
                      currentPlayerId === player.id ? null : currentPlayerId
                    );
                  }}
                />
              ))}
            </ScrollView>
          ) : (
            <ScrollView
              contentContainerStyle={styles.orderingGrid}
              showsVerticalScrollIndicator={false}
              bounces>
              {orderedPlayers.map((player, index) => (
                <OrderingCard
                  key={player.id}
                  index={index}
                  player={player}
                  onMeasure={handleOrderingCardMeasure}
                  columns={orderingGridColumns}
                  compact={isCompactViewport}
                  revealFeedback={revealedById[player.id] ?? 'hidden'}
                  isDragEnabled={phase === 'ordering'}
                  onDrop={onDropPlayer}
                  hiddenNumberLabel={t('sintonia.hiddenNumber')}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </GameScreenShell>

      <Modal
        visible={rulesVisible}
        title={t('sintonia.rulesTitle')}
        onClose={() => setRulesVisible(false)}>
        <Text
          style={[
            styles.rulesText,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {t('sintonia.rulesObjective')}
        </Text>
        <Text
          style={[
            styles.rulesText,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          1. {t('sintonia.rulesStepOne')}
        </Text>
        <Text
          style={[
            styles.rulesText,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          2. {t('sintonia.rulesStepTwo')}
        </Text>
        <Text
          style={[
            styles.rulesText,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          3. {t('sintonia.rulesStepThree')}
        </Text>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBarSpacing: {
    paddingTop: 20,
    paddingBottom: 14,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  themeWrap: {
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 146,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    borderWidth: 1.3,
    borderRadius: 24,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 7,
  },
  themeText: {
    textAlign: 'center',
    fontSize: 34,
    lineHeight: 39,
    textShadowRadius: 18,
    letterSpacing: 0.5,
  },
  themeShineSweep: {
    position: 'absolute',
    left: -260,
    top: -30,
    bottom: -30,
    width: 90,
    borderRadius: 20,
  },
  voiceNotice: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  voiceNoticeText: {
    fontSize: 12,
    lineHeight: 17,
  },
  hostHintText: {
    fontSize: 12,
  },
  playersMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  playersSectionTitle: {
    fontSize: 17,
  },
  cardsViewport: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  emptyCardsState: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  emptyCardsText: {
    fontSize: 13,
    textAlign: 'center',
  },
  secretGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 20,
  },
  secretCard: {
    width: '48.8%',
    minHeight: 92,
    borderWidth: 1.3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingTop: 7,
    paddingBottom: 3,
    overflow: 'hidden',
    position: 'relative',
    shadowOpacity: 0.36,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  secretFrame: {
    position: 'absolute',
    top: 6,
    right: 6,
    bottom: 6,
    left: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  secretFrameInner: {
    position: 'absolute',
    top: 14,
    right: 14,
    bottom: 14,
    left: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  hostCrown: {
    position: 'absolute',
    top: 4,
    right: 6,
    zIndex: 2,
    transform: [{ scale: 1.2 }],
  },
  secretAvatar: {
    width: 46,
    height: 46,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  secretLockWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  secretAvatarText: {
    fontSize: 16,
  },
  secretBurst: {
    position: 'absolute',
    top: 14,
    width: 54,
    height: 54,
    borderRadius: 999,
    zIndex: 1,
  },
  secretNumber: {
    marginTop: 4,
    fontSize: 30,
    lineHeight: 32,
    zIndex: 2,
  },
  secretName: {
    width: '100%',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 13,
  },
  secretHint: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 12,
    textAlign: 'center',
  },
  secretHeroOverlay: {
    borderWidth: 1.5,
    borderRadius: 26,
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 28,
    paddingVertical: 28,
    shadowOpacity: 0.66,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
    overflow: 'hidden',
  },
  secretHeroFrame: {
    position: 'absolute',
    top: 12,
    right: 12,
    bottom: 12,
    left: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  secretHeroFrameInner: {
    position: 'absolute',
    top: 24,
    right: 24,
    bottom: 24,
    left: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  secretHeroName: {
    fontSize: 34,
    lineHeight: 36,
    textAlign: 'center',
  },
  secretHeroNumber: {
    fontSize: 98,
    lineHeight: 100,
  },
  secretHeroHint: {
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  remoteSignal: {
    marginTop: 2,
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: ORDERING_GRID_ROW_GAP,
    columnGap: ORDERING_GRID_COLUMN_GAP,
    paddingBottom: 4,
  },
  orderingCard: {
    width: '48.8%',
    padding: 0,
    minHeight: 88,
    position: 'relative',
  },
  orderingDragGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.6,
    borderRadius: 12,
    shadowOpacity: 0.64,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    zIndex: 9,
  },
  flipShell: {
    minHeight: 62,
  },
  flipFace: {
    borderWidth: 1.4,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backfaceVisibility: 'hidden',
  },
  flipBackFace: {
    ...StyleSheet.absoluteFillObject,
  },
  cornerBadgeWrap: {
    position: 'absolute',
    right: 8,
    top: 6,
    alignItems: 'center',
    zIndex: 6,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  orderBadge: {
    position: 'relative',
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    zIndex: 4,
  },
  orderBadgeText: {
    fontSize: 12,
    lineHeight: 13,
  },
  avatarText: {
    fontSize: 18,
  },
  cardMeta: {
    flex: 1,
    gap: 4,
    paddingRight: 30,
  },
  playerName: {
    fontSize: 15,
  },
  playerHint: {
    fontSize: 11,
    lineHeight: 15,
  },
  revealedNumber: {
    fontSize: 22,
    lineHeight: 24,
  },
  rulesText: {
    fontSize: 14,
  },
});
