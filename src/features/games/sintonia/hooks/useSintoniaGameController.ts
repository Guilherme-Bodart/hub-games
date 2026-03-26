import * as Haptics from 'expo-haptics';
import { useCallback, useMemo, useRef, useState } from 'react';

import { createPlayersMap } from '@/src/features/games/sintonia/logic';
import { useSintoniaGameScreen } from '@/src/features/games/sintonia/hooks/useSintoniaGameScreen';
import { useSintoniaOrdering } from '@/src/features/games/sintonia/hooks/useSintoniaOrdering';
import { useSintoniaRevealFlow } from '@/src/features/games/sintonia/hooks/useSintoniaRevealFlow';
import { useSintoniaRoundLifecycle } from '@/src/features/games/sintonia/hooks/useSintoniaRoundLifecycle';
import { setRemoteSintoniaPhase } from '@/src/features/games/sintonia/realtime';
import {
  SintoniaPhase,
  SintoniaRevealFeedback,
  SintoniaRound,
  SintoniaRoundResult,
} from '@/src/features/games/sintonia/types';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { useLobbySessionStore } from '@/src/features/lobby';
import { resolveLobbyActionAuthorityMode } from '@/src/features/lobby/gameSettings';
import { Locale } from '@/src/i18n/types';
import { triggerGameFeedback } from '@/src/ui/feedback';

type TranslateFn = (key: any, params?: Record<string, number | string>) => string;

type UseSintoniaGameControllerParams = Pick<
  GameRuntimeScreenProps,
  'lobby' | 'setShellPhase'
> & {
  locale: Locale;
  viewportWidth: number;
  t: TranslateFn;
};

export function useSintoniaGameController({
  lobby,
  setShellPhase,
  locale,
  viewportWidth,
  t,
}: UseSintoniaGameControllerParams) {
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

  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const orderSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const hasBootstrappedRemoteRoundRef = useRef(false);
  const latestLobbyRef = useRef(lobby);

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

  const { startNewRound } = useSintoniaRoundLifecycle({
    lobby,
    locale,
    isRemoteRealtime,
    canControlCriticalActions,
    roomCode,
    localDeviceId,
    clearTimers,
    latestLobbyRef,
    isMountedRef,
    hasBootstrappedRemoteRoundRef,
    setRound,
    setPhase,
    setRoundResult,
    setOrderedPlayerIds,
    setRevealedById,
    setRevealedCount,
    setActiveSecretPlayerId,
    setRoundError,
  });

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

  const { handleOrderingCardMeasure, onDropPlayer } = useSintoniaOrdering({
    phase,
    orderingGridColumns,
    isRemoteRealtime,
    roomCode,
    localDeviceId,
    orderSyncTimerRef,
    setOrderedPlayerIds,
    setRoundError,
  });

  const handleSecretPlayerPressIn = useCallback((player: { id: string; isLocalDevice: boolean }) => {
    if (!player.isLocalDevice) {
      return;
    }

    setActiveSecretPlayerId(player.id);
    void Haptics.selectionAsync();
  }, []);

  const handleSecretPlayerPressOut = useCallback((playerId: string) => {
    setActiveSecretPlayerId((currentPlayerId) => (currentPlayerId === playerId ? null : currentPlayerId));
  }, []);

  const { revealOrder } = useSintoniaRevealFlow({
    round,
    phase,
    orderedPlayerIds,
    isRemoteRealtime,
    canControlCriticalActions,
    roomCode,
    localDeviceId,
    timersRef,
    isMountedRef,
    clearTimers,
    setPhase,
    setRoundResult,
    setRevealedById,
    setRevealedCount,
    setActiveSecretPlayerId,
    setRoundError,
  });

  const primaryAction = useMemo(
    () =>
      phase === 'secrets'
        ? {
            label: t('sintonia.goToOrdering'),
            onPress: () => {
              triggerGameFeedback('confirm');
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
                triggerGameFeedback('submit');
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
                  triggerGameFeedback('confirm');
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

  const ui = useSintoniaGameScreen({
    phase,
    roundResult,
    isRemoteRealtime,
    canControlCriticalActions,
    realtimeStatus,
    round,
    roundError,
    locale,
    viewportWidth,
    setShellPhase,
    t,
  });

  return {
    round,
    phase,
    roundError,
    roundResult,
    isRemoteRealtime,
    realtimeError: isRemoteRealtime ? realtimeError : null,
    canControlCriticalActions,
    orderedPlayers,
    revealedById,
    revealedCount,
    activeSecretPlayer,
    activeSecretPlayerId,
    isCompactViewport,
    secretGridColumns,
    orderingGridColumns,
    primaryAction,
    handleSecretPlayerPressIn,
    handleSecretPlayerPressOut,
    handleOrderingCardMeasure,
    onDropPlayer,
    startNewRound,
    ...ui,
  };
}


