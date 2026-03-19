import { HybridLobbyState } from '@/src/features/lobby';
import {
  resolveImpostorContentMode,
  resolveImpostorCount,
  resolveImpostorRoundTargetPlayers,
} from '@/src/features/lobby/gameSettings';
import { Locale } from '@/src/i18n';

import { pickImpostorPromptEntry } from '@/src/features/games/impostor/content';
import {
  ImpostorRound,
  ImpostorRoundDecision,
  ImpostorRoundPlayer,
} from '@/src/features/games/impostor/types';

type CreateImpostorRoundParams = {
  lobby: HybridLobbyState;
  locale: Locale;
  previousTurnOrder?: string[];
  random?: () => number;
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const normalizeToken = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const toOneWordToken = (value: string): string | null => {
  const trimmed = normalizeToken(value);

  if (!trimmed || trimmed.includes(' ') || trimmed.length > 20) {
    return null;
  }

  return trimmed;
};

const shuffle = <T>(list: T[], random: () => number): T[] => {
  const copy = [...list];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
};

const hasSameOrder = (left: string[], right: string[]): boolean =>
  left.length === right.length && left.every((item, index) => item === right[index]);

const rotatePlayersForNextCycle = (
  players: ImpostorRoundPlayer[],
  clueCycle: number
): ImpostorRoundPlayer[] => {
  if (players.length <= 1) {
    return players;
  }

  const normalizedShift = clueCycle % players.length;
  const shift = normalizedShift === 0 ? 1 : normalizedShift;

  return [...players.slice(shift), ...players.slice(0, shift)];
};

const collectEligiblePlayers = (lobby: HybridLobbyState): ImpostorRoundPlayer[] => {
  const sourceDevices =
    lobby.mode === 'local'
      ? lobby.devices.filter((device) => device.isLocalDevice)
      : lobby.devices.filter((device) => device.isConnected);

  return sourceDevices
    .flatMap((device) =>
      device.players
        .filter((player) => player.isReady)
        .map((player) => ({
          id: player.id,
          name: player.name,
          avatarId: player.avatarId,
          isHost: player.isHost,
          isLocalDevice: device.isLocalDevice,
          deviceId: device.id,
          isImpostor: false,
        }))
    )
    .sort((left, right) => {
      if (left.isHost !== right.isHost) {
        return left.isHost ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    });
};

const applyImpostors = (
  players: ImpostorRoundPlayer[],
  impostorCount: number,
  random: () => number
): ImpostorRoundPlayer[] => {
  const shuffledIds = shuffle(
    players.map((player) => player.id),
    random
  ).slice(0, impostorCount);
  const impostorIdSet = new Set(shuffledIds);

  return players.map((player) => ({
    ...player,
    isImpostor: impostorIdSet.has(player.id),
  }));
};

const resolveRoundDecision = (
  votes: Record<string, ImpostorRoundDecision>
): 'continue-clues' | 'vote-suspect' => {
  const voteValues = Object.values(votes);
  const continueVotes = voteValues.filter((vote) => vote === 'continue-clues').length;
  const suspectVotes = voteValues.length - continueVotes;

  // Tie-breaker favors another clue cycle to avoid forcing early suspect voting.
  return continueVotes >= suspectVotes ? 'continue-clues' : 'vote-suspect';
};

const countVotesBySuspect = (
  players: ImpostorRoundPlayer[],
  votesByPlayer: Record<string, string[]>
): Record<string, number> => {
  const tallies = players.reduce<Record<string, number>>((accumulator, player) => {
    accumulator[player.id] = 0;
    return accumulator;
  }, {});

  Object.values(votesByPlayer).forEach((suspectIds) => {
    suspectIds.forEach((suspectId) => {
      if (typeof tallies[suspectId] === 'number') {
        tallies[suspectId] += 1;
      }
    });
  });

  return tallies;
};

const resolveMostVotedSuspects = (round: ImpostorRound, tallies: Record<string, number>): string[] =>
  round.players
    .map((player, index) => ({
      id: player.id,
      voteCount: tallies[player.id] || 0,
      orderIndex: index,
    }))
    .sort((left, right) => {
      if (right.voteCount !== left.voteCount) {
        return right.voteCount - left.voteCount;
      }

      return left.orderIndex - right.orderIndex;
    })
    .slice(0, round.impostorCount)
    .map((entry) => entry.id);

export const createImpostorRound = ({
  lobby,
  locale,
  previousTurnOrder,
  random = Math.random,
}: CreateImpostorRoundParams): ImpostorRound => {
  const eligiblePlayers = collectEligiblePlayers(lobby);
  const configuredMaxPlayers = clamp(resolveImpostorRoundTargetPlayers(lobby.gameSettings), 4, 12);
  const impostorCount = eligiblePlayers.length >= 7 ? resolveImpostorCount(lobby.gameSettings) : 1;
  const mode = resolveImpostorContentMode(lobby.gameSettings);

  if (eligiblePlayers.length < 4) {
    throw new Error('Not enough ready players for Impostor round.');
  }

  if (eligiblePlayers.length > configuredMaxPlayers) {
    throw new Error('Lobby player count exceeds configured max.');
  }

  let selectedPlayers = shuffle(eligiblePlayers, random);

  if (
    previousTurnOrder &&
    previousTurnOrder.length === selectedPlayers.length &&
    hasSameOrder(
      selectedPlayers.map((player) => player.id),
      previousTurnOrder
    )
  ) {
    selectedPlayers = [...selectedPlayers.slice(1), selectedPlayers[0]];
  }

  const players = applyImpostors(selectedPlayers, impostorCount, random);
  const prompt = pickImpostorPromptEntry(mode, locale, random);
  const turnOrder = players.map((player) => player.id);

  return {
    id: `impostor-${Date.now()}`,
    mode,
    theme: prompt.theme,
    civilPrompt: prompt.civilPrompt,
    impostorPrompt: prompt.impostorPrompt,
    players,
    impostorCount,
    phase: 'reveal',
    activeTurnIndex: 0,
    clues: {},
    clueHistoryByPlayer: {},
    usedClueTokens: [],
    clueCycle: 1,
    decisionVotes: {},
    votingSelectionsByPlayer: {},
    votingSubmittedPlayerIds: [],
    votingTallies: {},
    selectedSuspectIds: [],
    caughtImpostorIds: [],
    impostorGuesses: {},
    result: null,
  };
};

export const getRoundPlayersById = (round: ImpostorRound): Record<string, ImpostorRoundPlayer> =>
  round.players.reduce<Record<string, ImpostorRoundPlayer>>((accumulator, player) => {
    accumulator[player.id] = player;
    return accumulator;
  }, {});

export const getTurnOrder = (round: ImpostorRound): string[] => round.players.map((player) => player.id);

export const getActiveTurnPlayer = (round: ImpostorRound): ImpostorRoundPlayer | null => {
  const turnOrder = getTurnOrder(round);
  const activePlayerId = turnOrder[round.activeTurnIndex];
  return round.players.find((player) => player.id === activePlayerId) ?? null;
};

export const submitRoundClue = (
  round: ImpostorRound,
  playerId: string,
  clue: string
): { round: ImpostorRound; error?: string } => {
  if (round.phase !== 'clues') {
    return { round, error: 'Round is not in clue phase.' };
  }

  const activePlayer = getActiveTurnPlayer(round);

  if (!activePlayer || activePlayer.id !== playerId) {
    return { round, error: 'This is not your turn.' };
  }

  const clueToken = toOneWordToken(clue);

  if (!clueToken) {
    return { round, error: 'Use one short word only.' };
  }

  if (round.usedClueTokens.includes(clueToken)) {
    return { round, error: 'This clue was already used in this round.' };
  }

  if (round.clues[playerId]) {
    return { round, error: 'This player already submitted a clue in this cycle.' };
  }

  const nextActiveTurnIndex = round.activeTurnIndex + 1;
  const turnOrder = getTurnOrder(round);
  const isLastTurn = nextActiveTurnIndex >= turnOrder.length;

  return {
    round: {
      ...round,
      clues: {
        ...round.clues,
        [playerId]: clue.trim(),
      },
      clueHistoryByPlayer: {
        ...round.clueHistoryByPlayer,
        [playerId]: [...(round.clueHistoryByPlayer[playerId] ?? []), clue.trim()],
      },
      usedClueTokens: [...round.usedClueTokens, clueToken],
      activeTurnIndex: isLastTurn ? turnOrder.length : nextActiveTurnIndex,
      phase: 'clues',
    },
  };
};

export const proceedToRoundDecision = (
  round: ImpostorRound
): { round: ImpostorRound; error?: string } => {
  if (round.phase !== 'clues') {
    return { round, error: 'Round is not in clue phase.' };
  }

  const submittedCount = Object.keys(round.clues).length;
  if (submittedCount < round.players.length) {
    return { round, error: 'Wait for all clues before continuing.' };
  }

  return {
    round: {
      ...round,
      phase: 'roundDecision',
      decisionVotes: {},
    },
  };
};

export const submitRoundDecisionVote = (
  round: ImpostorRound,
  playerId: string,
  vote: ImpostorRoundDecision
): { round: ImpostorRound; error?: string } => {
  if (round.phase !== 'roundDecision') {
    return { round, error: 'Round is not in decision phase.' };
  }

  const playerExists = round.players.some((player) => player.id === playerId);

  if (!playerExists) {
    return { round, error: 'Player not found in this round.' };
  }

  const nextDecisionVotes = {
    ...round.decisionVotes,
    [playerId]: vote,
  };
  const allPlayersVoted = round.players.every((player) => nextDecisionVotes[player.id]);

  if (!allPlayersVoted) {
    return {
      round: {
        ...round,
        decisionVotes: nextDecisionVotes,
      },
    };
  }

  const decision = resolveRoundDecision(nextDecisionVotes);

  if (decision === 'continue-clues') {
    const nextClueCycle = round.clueCycle + 1;

    return {
      round: {
        ...round,
        players: rotatePlayersForNextCycle(round.players, nextClueCycle),
        phase: 'clues',
        activeTurnIndex: 0,
        clues: {},
        usedClueTokens: [],
        clueCycle: nextClueCycle,
        decisionVotes: {},
      },
    };
  }

  return {
    round: {
      ...round,
      phase: 'voting',
      votingSelectionsByPlayer: {},
      votingSubmittedPlayerIds: [],
      votingTallies: {},
      selectedSuspectIds: [],
      decisionVotes: {},
    },
  };
};

export const toggleVotingSelectionForPlayer = (
  round: ImpostorRound,
  voterId: string,
  suspectId: string
): { round: ImpostorRound; error?: string } => {
  if (round.phase !== 'voting') {
    return { round, error: 'Round is not in voting phase.' };
  }

  if (!round.players.some((player) => player.id === voterId)) {
    return { round, error: 'Voter not found in this round.' };
  }

  if (!round.players.some((player) => player.id === suspectId)) {
    return { round, error: 'Suspect not found in this round.' };
  }

  if (round.votingSubmittedPlayerIds.includes(voterId)) {
    return { round, error: 'This vote is already locked.' };
  }

  const currentSelection = round.votingSelectionsByPlayer[voterId] ?? [];
  const selected = currentSelection.includes(suspectId);
  const nextSelected = selected
    ? currentSelection.filter((id) => id !== suspectId)
    : [...currentSelection, suspectId].slice(-round.impostorCount);

  return {
    round: {
      ...round,
      votingSelectionsByPlayer: {
        ...round.votingSelectionsByPlayer,
        [voterId]: nextSelected,
      },
    },
  };
};

export const submitPlayerVoting = (
  round: ImpostorRound,
  voterId: string
): { round: ImpostorRound; error?: string } => {
  if (round.phase !== 'voting') {
    return { round, error: 'Round is not in voting phase.' };
  }

  if (!round.players.some((player) => player.id === voterId)) {
    return { round, error: 'Voter not found in this round.' };
  }

  if (round.votingSubmittedPlayerIds.includes(voterId)) {
    return { round, error: 'This vote is already locked.' };
  }

  const voterSelection = round.votingSelectionsByPlayer[voterId] ?? [];
  if (voterSelection.length !== round.impostorCount) {
    return { round, error: 'Select all suspects before confirming this vote.' };
  }

  const nextSubmittedIds = [...round.votingSubmittedPlayerIds, voterId];
  const allPlayersVoted = round.players.every((player) => nextSubmittedIds.includes(player.id));

  if (!allPlayersVoted) {
    return {
      round: {
        ...round,
        votingSubmittedPlayerIds: nextSubmittedIds,
      },
    };
  }

  const tallies = countVotesBySuspect(round.players, round.votingSelectionsByPlayer);
  const selectedSuspectIds = resolveMostVotedSuspects(round, tallies);
  const impostorIds = round.players.filter((player) => player.isImpostor).map((player) => player.id);
  const selectedSet = new Set(selectedSuspectIds);
  const allCaught =
    selectedSet.size === impostorIds.length && impostorIds.every((impostorId) => selectedSet.has(impostorId));

  if (!allCaught) {
    return {
      round: {
        ...round,
        votingSubmittedPlayerIds: nextSubmittedIds,
        selectedSuspectIds,
        votingTallies: tallies,
        phase: 'result',
        result: {
          winner: 'impostors',
          reason: 'Vocês não conseguiram descobrir o impostor.',
        },
      },
    };
  }

  return {
    round: {
      ...round,
      votingSubmittedPlayerIds: nextSubmittedIds,
      selectedSuspectIds,
      votingTallies: tallies,
      phase: 'guessing',
      caughtImpostorIds: selectedSuspectIds,
      impostorGuesses: {},
    },
  };
};

export const submitImpostorGuess = (
  round: ImpostorRound,
  playerId: string,
  guess: string
): { round: ImpostorRound; error?: string } => {
  if (round.phase !== 'guessing') {
    return { round, error: 'Round is not in guess phase.' };
  }

  if (!round.caughtImpostorIds.includes(playerId)) {
    return { round, error: 'Only caught impostors can guess.' };
  }

  const trimmedGuess = guess.trim();

  if (!trimmedGuess) {
    return { round, error: 'Enter a guess before confirming.' };
  }

  const nextGuesses = {
    ...round.impostorGuesses,
    [playerId]: trimmedGuess,
  };

  const allGuessed = round.caughtImpostorIds.every((impostorId) => nextGuesses[impostorId]?.trim());

  if (!allGuessed) {
    return {
      round: {
        ...round,
        impostorGuesses: nextGuesses,
      },
    };
  }

  const civilToken = normalizeToken(round.civilPrompt);
  const guessedCorrectly = round.caughtImpostorIds.some(
    (impostorId) => normalizeToken(nextGuesses[impostorId]) === civilToken
  );

  return {
    round: {
      ...round,
      impostorGuesses: nextGuesses,
      phase: 'result',
      result: guessedCorrectly
        ? {
            winner: 'impostors',
            reason: 'Pelo menos um impostor acertou a palavra dos civis.',
          }
        : {
            winner: 'civilians',
            reason: 'Nenhum impostor acertou a palavra dos civis.',
          },
    },
  };
};
