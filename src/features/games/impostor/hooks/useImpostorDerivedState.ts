import { useMemo } from 'react';

import { ImpostorRound } from '@/src/features/games/impostor/types';
import { GameRuntimeScreenProps } from '@/src/features/games/types';

type UseImpostorDerivedStateParams = {
  lobby: GameRuntimeScreenProps['lobby'];
  localDeviceId: string;
  controlMode: string;
  round: ImpostorRound | null;
  heldRevealId: string | null;
  activeVotingPlayerId: string | null;
  votingDraftsByPlayer: Record<string, string[]>;
  isVoteSelectionUnlocked: boolean;
  typingDotsCount: number;
  visibleVotingCount: number;
  viewportWidth: number;
  isPt: boolean;
  resultRouletteTick: number;
  resultStage: number;
};

export function useImpostorDerivedState({
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
}: UseImpostorDerivedStateParams) {
  const isHostDevice = useMemo(() => {
    const device = lobby.devices.find((item) => item.id === localDeviceId);
    return device?.players.some((player) => player.isHost) ?? false;
  }, [lobby.devices, localDeviceId]);

  const canControl = controlMode === 'collaborative' || isHostDevice;

  const localPlayerIds = useMemo(
    () =>
      new Set(
        lobby.devices.find((item) => item.id === localDeviceId)?.players.map((player) => player.id) || []
      ),
    [lobby.devices, localDeviceId]
  );

  const localRevealPlayers = useMemo(
    () => round?.players.filter((player) => player.deviceId === localDeviceId) ?? [],
    [localDeviceId, round]
  );

  const localVotingPlayers = useMemo(
    () => round?.players.filter((player) => localPlayerIds.has(player.id)) ?? [],
    [localPlayerIds, round]
  );

  const revealedPrompt = useMemo(() => {
    if (!round || !heldRevealId) {
      return null;
    }

    const revealedPlayer = round.players.find((item) => item.id === heldRevealId);
    if (!revealedPlayer) {
      return null;
    }

    return revealedPlayer.isImpostor ? round.impostorPrompt : round.civilPrompt;
  }, [heldRevealId, round]);

  const revealedPlayer = useMemo(
    () => (heldRevealId ? round?.players.find((item) => item.id === heldRevealId) ?? null : null),
    [heldRevealId, round]
  );

  const revealedIsImpostor = Boolean(revealedPlayer?.isImpostor);
  const clueProgress = round ? round.submittedCluePlayerIds.length / Math.max(round.players.length, 1) : 0;
  const clueSubmittedCount = round ? round.submittedCluePlayerIds.length : 0;

  const activeVotingSelection =
    round && activeVotingPlayerId
      ? votingDraftsByPlayer[activeVotingPlayerId] ??
        round.votingSelectionsByPlayer[activeVotingPlayerId] ??
        []
      : [];

  const isVoteSelectionLocked = Boolean(activeVotingPlayerId && !isVoteSelectionUnlocked);

  const allLocalVotingSubmitted = Boolean(
    round && localVotingPlayers.every((player) => round.votingSubmittedPlayerIds.includes(player.id))
  );

  const localVotesSubmittedCount = round
    ? localVotingPlayers.filter((player) => round.votingSubmittedPlayerIds.includes(player.id)).length
    : 0;

  const hasVotingTallies = Boolean(round && Object.keys(round.votingTallies).length > 0);

  const votingTallies = useMemo(() => {
    if (!round) {
      return [];
    }

    return round.players
      .map((player) => ({
        playerId: player.id,
        name: player.name,
        votes: round.votingTallies[player.id] ?? 0,
      }))
      .sort((left, right) => right.votes - left.votes || left.name.localeCompare(right.name));
  }, [round]);

  const impostorPlayers = useMemo(
    () => (round ? round.players.filter((player) => player.isImpostor) : []),
    [round]
  );

  const voteBreakdown = useMemo(() => {
    if (!round) {
      return [];
    }

    const votersBySuspectId = round.players.reduce<Record<string, string[]>>((accumulator, player) => {
      accumulator[player.id] = [];
      return accumulator;
    }, {});

    Object.entries(round.votingSelectionsByPlayer).forEach(([voterId, suspectIds]) => {
      suspectIds.forEach((suspectId) => {
        if (votersBySuspectId[suspectId]) {
          votersBySuspectId[suspectId].push(voterId);
        }
      });
    });

    return round.players
      .map((player) => ({
        suspect: player,
        voteCount: round.votingTallies[player.id] ?? 0,
        voters: (votersBySuspectId[player.id] ?? [])
          .map((voterId) => round.players.find((playerItem) => playerItem.id === voterId))
          .filter(
            (
              voter
            ): voter is {
              id: string;
              name: string;
              avatarId: number;
              isHost: boolean;
              isLocalDevice: boolean;
              deviceId: string;
              isImpostor: boolean;
            } => Boolean(voter)
          ),
      }))
      .sort(
        (left, right) =>
          right.voteCount - left.voteCount || left.suspect.name.localeCompare(right.suspect.name)
      );
  }, [round]);

  const votingRevealDone = round?.phase === 'voting' ? round.players.length > 0 : true;

  const voteGridColumnsCompact = viewportWidth >= 900 ? 3 : 2;
  const voteCellWidth = voteGridColumnsCompact === 3 ? '31.8%' : '47%';

  const typingLabel = isPt ? `digitando${'.'.repeat(typingDotsCount)}` : `typing${'.'.repeat(typingDotsCount)}`;

  const resultShouldShowQuestionBlock = round?.mode === 'questions';
  const suspenseWinnerIsImpostor = resultRouletteTick % 2 === 0;

  const bannerWinnerIsImpostor =
    round?.phase === 'result' && resultStage < 1
      ? suspenseWinnerIsImpostor
      : round?.result?.winner === 'impostors';

  const revealResultBlockAt = resultShouldShowQuestionBlock ? 3 : -1;
  const votingResultBlockAt = resultShouldShowQuestionBlock ? 4 : 3;
  const resultActionsAt = resultShouldShowQuestionBlock ? 5 : 4;

  return {
    canControl,
    localPlayerIds,
    localRevealPlayers,
    localVotingPlayers,
    revealedPrompt,
    revealedPlayer,
    revealedIsImpostor,
    clueProgress,
    clueSubmittedCount,
    activeVotingSelection,
    isVoteSelectionLocked,
    allLocalVotingSubmitted,
    localVotesSubmittedCount,
    hasVotingTallies,
    votingTallies,
    impostorPlayers,
    voteBreakdown,
    votingRevealDone,
    voteCellWidth,
    typingLabel,
    resultShouldShowQuestionBlock,
    bannerWinnerIsImpostor,
    revealResultBlockAt,
    votingResultBlockAt,
    resultActionsAt,
  };
}


