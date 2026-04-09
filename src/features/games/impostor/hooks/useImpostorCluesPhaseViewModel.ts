import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { ImpostorRound } from '@/src/features/games/impostor/types';

export type PlayerClueCardTone = 'submitted' | 'typing' | 'waiting';

export type PlayerClueCardViewModel = {
  player: ImpostorRound['players'][number];
  clue?: string;
  previousClues: string[];
  playerLabel: string;
  statusLabel: string;
  emphasisLabel: string;
  historyLabel: string;
  historyEmptyLabel: string;
  tone: PlayerClueCardTone;
  width: '100%' | '48.5%';
};

type ProgressStepViewModel = {
  id: string;
  label: string;
  avatarId: number;
  state: PlayerClueCardTone;
  isCurrent: boolean;
  size: 'focus' | 'side';
};

type ProgressWidth = `${number}%`;

type UseImpostorCluesPhaseViewModelParams = {
  round: ImpostorRound;
  isPt: boolean;
  activeTurnId: string | null;
  activeTurnName: string;
  clueSubmittedCount: number;
  clueProgress: number;
  isClueCycleComplete: boolean;
  canSubmitClue: boolean;
  typingLabel: string;
};

export function useImpostorCluesPhaseViewModel({
  round,
  isPt,
  activeTurnId,
  activeTurnName,
  clueSubmittedCount,
  clueProgress,
  isClueCycleComplete,
  canSubmitClue,
  typingLabel,
}: UseImpostorCluesPhaseViewModelParams) {
  const { width } = useWindowDimensions();
  const usesTwoColumns = width >= 760;

  return useMemo(() => {
    const safeProgress = Math.max(0, Math.min(1, clueProgress));

    const headerTitle = isClueCycleComplete
      ? isPt
        ? 'Hora da decisão'
        : 'Decision time'
      : activeTurnName
        ? activeTurnName
        : isPt
          ? 'Aguardando o próximo jogador'
          : 'Waiting for the next player';

    const headerHint = isClueCycleComplete
      ? isPt
        ? 'Escolham o próximo passo.'
        : 'Choose the next step.'
      : isPt
        ? 'Curta e sutil.'
        : 'Short and subtle.';

    const cards: PlayerClueCardViewModel[] = round.players.map((player) => {
      const clue = round.clues[player.id];
      const isActive = activeTurnId === player.id;
      const hasSubmitted = round.submittedCluePlayerIds.includes(player.id);
      const clueHistory = round.clueHistoryByPlayer[player.id] ?? [];
      const previousClues = clue ? clueHistory.slice(0, -1) : clueHistory;
      const tone: PlayerClueCardTone = hasSubmitted ? 'submitted' : isActive ? 'typing' : 'waiting';

      return {
        player,
        clue,
        previousClues,
        playerLabel: isPt ? 'Jogador' : 'Player',
        statusLabel: hasSubmitted
          ? isPt
            ? 'Enviada'
            : 'Clue sent'
          : isActive
            ? isPt
              ? 'digitando...'
              : 'Typing now'
            : isPt
              ? 'aguardando...'
              : 'Waiting...',
        emphasisLabel: clue
          ? clue
          : hasSubmitted
            ? isPt
              ? 'tempo esgotado'
              : 'time up'
            : isActive
              ? typingLabel
              : '',
        historyLabel: isPt ? 'Histórico' : 'History',
        historyEmptyLabel: isPt ? 'Sem pistas anteriores.' : 'No previous clues yet.',
        tone,
        width: usesTwoColumns ? '48.5%' : '100%',
      };
    });

    const orderedCards = round.players
      .map((player) => cards.find((card) => card.player.id === player.id))
      .filter((card): card is PlayerClueCardViewModel => Boolean(card));

    const focusIndex = Math.min(round.activeTurnIndex, Math.max(round.players.length - 1, 0));
    const visibleCount = Math.min(5, round.players.length);
    const maxVisibleStart = Math.max(0, round.players.length - visibleCount);
    const visibleStart = Math.min(Math.max(0, focusIndex - 2), maxVisibleStart);
    const visibleEnd = visibleStart + visibleCount;
    const visiblePlayers = round.players.slice(visibleStart, visibleEnd);

    const progressSteps: ProgressStepViewModel[] = visiblePlayers.map((player, index) => {
      const absoluteIndex = visibleStart + index;
      const hasSubmitted = round.submittedCluePlayerIds.includes(player.id);
      const state: PlayerClueCardTone = hasSubmitted
        ? 'submitted'
        : absoluteIndex === round.activeTurnIndex
          ? 'typing'
          : 'waiting';

      return {
        id: player.id,
        label: player.name,
        avatarId: player.avatarId,
        state,
        isCurrent: absoluteIndex === focusIndex && !isClueCycleComplete,
        size: absoluteIndex === focusIndex ? 'focus' : 'side',
      };
    });

    return {
      headerEyebrow: '',
      headerTitle,
      headerHint,
      progressLabel: '',
      progressWidth: `${Math.round(safeProgress * 100)}%` as ProgressWidth,
      inputLabel: isPt ? 'Sua pista' : 'Your clue',
      composerHelperText: isClueCycleComplete
        ? ''
        : canSubmitClue
          ? ''
          : isPt
            ? activeTurnName
              ? `Vez de ${activeTurnName}.`
              : 'Aguardando a vez atual.'
            : activeTurnName
              ? `${activeTurnName}'s turn.`
              : 'Waiting for the current turn.',
      rosterEyebrow: isPt ? 'Mesa da rodada' : 'Round table',
      rosterTitle: isPt ? 'Quem já jogou e quem falta' : 'Who already played and who is next',
      cards: orderedCards,
      progressSteps,
    };
  }, [
    activeTurnId,
    activeTurnName,
    canSubmitClue,
    clueProgress,
    clueSubmittedCount,
    isClueCycleComplete,
    isPt,
    round.activeTurnIndex,
    round.clueHistoryByPlayer,
    round.clues,
    round.players,
    round.submittedCluePlayerIds,
    typingLabel,
    usesTwoColumns,
  ]);
}
