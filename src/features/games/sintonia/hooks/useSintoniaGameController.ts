import { useCallback, useMemo, useRef, useState } from 'react';

import { createPlayersMap } from '@/src/features/games/sintonia/logic';
import { useSintoniaGameScreen } from '@/src/features/games/sintonia/hooks/useSintoniaGameScreen';
import { useSintoniaOrdering } from '@/src/features/games/sintonia/hooks/useSintoniaOrdering';
import { useSintoniaRevealFlow } from '@/src/features/games/sintonia/hooks/useSintoniaRevealFlow';
import { useSintoniaRoundLifecycle } from '@/src/features/games/sintonia/hooks/useSintoniaRoundLifecycle';
import { useSintoniaSecretPhase } from '@/src/features/games/sintonia/hooks/useSintoniaSecretPhase';
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

  const playersById = useMemo(() => (round ? createPlayersMap(round.players) : {}), [round]);

  const orderedPlayers = useMemo(
    () => orderedPlayerIds.map((playerId) => playersById[playerId]).filter(Boolean),
    [orderedPlayerIds, playersById]
  );

  const isCompactViewport = viewportWidth < 390;
  const orderingGridColumns = viewportWidth >= 900 ? 4 : viewportWidth >= 520 ? 3 : 2;

  const secretPhase = useSintoniaSecretPhase({
    round,
    phase,
    orderedPlayers,
    activeSecretPlayerId,
    setActiveSecretPlayerId,
    isRemoteRealtime,
    localDeviceId,
    roomCode,
    setPhase,
    setRoundError,
  });

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
    setDevicesReadyById: secretPhase.setDevicesReadyById,
    setActiveSecretPlayerId,
    setRoundError,
  });

  const { handleOrderingCardMeasure, onDropPlayer } = useSintoniaOrdering({
    phase,
    orderingGridColumns,
    isRemoteRealtime,
    roomCode,
    localDeviceId,
    orderSyncTimerRef,
    setOrderedPlayerIds,
  });

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
            label: secretPhase.isSecretWaitingOthers
              ? t('sintonia.secretWaitingOthers')
              : secretPhase.hasMoreLocalSecretPlayers
                ? t('sintonia.secretNextPlayer')
                : t('sintonia.secretReadyAction'),
            onPress: secretPhase.advanceSecretCard,
            disabled:
              secretPhase.isLocalDeviceReady ||
              (Boolean(secretPhase.currentSecretPlayer) && !secretPhase.isCurrentSecretViewed),
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
      orderedPlayerIds.length,
      phase,
      revealOrder,
      revealedCount,
      startNewRound,
      t,
      secretPhase,
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
    isSecretWaitingOthers: secretPhase.isSecretWaitingOthers,
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
    currentSecretPlayer: secretPhase.currentSecretPlayer,
    activeSecretPlayerId,
    isCurrentSecretRevealed: secretPhase.isCurrentSecretRevealed,
    isCurrentSecretViewed: secretPhase.isCurrentSecretViewed,
    isSecretWaitingOthers: secretPhase.isSecretWaitingOthers,
    isLocalDeviceReady: secretPhase.isLocalDeviceReady,
    hasMoreLocalSecretPlayers: secretPhase.hasMoreLocalSecretPlayers,
    secretReadyDevicesCount: secretPhase.secretReadyDevicesCount,
    secretTotalDevicesCount: secretPhase.secretTotalDevicesCount,
    isCompactViewport,
    orderingGridColumns,
    primaryAction,
    handleSecretPlayerPressIn: secretPhase.handleSecretPlayerPressIn,
    handleSecretPlayerPressOut: secretPhase.handleSecretPlayerPressOut,
    advanceSecretCard: secretPhase.advanceSecretCard,
    handleOrderingCardMeasure,
    onDropPlayer,
    startNewRound,
    ...ui,
  };
}


