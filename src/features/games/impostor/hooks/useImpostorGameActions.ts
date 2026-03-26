import { Dispatch, SetStateAction, useCallback } from 'react';

import {
  getActiveTurnPlayer,
  proceedToRoundDecision,
  submitImpostorGuess,
  submitPlayerVoting,
  submitRoundClue,
  submitRoundDecisionVote,
} from '@/src/features/games/impostor/logic';
import { resetRemoteImpostorRound } from '@/src/features/games/impostor/realtime';
import { ImpostorRound } from '@/src/features/games/impostor/types';
import { triggerGameFeedback } from '@/src/ui/feedback';

type UseImpostorGameActionsParams = {
  round: ImpostorRound | null;
  setError: Dispatch<SetStateAction<string | null>>;
  saveRound: (nextRound: ImpostorRound) => Promise<void>;
  guessDrafts: Record<string, string>;
  setGuessDrafts: Dispatch<SetStateAction<Record<string, string>>>;
  setResultStage: Dispatch<SetStateAction<number>>;
  resultActionsAt: number;
  clueInput: string;
  setClueInput: Dispatch<SetStateAction<string>>;
  localPlayerIds: Set<string>;
  isRemote: boolean;
  canControl: boolean;
  roomCode: string;
  onExitLobby: () => void;
  activeVotingPlayerId: string | null;
  votingRevealDone: boolean;
  isVoteSelectionLocked: boolean;
  setVotingDraftsByPlayer: Dispatch<SetStateAction<Record<string, string[]>>>;
  setIsVoteSelectionUnlocked: Dispatch<SetStateAction<boolean>>;
  activeVotingSelection: string[];
};

export function useImpostorGameActions({
  round,
  setError,
  saveRound,
  guessDrafts,
  setGuessDrafts,
  setResultStage,
  resultActionsAt,
  clueInput,
  setClueInput,
  localPlayerIds,
  isRemote,
  canControl,
  roomCode,
  onExitLobby,
  activeVotingPlayerId,
  votingRevealDone,
  isVoteSelectionLocked,
  setVotingDraftsByPlayer,
  setIsVoteSelectionUnlocked,
  activeVotingSelection,
}: UseImpostorGameActionsParams) {
  const activeTurn = round ? getActiveTurnPlayer(round) : null;
  const isClueCycleComplete = Boolean(round && Object.keys(round.clues).length >= round.players.length);
  const canSubmitClue = Boolean(activeTurn && localPlayerIds.has(activeTurn.id) && !isClueCycleComplete);

  const handleExitLobby = useCallback(async () => {
    if (isRemote && canControl) {
      try {
        await resetRemoteImpostorRound(roomCode);
      } catch {
        // Ignore cleanup failures and still return to lobby.
      }
    }

    onExitLobby();
  }, [canControl, isRemote, onExitLobby, roomCode]);

  const handleRoundDecisionVote = useCallback(
    (playerId: string, vote: 'vote-suspect' | 'continue-clues') => {
      if (!round) {
        return;
      }

      const response = submitRoundDecisionVote(round, playerId, vote);
      if (response.error) {
        setError(response.error);
        return;
      }

      triggerGameFeedback('confirm');
      void saveRound(response.round);
    },
    [round, saveRound, setError]
  );

  const handleSubmitImpostorGuess = useCallback(
    (impostorId: string) => {
      if (!round) {
        return;
      }

      const response = submitImpostorGuess(round, impostorId, guessDrafts[impostorId] || '');
      if (response.error) {
        setError(response.error);
        return;
      }

      triggerGameFeedback('submit');
      void saveRound(response.round);
    },
    [guessDrafts, round, saveRound, setError]
  );

  const fastForwardResult = useCallback(() => {
    setResultStage(resultActionsAt);
    triggerGameFeedback('confirm');
  }, [resultActionsAt, setResultStage]);

  const handleGoClues = useCallback(() => {
    if (!round) {
      return;
    }

    triggerGameFeedback('submit');
    void saveRound({ ...round, phase: 'clues', activeTurnIndex: 0 });
  }, [round, saveRound]);

  const handleProceedToDecision = useCallback(() => {
    if (!round) {
      return;
    }

    const response = proceedToRoundDecision(round);
    if (response.error) {
      setError(response.error);
      return;
    }

    triggerGameFeedback('confirm');
    void saveRound(response.round);
  }, [round, saveRound, setError]);

  const handleSubmitClue = useCallback(() => {
    if (!round) {
      return;
    }

    const response = submitRoundClue(round, activeTurn?.id || '', clueInput);
    if (response.error) {
      setError(response.error);
      return;
    }

    setClueInput('');
    triggerGameFeedback('submit');
    void saveRound(response.round);
  }, [activeTurn?.id, clueInput, round, saveRound, setClueInput, setError]);

  const handleToggleVotingSuspect = useCallback(
    (playerId: string) => {
      if (!round || !activeVotingPlayerId || !votingRevealDone || isVoteSelectionLocked) {
        return;
      }

      setVotingDraftsByPlayer((currentDrafts) => {
        const currentSelection = currentDrafts[activeVotingPlayerId] ?? [];
        const alreadySelected = currentSelection.includes(playerId);
        const nextSelection = alreadySelected
          ? currentSelection.filter((item) => item !== playerId)
          : [...currentSelection, playerId].slice(-round.impostorCount);

        return {
          ...currentDrafts,
          [activeVotingPlayerId]: nextSelection,
        };
      });

      triggerGameFeedback('vote');
    },
    [activeVotingPlayerId, isVoteSelectionLocked, round, setVotingDraftsByPlayer, votingRevealDone]
  );

  const handleUnlockVoteSelection = useCallback(() => {
    triggerGameFeedback('confirm');
    setIsVoteSelectionUnlocked(true);
  }, [setIsVoteSelectionUnlocked]);

  const isConfirmVoteDisabled =
    !round ||
    !votingRevealDone ||
    !activeVotingPlayerId ||
    isVoteSelectionLocked ||
    activeVotingSelection.length !== round.impostorCount ||
    round.votingSubmittedPlayerIds.includes(activeVotingPlayerId);

  const handleConfirmVoting = useCallback(() => {
    if (!round || !activeVotingPlayerId) {
      return;
    }

    const response = submitPlayerVoting(
      {
        ...round,
        votingSelectionsByPlayer: {
          ...round.votingSelectionsByPlayer,
          [activeVotingPlayerId]: activeVotingSelection,
        },
      },
      activeVotingPlayerId
    );

    if (response.error) {
      setError(response.error);
      return;
    }

    setVotingDraftsByPlayer((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[activeVotingPlayerId];
      return nextDrafts;
    });

    setIsVoteSelectionUnlocked(false);
    triggerGameFeedback('submit');
    void saveRound(response.round);
  }, [activeVotingPlayerId, activeVotingSelection, round, saveRound, setError, setIsVoteSelectionUnlocked, setVotingDraftsByPlayer]);

  const onGuessDraftChange = useCallback(
    (impostorId: string, value: string) => {
      setGuessDrafts((curr) => ({ ...curr, [impostorId]: value }));
    },
    [setGuessDrafts]
  );

  return {
    activeTurn,
    isClueCycleComplete,
    canSubmitClue,
    handleExitLobby,
    handleRoundDecisionVote,
    handleSubmitImpostorGuess,
    fastForwardResult,
    handleGoClues,
    handleProceedToDecision,
    handleSubmitClue,
    handleToggleVotingSuspect,
    handleUnlockVoteSelection,
    isConfirmVoteDisabled,
    handleConfirmVoting,
    onGuessDraftChange,
  };
}
