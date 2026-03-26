import { Dispatch, MutableRefObject, SetStateAction, useCallback, useEffect } from 'react';

import {
  createDevicesReadyMap,
  createHiddenRevealMap,
  createSintoniaRound,
} from '@/src/features/games/sintonia/logic';
import {
  initializeRemoteSintoniaRound,
  remoteSintoniaStateExists,
  subscribeRemoteSintoniaState,
} from '@/src/features/games/sintonia/realtime';
import {
  SintoniaPhase,
  SintoniaRevealFeedback,
  SintoniaRound,
  SintoniaRoundResult,
} from '@/src/features/games/sintonia/types';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { Locale } from '@/src/i18n/types';

type UseSintoniaRoundLifecycleParams = {
  lobby: GameRuntimeScreenProps['lobby'];
  locale: Locale;
  isRemoteRealtime: boolean;
  canControlCriticalActions: boolean;
  roomCode: string;
  localDeviceId: string;
  clearTimers: () => void;
  latestLobbyRef: MutableRefObject<GameRuntimeScreenProps['lobby']>;
  isMountedRef: MutableRefObject<boolean>;
  hasBootstrappedRemoteRoundRef: MutableRefObject<boolean>;
  setRound: Dispatch<SetStateAction<SintoniaRound | null>>;
  setPhase: Dispatch<SetStateAction<SintoniaPhase>>;
  setRoundResult: Dispatch<SetStateAction<SintoniaRoundResult>>;
  setOrderedPlayerIds: Dispatch<SetStateAction<string[]>>;
  setRevealedById: Dispatch<SetStateAction<Record<string, SintoniaRevealFeedback>>>;
  setRevealedCount: Dispatch<SetStateAction<number>>;
  setDevicesReadyById: Dispatch<SetStateAction<Record<string, boolean>>>;
  setActiveSecretPlayerId: Dispatch<SetStateAction<string | null>>;
  setRoundError: Dispatch<SetStateAction<boolean>>;
};

export function useSintoniaRoundLifecycle({
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
  setDevicesReadyById,
  setActiveSecretPlayerId,
  setRoundError,
}: UseSintoniaRoundLifecycleParams) {
  useEffect(() => {
    latestLobbyRef.current = lobby;
  }, [latestLobbyRef, lobby]);

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
      setDevicesReadyById(createDevicesReadyMap(nextRound.players));
      setActiveSecretPlayerId(null);
      setRoundError(false);
    } catch {
      setRound(null);
      setRoundError(true);
    }
  }, [
    clearTimers,
    lobby,
    locale,
    setActiveSecretPlayerId,
    setOrderedPlayerIds,
    setPhase,
    setRevealedById,
    setRevealedCount,
    setDevicesReadyById,
    setRound,
    setRoundError,
    setRoundResult,
  ]);

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
  }, [clearTimers, hasBootstrappedRemoteRoundRef, initializeRound, isMountedRef, isRemoteRealtime]);

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
    }
  }, [
    canControlCriticalActions,
    hasBootstrappedRemoteRoundRef,
    isRemoteRealtime,
    latestLobbyRef,
    locale,
    localDeviceId,
    roomCode,
    setRoundError,
  ]);

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
        setDevicesReadyById(remoteState.devicesReadyById);
        setRoundError(false);
      },
      onError: () => {
        // Keep remote flow alive; realtime errors are surfaced in UI without forcing fallback state.
      },
    });

    return () => {
      unsubscribe();
    };
  }, [
    initializeRemoteRoundIfNeeded,
    isRemoteRealtime,
    localDeviceId,
    roomCode,
    setOrderedPlayerIds,
    setPhase,
    setRevealedById,
    setRevealedCount,
    setDevicesReadyById,
    setRound,
    setRoundError,
    setRoundResult,
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
    } catch {}
  }, [
    canControlCriticalActions,
    initializeRound,
    isRemoteRealtime,
    latestLobbyRef,
    locale,
    localDeviceId,
    roomCode,
  ]);

  return {
    initializeRound,
    startNewRound,
  };
}



