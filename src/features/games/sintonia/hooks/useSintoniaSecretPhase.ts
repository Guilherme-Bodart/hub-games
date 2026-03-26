import * as Haptics from 'expo-haptics';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SintoniaPhase, SintoniaPlayer, SintoniaRound } from '@/src/features/games/sintonia/types';
import {
  setRemoteSintoniaDeviceReady,
  setRemoteSintoniaPhase,
} from '@/src/features/games/sintonia/realtime';
import { triggerGameFeedback } from '@/src/ui/feedback';

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

    if (!isRemoteRealtime) {
      setDevicesReadyById((current) => ({
        ...current,
        [localDeviceId]: true,
      }));
      setPhase('ordering');
      return;
    }

    try {
      await setRemoteSintoniaDeviceReady(roomCode, localDeviceId, true, localDeviceId);
    } catch {
      setRoundError(true);
    }
  }, [isRemoteRealtime, localDeviceId, roomCode, round, setPhase, setRoundError]);

  const handleSecretPlayerPressIn = useCallback(() => {
    if (!currentSecretPlayer || isLocalDeviceReady) {
      return;
    }

    setActiveSecretPlayerId(currentSecretPlayer.id);
    void Haptics.selectionAsync();
  }, [currentSecretPlayer, isLocalDeviceReady, setActiveSecretPlayerId]);

  const handleSecretPlayerPressOut = useCallback(() => {
    if (!currentSecretPlayer) {
      return;
    }

    setActiveSecretPlayerId((currentPlayerId) =>
      currentPlayerId === currentSecretPlayer.id ? null : currentPlayerId
    );
    setViewedSecretByPlayerId((current) => ({
      ...current,
      [currentSecretPlayer.id]: true,
    }));
  }, [currentSecretPlayer, setActiveSecretPlayerId]);

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

    setLocalSecretIndex(0);
    setViewedSecretByPlayerId({});
    setActiveSecretPlayerId(null);
    didRequestOrderingRef.current = false;
  }, [round?.id, setActiveSecretPlayerId]);

  useEffect(() => {
    if (phase !== 'secrets') {
      didRequestOrderingRef.current = false;
    }
  }, [phase]);

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

  return {
    currentSecretPlayer,
    isCurrentSecretRevealed,
    isCurrentSecretViewed,
    isSecretWaitingOthers,
    isLocalDeviceReady,
    hasMoreLocalSecretPlayers,
    secretReadyDevicesCount,
    secretTotalDevicesCount,
    setDevicesReadyById,
    handleSecretPlayerPressIn,
    handleSecretPlayerPressOut,
    advanceSecretCard,
  };
}
