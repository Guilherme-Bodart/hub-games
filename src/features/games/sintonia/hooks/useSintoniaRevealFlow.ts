import * as Haptics from 'expo-haptics';
import { Dispatch, MutableRefObject, SetStateAction, useCallback } from 'react';

import { createHiddenRevealMap, createPlayersMap, evaluateRevealStep } from '@/src/features/games/sintonia/logic';
import {
  applyRemoteSintoniaRevealStep,
  finishRemoteSintoniaRound,
  startRemoteSintoniaReveal,
} from '@/src/features/games/sintonia/realtime';
import {
  SintoniaPhase,
  SintoniaRevealFeedback,
  SintoniaRound,
  SintoniaRoundResult,
} from '@/src/features/games/sintonia/types';

const REVEAL_INTERVAL_MS = 200;

const waitWithTrackedTimer = (
  timersRef: MutableRefObject<Array<ReturnType<typeof setTimeout>>>,
  durationMs: number
): Promise<void> =>
  new Promise((resolve) => {
    const timeoutId = setTimeout(resolve, durationMs);
    timersRef.current.push(timeoutId);
  });

type UseSintoniaRevealFlowParams = {
  round: SintoniaRound | null;
  phase: SintoniaPhase;
  orderedPlayerIds: string[];
  isRemoteRealtime: boolean;
  canControlCriticalActions: boolean;
  roomCode: string;
  localDeviceId: string;
  timersRef: MutableRefObject<Array<ReturnType<typeof setTimeout>>>;
  isMountedRef: MutableRefObject<boolean>;
  clearTimers: () => void;
  setPhase: Dispatch<SetStateAction<SintoniaPhase>>;
  setRoundResult: Dispatch<SetStateAction<SintoniaRoundResult>>;
  setRevealedById: Dispatch<SetStateAction<Record<string, SintoniaRevealFeedback>>>;
  setRevealedCount: Dispatch<SetStateAction<number>>;
  setActiveSecretPlayerId: Dispatch<SetStateAction<string | null>>;
  setRoundError: Dispatch<SetStateAction<boolean>>;
};

export function useSintoniaRevealFlow({
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
}: UseSintoniaRevealFlowParams) {
  const revealOrder = useCallback(async () => {
    if (!round || phase !== 'ordering') {
      return;
    }

    try {
      const playersById = createPlayersMap(round.players);
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
              remainingUpdates[remainingPlayer.id] =
                remainingEvaluation.isCorrect ? 'correct' : 'incorrect';
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
    } catch {
      if (!isRemoteRealtime) {
        setRoundError(true);
      }
    }
  }, [
    canControlCriticalActions,
    clearTimers,
    isMountedRef,
    isRemoteRealtime,
    localDeviceId,
    orderedPlayerIds,
    phase,
    roomCode,
    round,
    setActiveSecretPlayerId,
    setPhase,
    setRevealedById,
    setRevealedCount,
    setRoundError,
    setRoundResult,
    timersRef,
  ]);

  return {
    revealOrder,
  };
}



