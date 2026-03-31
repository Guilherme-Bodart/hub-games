import { useCallback, useEffect, useRef, useState } from 'react';
import { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { createImpostorRound } from '@/src/features/games/impostor/logic';
import {
  initializeRemoteImpostorRound,
  updateRemoteImpostorRound,
} from '@/src/features/games/impostor/realtime';
import { useImpostorDerivedState } from '@/src/features/games/impostor/hooks/useImpostorDerivedState';
import { useImpostorGameActions } from '@/src/features/games/impostor/hooks/useImpostorGameActions';
import { useImpostorRoundEffects } from '@/src/features/games/impostor/hooks/useImpostorRoundEffects';
import { useImpostorGameScreen } from '@/src/features/games/impostor/hooks/useImpostorGameScreen';
import { ImpostorRound } from '@/src/features/games/impostor/types';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import {
  resolveImpostorClueTurnSeconds,
  resolveLobbyActionAuthorityMode,
} from '@/src/features/lobby/gameSettings';
import { Locale } from '@/src/i18n/types';

type UseImpostorGameControllerParams = Pick<
  GameRuntimeScreenProps,
  'lobby' | 'onExitLobby' | 'setShellPhase'
> & {
  locale: Locale;
  viewportWidth: number;
};

export function useImpostorGameController({
  lobby,
  onExitLobby,
  setShellPhase,
  locale,
  viewportWidth,
}: UseImpostorGameControllerParams) {
  const isRemote = lobby.mode === 'remote';
  const roomCode = lobby.roomCode;
  const localDeviceId = lobby.selectedDeviceId;
  const controlMode = resolveLobbyActionAuthorityMode(lobby.gameSettings);

  const [round, setRound] = useState<ImpostorRound | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [heldRevealId, setHeldRevealId] = useState<string | null>(null);
  const [activeVotingPlayerId, setActiveVotingPlayerId] = useState<string | null>(null);
  const [typingDotsCount, setTypingDotsCount] = useState(1);
  const [visibleVotingCount, setVisibleVotingCount] = useState(0);
  const [resultStage, setResultStage] = useState(0);
  const [resultRouletteTick, setResultRouletteTick] = useState(0);
  const [clueInput, setClueInput] = useState('');
  const [votingDraftsByPlayer, setVotingDraftsByPlayer] = useState<Record<string, string[]>>({});
  const [isVoteSelectionUnlocked, setIsVoteSelectionUnlocked] = useState(false);
  const [guessDrafts, setGuessDrafts] = useState<Record<string, string>>({});
  const [clueTurnRemainingSeconds, setClueTurnRemainingSeconds] = useState(20);

  const { isPt, copy, phaseLabel, topBarStatusTone } = useImpostorGameScreen({
    locale,
    round,
    error,
    setShellPhase,
  });

  const latestLobbyRef = useRef(lobby);
  const latestRoundRef = useRef<ImpostorRound | null>(null);
  const latestClueInputRef = useRef('');
  const pendingClueTurnKeyRef = useRef<string | null>(null);
  const impostorPromptPulse = useSharedValue(0.5);
  const resultFlicker = useSharedValue(0.8);
  const revealFogOpacity = useSharedValue(0);
  const revealPromptOpacity = useSharedValue(0);

  useEffect(() => {
    latestLobbyRef.current = lobby;
  }, [lobby]);

  useEffect(() => {
    latestRoundRef.current = round;
  }, [round]);

  useEffect(() => {
    latestClueInputRef.current = clueInput;
  }, [clueInput]);

  const clueTurnSeconds = round?.clueTurnSeconds ?? resolveImpostorClueTurnSeconds(lobby.gameSettings);

  const currentClueTurnKey =
    round?.phase === 'clues' ? `${round.id}:${round.clueCycle}:${round.activeTurnIndex}` : null;

  useEffect(() => {
    if (pendingClueTurnKeyRef.current && pendingClueTurnKeyRef.current !== currentClueTurnKey) {
      pendingClueTurnKeyRef.current = null;
    }
  }, [currentClueTurnKey]);

  useEffect(() => {
    impostorPromptPulse.value = withRepeat(withTiming(1, { duration: 920 }), -1, true);
    resultFlicker.value = withRepeat(withTiming(1, { duration: 760 }), -1, true);
  }, [impostorPromptPulse, resultFlicker]);

  const initializeRound = useCallback(async () => {
    try {
      setError(null);
      setHeldRevealId(null);
      setActiveVotingPlayerId(null);
      setClueInput('');
      setVotingDraftsByPlayer({});
      setGuessDrafts({});

      const previousTurnOrder = latestRoundRef.current?.players.map((player) => player.id);
      const nextRound = createImpostorRound({
        lobby: latestLobbyRef.current,
        locale,
        previousTurnOrder,
      });

      if (isRemote) {
        await initializeRemoteImpostorRound(roomCode, nextRound, localDeviceId);
      } else {
        setRound(nextRound);
      }
    } catch (err) {
      setRound(null);
      setError(err instanceof Error ? err.message : copy.noPlayers);
    }
  }, [copy.noPlayers, isRemote, locale, localDeviceId, roomCode]);

  const saveRound = useCallback(
    async (nextRound: ImpostorRound) => {
      setError(null);

      if (isRemote) {
        await updateRemoteImpostorRound(roomCode, nextRound, localDeviceId);
      } else {
        setRound(nextRound);
      }
    },
    [isRemote, localDeviceId, roomCode]
  );

  const derived = useImpostorDerivedState({
    lobby,
    localDeviceId,
    controlMode,
    round,
    heldRevealId,
    activeVotingPlayerId,
    votingDraftsByPlayer,
    isVoteSelectionUnlocked,
    typingDotsCount,
    visibleVotingCount,
    viewportWidth,
    isPt,
    resultRouletteTick,
    resultStage,
  });

  const { startRevealHold, stopRevealHold } = useImpostorRoundEffects({
    isRemote,
    roomCode,
    localDeviceId,
    waitingCopy: copy.waiting,
    initializeRound,
    setRound,
    setError,
    round,
    heldRevealId,
    setHeldRevealId,
    revealFogOpacity,
    revealPromptOpacity,
    setTypingDotsCount,
    setVisibleVotingCount,
    setActiveVotingPlayerId,
    setIsVoteSelectionUnlocked,
    localVotingPlayers: derived.localVotingPlayers,
    activeVotingPlayerId,
    setVotingDraftsByPlayer,
    setResultStage,
    setResultRouletteTick,
    resultStage,
    votingResultBlockAt: derived.votingResultBlockAt,
    resultActionsAt: derived.resultActionsAt,
  });

  const actions = useImpostorGameActions({
    round,
    setError,
    saveRound,
    guessDrafts,
    setGuessDrafts,
    setResultStage,
    resultActionsAt: derived.resultActionsAt,
    clueInput,
    setClueInput,
    onClueSubmitStarted: () => {
      pendingClueTurnKeyRef.current = currentClueTurnKey;
    },
    localPlayerIds: derived.localPlayerIds,
    isRemote,
    canControl: derived.canControl,
    roomCode,
    onExitLobby,
    activeVotingPlayerId,
    votingRevealDone: derived.votingRevealDone,
    isVoteSelectionLocked: derived.isVoteSelectionLocked,
    setVotingDraftsByPlayer,
    setIsVoteSelectionUnlocked,
    activeVotingSelection: derived.activeVotingSelection,
  });

  const impostorPromptPulseStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + impostorPromptPulse.value * 0.28,
  }));

  const resultFlickerStyle = useAnimatedStyle(() => ({
    opacity: 0.78 + resultFlicker.value * 0.22,
  }));

  const revealFogStyle = useAnimatedStyle(() => ({
    opacity: revealFogOpacity.value,
  }));

  const revealPromptStyle = useAnimatedStyle(() => ({
    opacity: revealPromptOpacity.value,
  }));

  useEffect(() => {
    if (round?.phase !== 'clues') {
      setClueTurnRemainingSeconds(clueTurnSeconds);
      return;
    }

    const tick = () => {
      const deadline = round.activeTurnStartedAt + clueTurnSeconds * 1000;
      const remainingMs = Math.max(0, deadline - Date.now());
      setClueTurnRemainingSeconds(Math.max(0, Math.ceil(remainingMs / 1000)));
    };

    tick();
    const intervalId = setInterval(tick, 250);
    return () => clearInterval(intervalId);
  }, [clueTurnSeconds, round?.activeTurnStartedAt, round?.phase]);

  useEffect(() => {
    if (
      !round ||
      round.phase !== 'clues' ||
      !actions.canSubmitClue ||
      actions.isClueCycleComplete ||
      pendingClueTurnKeyRef.current === currentClueTurnKey
    ) {
      return;
    }

    const deadline = round.activeTurnStartedAt + clueTurnSeconds * 1000;
    const remainingMs = deadline - Date.now();
    const timeoutMs = Math.max(0, remainingMs);
    const timeoutId = setTimeout(() => {
      actions.handleAutoSubmitClue(latestClueInputRef.current);
    }, timeoutMs);

    return () => clearTimeout(timeoutId);
  }, [
    actions.canSubmitClue,
    actions.handleAutoSubmitClue,
    actions.isClueCycleComplete,
    clueTurnSeconds,
    currentClueTurnKey,
    round,
  ]);

  return {
    round,
    error,
    isPt,
    copy,
    phaseLabel,
    topBarStatusTone,
    canControl: derived.canControl,
    isRemote,
    initializeRound,
    handleExitLobby: actions.handleExitLobby,
    revealedPrompt: derived.revealedPrompt,
    revealedPlayer: derived.revealedPlayer,
    revealedIsImpostor: derived.revealedIsImpostor,
    heldRevealId,
    localRevealPlayers: derived.localRevealPlayers,
    playerCardWidth: derived.playerCardWidth,
    revealFogStyle,
    revealPromptStyle,
    impostorPromptPulseStyle,
    startRevealHold,
    stopRevealHold,
    handleGoClues: actions.handleGoClues,
    activeTurn: actions.activeTurn,
    isClueCycleComplete: actions.isClueCycleComplete,
    canSubmitClue: actions.canSubmitClue,
    clueInput,
    setClueInput,
    clueProgress: derived.clueProgress,
    clueSubmittedCount: derived.clueSubmittedCount,
    clueTurnSeconds,
    clueTurnRemainingSeconds,
    typingLabel: derived.typingLabel,
    handleProceedToDecision: actions.handleProceedToDecision,
    handleSubmitClue: actions.handleSubmitClue,
    localVotingPlayers: derived.localVotingPlayers,
    activeVotingPlayerId,
    localVotesSubmittedCount: derived.localVotesSubmittedCount,
    visibleVotingCount,
    activeVotingSelection: derived.activeVotingSelection,
    isVoteSelectionLocked: derived.isVoteSelectionLocked,
    votingRevealDone: derived.votingRevealDone,
    voteCellWidth: derived.voteCellWidth,
    allLocalVotingSubmitted: derived.allLocalVotingSubmitted,
    handleToggleVotingSuspect: actions.handleToggleVotingSuspect,
    handleUnlockVoteSelection: actions.handleUnlockVoteSelection,
    handleConfirmVoting: actions.handleConfirmVoting,
    isConfirmVoteDisabled: actions.isConfirmVoteDisabled,
    localPlayerIds: derived.localPlayerIds,
    handleRoundDecisionVote: actions.handleRoundDecisionVote,
    hasVotingTallies: derived.hasVotingTallies,
    votingTallies: derived.votingTallies,
    guessDrafts,
    onGuessDraftChange: actions.onGuessDraftChange,
    handleSubmitImpostorGuess: actions.handleSubmitImpostorGuess,
    resultStage,
    resultActionsAt: derived.resultActionsAt,
    revealResultBlockAt: derived.revealResultBlockAt,
    votingResultBlockAt: derived.votingResultBlockAt,
    bannerWinnerIsImpostor: derived.bannerWinnerIsImpostor,
    resultShouldShowQuestionBlock: derived.resultShouldShowQuestionBlock,
    voteBreakdown: derived.voteBreakdown,
    impostorPlayers: derived.impostorPlayers,
    resultFlickerStyle,
    fastForwardResult: actions.fastForwardResult,
  };
}
