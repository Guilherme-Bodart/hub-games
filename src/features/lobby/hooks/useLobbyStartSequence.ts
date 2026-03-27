import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { createImpostorRound } from '@/src/features/games/impostor/logic';
import {
  initializeRemoteImpostorRound,
  subscribeRemoteImpostorState,
} from '@/src/features/games/impostor/realtime';
import { createSintoniaRound } from '@/src/features/games/sintonia/logic';
import { initializeRemoteSintoniaRound } from '@/src/features/games/sintonia/realtime';
import type { HybridLobbyState } from '@/src/features/lobby/types';
import { START_COUNTDOWN_MS } from '@/src/features/lobby/lobby.constants';
import type { Locale } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n/types';
import { triggerGameFeedback } from '@/src/ui/feedback';

type TranslateFn = (key: TranslationKey, params?: Record<string, string | number>) => string;

type UseLobbyStartSequenceParams = {
  lobby: HybridLobbyState | null;
  locale: Locale;
  isLocalHost: boolean;
  isRemoteImpostorLobby: boolean;
  isRemoteSintoniaLobby: boolean;
  canStartGame: boolean;
  canHostStartThisLobby: boolean;
  scheduleRemoteStart: (startAt: number) => Promise<void>;
  clearRemoteStart: () => Promise<void>;
  t: TranslateFn;
};

export function useLobbyStartSequence({
  lobby,
  locale,
  isLocalHost,
  isRemoteImpostorLobby,
  isRemoteSintoniaLobby,
  canStartGame,
  canHostStartThisLobby,
  scheduleRemoteStart,
  clearRemoteStart,
  t,
}: UseLobbyStartSequenceParams) {
  const router = useRouter();
  const handledRemoteRoundIdRef = useRef<string | null>(null);
  const consumedStartAtRef = useRef<number | null>(null);
  const [countdownTargetAt, setCountdownTargetAt] = useState<number | null>(null);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  useEffect(() => {
    if (!lobby || !isRemoteImpostorLobby) {
      handledRemoteRoundIdRef.current = null;
      return;
    }

    const unsubscribe = subscribeRemoteImpostorState({
      roomCode: lobby.roomCode,
      onState: (round) => {
        if (!round || handledRemoteRoundIdRef.current === round.id) {
          return;
        }

        handledRemoteRoundIdRef.current = round.id;
        router.push({
          pathname: '/game/[gameId]',
          params: { gameId: lobby.gameId },
        });
      },
      onError: () => undefined,
    });

    return unsubscribe;
  }, [isRemoteImpostorLobby, lobby, router]);

  const startGameNow = useCallback(async () => {
    if (!lobby) {
      return;
    }

    if (isRemoteImpostorLobby && isLocalHost) {
      try {
        const initialRound = createImpostorRound({ lobby, locale });
        handledRemoteRoundIdRef.current = initialRound.id;
        await initializeRemoteImpostorRound(lobby.roomCode, initialRound, lobby.selectedDeviceId);
      } catch (error) {
        Alert.alert(
          'Impostor Neon',
          error instanceof Error && error.message ? error.message : t('lobby.startErrorImpostor')
        );
        return;
      }
    }

    if (isRemoteSintoniaLobby && isLocalHost) {
      try {
        const initialRound = createSintoniaRound({ lobby, locale });
        await initializeRemoteSintoniaRound(lobby.roomCode, initialRound, lobby.selectedDeviceId);
      } catch (error) {
        Alert.alert(
          'Sintonia',
          error instanceof Error && error.message ? error.message : t('lobby.startErrorSintonia')
        );
        return;
      }
    }

    triggerGameFeedback('result');
    router.push({
      pathname: '/game/[gameId]',
      params: { gameId: lobby.gameId },
    });
  }, [isLocalHost, isRemoteImpostorLobby, isRemoteSintoniaLobby, lobby, locale, router, t]);

  const beginStartSequence = useCallback(async () => {
    if (!lobby || !canStartGame || !canHostStartThisLobby) {
      return;
    }

    const targetAt = Date.now() + START_COUNTDOWN_MS;

    if (lobby.mode === 'remote') {
      try {
        await scheduleRemoteStart(targetAt);
      } catch (error) {
        Alert.alert(
          t('tabs.lobby'),
          error instanceof Error && error.message ? error.message : t('connection.error')
        );
      }
      return;
    }

    setCountdownTargetAt(targetAt);
    triggerGameFeedback('confirm');
  }, [canHostStartThisLobby, canStartGame, lobby, scheduleRemoteStart, t]);

  useEffect(() => {
    if (!lobby || lobby.mode !== 'remote') {
      consumedStartAtRef.current = null;
      return;
    }
    setCountdownTargetAt(lobby.startAt);
  }, [lobby?.mode, lobby?.startAt]);

  useEffect(() => {
    if (!countdownTargetAt || !lobby) {
      setCountdownValue(null);
      return;
    }

    const syncCountdown = () => {
      const remainingMs = countdownTargetAt - Date.now();
      const nextValue = Math.max(0, Math.ceil(remainingMs / 1000));
      setCountdownValue(nextValue);

      if (remainingMs > 0 || consumedStartAtRef.current === countdownTargetAt) {
        return;
      }

      consumedStartAtRef.current = countdownTargetAt;
      setCountdownTargetAt(null);

      void (async () => {
        await startGameNow();
        if (lobby.mode === 'remote' && isLocalHost) {
          setTimeout(() => {
            void clearRemoteStart().catch(() => undefined);
          }, 1600);
        }
      })();
    };

    syncCountdown();
    const interval = setInterval(syncCountdown, 120);
    return () => clearInterval(interval);
  }, [clearRemoteStart, countdownTargetAt, isLocalHost, lobby, startGameNow]);

  return {
    countdownValue,
    beginStartSequence,
  };
}
