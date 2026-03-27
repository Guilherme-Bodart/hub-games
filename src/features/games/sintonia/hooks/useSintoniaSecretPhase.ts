import * as Haptics from 'expo-haptics';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SintoniaPhase, SintoniaPlayer, SintoniaRound } from '@/src/features/games/sintonia/types';
import {
  setRemoteSintoniaDeviceReady,
  setRemoteSintoniaPhase,
} from '@/src/features/games/sintonia/realtime';
import { triggerGameFeedback } from '@/src/ui/feedback';

const HOLD_TO_REVEAL_MS = 1000;

type UseSintoniaSecretPhaseParams = {
  round: SintoniaRound | null;
  phase: SintoniaPhase;
  orderedPlayers: SintoniaPlayer[];
  activeSecretPlayerId: string | null;
  setActiveSecretPlayerId: Dispatch<SetStateAction<string | null>>;
  isRemoteRealtime: boolean;
  localDeviceId: string;
  roomCode: string;
  setPhase: Dispatch<SetStateAction<SintoniaPhase>>;
  setRoundError: Dispatch<SetStateAction<boolean>>;
};

export function useSintoniaSecretPhase({
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
}: UseSintoniaSecretPhaseParams) {
  const [localSecretIndex, setLocalSecretIndex] = useState(0);
  const [viewedSecretByPlayerId, setViewedSecretByPlayerId] = useState<Record<string, boolean>>({});
  const [devicesReadyById, setDevicesReadyById] = useState<Record<string, boolean>>({});
  const didRequestOrderingRef = useRef(false);
  const revealHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRevealHoldTimer = useCallback(() => {
    if (!revealHoldTimerRef.current) {
      return;
    }

    clearTimeout(revealHoldTimerRef.current);
    revealHoldTimerRef.current = null;
  }, []);

  const localSecretPlayers = useMemo(
    () => orderedPlayers.filter((player) => player.isLocalDevice),
    [orderedPlayers]
  );
  const currentSecretPlayer = localSecretPlayers[localSecretIndex] ?? null;
  const isCurrentSecretRevealed = Boolean(
    currentSecretPlayer && activeSecretPlayerId === currentSecretPlayer.id
  );
  const isCurrentSecretViewed = Boolean(
    currentSecretPlayer && viewedSecretByPlayerId[currentSecretPlayer.id]
  );
  const hasMoreLocalSecretPlayers = localSecretIndex < localSecretPlayers.length - 1;

  const roundDeviceIds = useMemo(
    () => Array.from(new Set(round?.players.map((player) => player.deviceId) ?? [])),
    [round]
  );
  const secretTotalPlayersCount = round?.players.length ?? 0;
  const secretReadyPlayersCount = useMemo(
    () => (round?.players.filter((player) => devicesReadyById[player.deviceId]).length ?? 0),
    [devicesReadyById, round]
  );
  const secretTotalDevicesCount = roundDeviceIds.length;
  const secretReadyDevicesCount = roundDeviceIds.filter((deviceId) => devicesReadyById[deviceId]).length;
  const isLocalDeviceReady = Boolean(devicesReadyById[localDeviceId]);
  const areAllDevicesReady =
    secretTotalDevicesCount > 0 && secretReadyDevicesCount >= secretTotalDevicesCount;
  const isSecretWaitingOthers = phase === 'secrets' && isLocalDeviceReady && !areAllDevicesReady;

  const markLocalDeviceReady = useCallback(async () => {
    if (!round) {
      return;
    }

    setDevicesReadyById((current) => ({
      ...current,
      [localDeviceId]: true,
    }));

    if (!isRemoteRealtime) {
      setPhase('ordering');
      return;
    }

    try {
      await setRemoteSintoniaDeviceReady(roomCode, localDeviceId, true, localDeviceId);
    } catch {
      setDevicesReadyById((current) => ({
        ...current,
        [localDeviceId]: false,
      }));
      setRoundError(true);
    }
  }, [isRemoteRealtime, localDeviceId, roomCode, round, setPhase, setRoundError]);

  const handleSecretPlayerPressIn = useCallback(() => {
    if (!currentSecretPlayer || isLocalDeviceReady || isCurrentSecretRevealed) {
      return;
    }

    clearRevealHoldTimer();

    const targetPlayerId = currentSecretPlayer.id;
    revealHoldTimerRef.current = setTimeout(() => {
      setActiveSecretPlayerId(targetPlayerId);
      setViewedSecretByPlayerId((current) => ({
        ...current,
        [targetPlayerId]: true,
      }));
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      revealHoldTimerRef.current = null;
    }, HOLD_TO_REVEAL_MS);

    void Haptics.selectionAsync();
  }, [
    clearRevealHoldTimer,
    currentSecretPlayer,
    isCurrentSecretRevealed,
    isLocalDeviceReady,
    setActiveSecretPlayerId,
  ]);

  const handleSecretPlayerPressOut = useCallback(() => {
    clearRevealHoldTimer();

    if (!currentSecretPlayer) {
      return;
    }

    setActiveSecretPlayerId((currentPlayerId) =>
      currentPlayerId === currentSecretPlayer.id ? null : currentPlayerId
    );
  }, [clearRevealHoldTimer, currentSecretPlayer, setActiveSecretPlayerId]);

  const advanceSecretCard = useCallback(() => {
    if (phase !== 'secrets' || isLocalDeviceReady) {
      return;
    }

    if (!currentSecretPlayer) {
      void markLocalDeviceReady();
      return;
    }

    if (!isCurrentSecretViewed) {
      return;
    }

    triggerGameFeedback('confirm');

    if (hasMoreLocalSecretPlayers) {
      setLocalSecretIndex((current) => current + 1);
      setActiveSecretPlayerId(null);
      return;
    }

    setActiveSecretPlayerId(null);
    void markLocalDeviceReady();
  }, [
    currentSecretPlayer,
    hasMoreLocalSecretPlayers,
    isCurrentSecretViewed,
    isLocalDeviceReady,
    markLocalDeviceReady,
    phase,
    setActiveSecretPlayerId,
  ]);

  useEffect(() => {
    if (!round) {
      return;
    }

    clearRevealHoldTimer();
    setLocalSecretIndex(0);
    setViewedSecretByPlayerId({});
    setActiveSecretPlayerId(null);
    didRequestOrderingRef.current = false;
  }, [clearRevealHoldTimer, round?.id, setActiveSecretPlayerId]);

  useEffect(() => {
    if (phase !== 'secrets') {
      clearRevealHoldTimer();
      didRequestOrderingRef.current = false;
    }
  }, [clearRevealHoldTimer, phase]);

  useEffect(() => {
    if (phase !== 'secrets' || !isRemoteRealtime || isLocalDeviceReady || localSecretPlayers.length > 0) {
      return;
    }

    void markLocalDeviceReady();
  }, [isLocalDeviceReady, isRemoteRealtime, localSecretPlayers.length, markLocalDeviceReady, phase]);

  useEffect(() => {
    if (phase !== 'secrets' || !areAllDevicesReady || didRequestOrderingRef.current) {
      return;
    }

    didRequestOrderingRef.current = true;
    setActiveSecretPlayerId(null);

    if (!isRemoteRealtime) {
      setPhase('ordering');
      return;
    }

    void setRemoteSintoniaPhase(roomCode, 'ordering', localDeviceId).catch(() => {
      didRequestOrderingRef.current = false;
      setRoundError(true);
    });
  }, [
    areAllDevicesReady,
    isRemoteRealtime,
    localDeviceId,
    phase,
    roomCode,
    setActiveSecretPlayerId,
    setPhase,
    setRoundError,
  ]);

  useEffect(() => () => clearRevealHoldTimer(), [clearRevealHoldTimer]);

  return {
    currentSecretPlayer,
    isCurrentSecretRevealed,
    isCurrentSecretViewed,
    isSecretWaitingOthers,
    isLocalDeviceReady,
    hasMoreLocalSecretPlayers,
    secretReadyPlayersCount,
    secretTotalPlayersCount,
    setDevicesReadyById,
    handleSecretPlayerPressIn,
    handleSecretPlayerPressOut,
    advanceSecretCard,
  };
}
