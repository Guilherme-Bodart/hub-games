import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from 'react';

import {
  subscribeRemoteImpostorState,
} from '@/src/features/games/impostor/realtime';
import { ImpostorRound } from '@/src/features/games/impostor/types';
import { triggerGameFeedback } from '@/src/ui/feedback';

const REVEAL_HOLD_DELAY_MS = 220;

type UseImpostorRoundEffectsParams = {
  isRemote: boolean;
  roomCode: string;
  localDeviceId: string;
  waitingCopy: string;
  initializeRound: () => Promise<void>;
  setRound: Dispatch<SetStateAction<ImpostorRound | null>>;
  setError: Dispatch<SetStateAction<string | null>>;
  round: ImpostorRound | null;
  heldRevealId: string | null;
  setHeldRevealId: Dispatch<SetStateAction<string | null>>;
  setTypingDotsCount: Dispatch<SetStateAction<number>>;
  setVisibleVotingCount: Dispatch<SetStateAction<number>>;
  setActiveVotingPlayerId: Dispatch<SetStateAction<string | null>>;
  setIsVoteSelectionUnlocked: Dispatch<SetStateAction<boolean>>;
  localVotingPlayers: ImpostorRound['players'];
  activeVotingPlayerId: string | null;
  setVotingDraftsByPlayer: Dispatch<SetStateAction<Record<string, string[]>>>;
  setResultStage: Dispatch<SetStateAction<number>>;
  setResultRouletteTick: Dispatch<SetStateAction<number>>;
  resultStage: number;
  votingResultBlockAt: number;
  resultActionsAt: number;
};

export function useImpostorRoundEffects({
  isRemote,
  roomCode,
  localDeviceId,
  waitingCopy,
  initializeRound,
  setRound,
  setError,
  round,
  heldRevealId,
  setHeldRevealId,
  setTypingDotsCount,
  setVisibleVotingCount,
  setActiveVotingPlayerId,
  setIsVoteSelectionUnlocked,
  localVotingPlayers,
  activeVotingPlayerId,
  setVotingDraftsByPlayer,
  setResultStage,
  setResultRouletteTick,
  resultStage,
  votingResultBlockAt,
  resultActionsAt,
}: UseImpostorRoundEffectsParams) {
  const previousPhaseRef = useRef<ImpostorRound['phase'] | null>(null);
  const previousRevealedIdRef = useRef<string | null>(null);
  const previousResultStageRef = useRef<number>(0);
  const revealHoldTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isRemote) {
      void initializeRound();
      return;
    }

    const unsub = subscribeRemoteImpostorState({
      roomCode,
      onState: (stateRound) => setRound(stateRound),
      onError: (message) => setError(message || waitingCopy),
    });

    return unsub;
  }, [initializeRound, isRemote, roomCode, setError, setRound, waitingCopy]);

  useEffect(() => {
    if (!round || !heldRevealId) {
      return;
    }

    const stillVisible = round.players.some(
      (player) => player.id === heldRevealId && player.deviceId === localDeviceId
    );

    if (!stillVisible) {
      setHeldRevealId(null);
    }
  }, [heldRevealId, localDeviceId, round, setHeldRevealId]);

  useEffect(() => {
    if (!round || round.phase !== 'clues') {
      setTypingDotsCount(1);
      return;
    }

    const interval = setInterval(() => {
      setTypingDotsCount((current) => (current >= 4 ? 1 : current + 1));
    }, 260);

    return () => clearInterval(interval);
  }, [round?.phase, setTypingDotsCount]);

  useEffect(() => {
    if (!round || round.phase !== 'voting') {
      setVisibleVotingCount(0);
      return;
    }

    setVisibleVotingCount(round.players.length);
  }, [round?.id, round?.phase, round?.players.length, setVisibleVotingCount]);

  useEffect(() => {
    if (!round || round.phase !== 'voting') {
      setActiveVotingPlayerId(null);
      setIsVoteSelectionUnlocked(false);
      return;
    }

    const pendingLocalVoter = localVotingPlayers.find(
      (player) => !round.votingSubmittedPlayerIds.includes(player.id)
    );

    if (!pendingLocalVoter) {
      setActiveVotingPlayerId(null);
      setIsVoteSelectionUnlocked(false);
      return;
    }

    if (!activeVotingPlayerId || round.votingSubmittedPlayerIds.includes(activeVotingPlayerId)) {
      setActiveVotingPlayerId(pendingLocalVoter.id);
      setIsVoteSelectionUnlocked(false);
    }
  }, [activeVotingPlayerId, localVotingPlayers, round, setActiveVotingPlayerId, setIsVoteSelectionUnlocked]);

  useEffect(() => {
    if (!round || round.phase !== 'voting') {
      setVotingDraftsByPlayer({});
      return;
    }

    if (!activeVotingPlayerId) {
      return;
    }

    if (round.votingSubmittedPlayerIds.includes(activeVotingPlayerId)) {
      return;
    }

    setVotingDraftsByPlayer((currentDrafts) => {
      if (currentDrafts[activeVotingPlayerId]) {
        return currentDrafts;
      }

      const baseSelection = round.votingSelectionsByPlayer[activeVotingPlayerId] ?? [];
      return {
        ...currentDrafts,
        [activeVotingPlayerId]: baseSelection,
      };
    });
  }, [activeVotingPlayerId, round, setVotingDraftsByPlayer]);

  useEffect(() => {
    if (!round || round.phase !== 'result') {
      setResultStage(0);
      setResultRouletteTick(0);
      return;
    }

    setResultStage(0);
    setResultRouletteTick(0);

    const rouletteInterval = setInterval(() => {
      setResultRouletteTick((current) => current + 1);
    }, 120);

    const maxStage = round.mode === 'questions' ? 5 : 4;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    for (let stage = 1; stage <= maxStage; stage += 1) {
      const timeout = setTimeout(() => {
        setResultStage((currentStage) => Math.max(currentStage, stage));

        if (stage === 1) {
          clearInterval(rouletteInterval);
        }
      }, stage * 1000);
      timeouts.push(timeout);
    }

    return () => {
      clearInterval(rouletteInterval);
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [round?.id, round?.mode, round?.phase, setResultRouletteTick, setResultStage]);

  useEffect(() => {
    if (!round) {
      previousPhaseRef.current = null;
      return;
    }

    if (previousPhaseRef.current === round.phase) {
      return;
    }

    previousPhaseRef.current = round.phase;

    if (round.phase === 'voting') {
      triggerGameFeedback('vote');
      return;
    }

    if (round.phase === 'result') {
      triggerGameFeedback('result');
      return;
    }

    if (round.phase === 'roundDecision') {
      triggerGameFeedback('warning');
    }
  }, [round]);

  useEffect(() => {
    if (!heldRevealId) {
      previousRevealedIdRef.current = null;
      return;
    }

    if (previousRevealedIdRef.current === heldRevealId) {
      return;
    }

    previousRevealedIdRef.current = heldRevealId;
    triggerGameFeedback('reveal');
  }, [heldRevealId]);

  useEffect(() => {
    if (!round || round.phase !== 'result') {
      previousResultStageRef.current = 0;
      return;
    }

    if (resultStage === previousResultStageRef.current) {
      return;
    }

    previousResultStageRef.current = resultStage;

    if (resultStage === 1) {
      triggerGameFeedback('warning');
      return;
    }

    if (resultStage === 2) {
      triggerGameFeedback('reveal');
      return;
    }

    if (resultStage >= votingResultBlockAt && resultStage < resultActionsAt) {
      triggerGameFeedback('vote');
      return;
    }

    if (resultStage >= resultActionsAt) {
      triggerGameFeedback('result');
    }
  }, [resultActionsAt, resultStage, round, votingResultBlockAt]);

  const startRevealHold = useCallback(
    (playerId: string) => {
      if (revealHoldTimeoutRef.current) {
        clearTimeout(revealHoldTimeoutRef.current);
        revealHoldTimeoutRef.current = null;
      }

      revealHoldTimeoutRef.current = setTimeout(() => {
        setHeldRevealId(playerId);
      }, REVEAL_HOLD_DELAY_MS);
    },
    [setHeldRevealId]
  );

  const stopRevealHold = useCallback(
    (playerId: string) => {
      if (revealHoldTimeoutRef.current) {
        clearTimeout(revealHoldTimeoutRef.current);
        revealHoldTimeoutRef.current = null;
      }

      setHeldRevealId((currentId) => (currentId === playerId ? null : currentId));
    },
    [setHeldRevealId]
  );

  useEffect(() => {
    return () => {
      if (revealHoldTimeoutRef.current) {
        clearTimeout(revealHoldTimeoutRef.current);
      }
    };
  }, []);

  return {
    startRevealHold,
    stopRevealHold,
  };
}
