import {
  createImpostorRound,
  proceedToRoundDecision,
  submitPlayerVoting,
  submitImpostorGuess,
  submitRoundDecisionVote,
  submitRoundClue,
  toggleVotingSelectionForPlayer,
} from '@/src/features/games/impostor/logic';
import { pickImpostorPromptEntry } from '@/src/features/games/impostor/content';
import { ImpostorRound } from '@/src/features/games/impostor/types';
import { HybridLobbyState } from '@/src/features/lobby';

const createSequenceRandom = (sequence: number[]): (() => number) => {
  let index = 0;

  return () => {
    const value = sequence[index % sequence.length];
    index += 1;
    return value;
  };
};

const buildLobby = (): HybridLobbyState => ({
  roomCode: 'ZX123',
  gameId: 'impostor-neon',
  mode: 'remote',
  gameSettings: {
    'sessionActionAuthorityMode': 'host-only',
    'impostorContentMode': 'words',
    'impostorTargetPlayers': 8,
    'impostorCount': 2,
  },
  selectedDeviceId: 'device-local',
  startAt: null,
  devices: [
    {
      id: 'device-local',
      label: 'Local',
      isLocalDevice: true,
      isConnected: true,
      players: [
        {
          id: 'p-1',
          name: 'Lia',
          avatarId: 1,
          isReady: true,
          isHost: true,
          deviceId: 'device-local',
        },
        {
          id: 'p-2',
          name: 'Jo',
          avatarId: 2,
          isReady: true,
          isHost: false,
          deviceId: 'device-local',
        },
        {
          id: 'p-3',
          name: 'Noa',
          avatarId: 3,
          isReady: true,
          isHost: false,
          deviceId: 'device-local',
        },
        {
          id: 'p-4',
          name: 'Mia',
          avatarId: 4,
          isReady: true,
          isHost: false,
          deviceId: 'device-local',
        },
      ],
    },
    {
      id: 'device-remote',
      label: 'Remote',
      isLocalDevice: false,
      isConnected: true,
      players: [
        {
          id: 'p-5',
          name: 'Ben',
          avatarId: 5,
          isReady: true,
          isHost: false,
          deviceId: 'device-remote',
        },
        {
          id: 'p-6',
          name: 'Kai',
          avatarId: 6,
          isReady: true,
          isHost: false,
          deviceId: 'device-remote',
        },
        {
          id: 'p-7',
          name: 'Zed',
          avatarId: 7,
          isReady: true,
          isHost: false,
          deviceId: 'device-remote',
        },
        {
          id: 'p-8',
          name: 'Ana',
          avatarId: 8,
          isReady: true,
          isHost: false,
          deviceId: 'device-remote',
        },
      ],
    },
  ],
});

describe('Impostor logic', () => {
  it('with 2 impostors, right suspects move to guess phase and one correct guess wins for impostors', () => {
    const round = createImpostorRound({
      lobby: buildLobby(),
      locale: 'pt',
      random: createSequenceRandom([0.2, 0.7, 0.4, 0.9, 0.6, 0.1]),
    });
    expect(round.impostorPrompt).not.toBe('IMPOSTOR');
    expect(round.impostorPrompt).not.toBe(round.civilPrompt);
    const impostorIds = round.players.filter((player) => player.isImpostor).map((player) => player.id);
    let votingRound: ImpostorRound = {
      ...round,
      phase: 'voting',
      votingSelectionsByPlayer: {},
      votingSubmittedPlayerIds: [],
      votingTallies: {},
      selectedSuspectIds: [],
    };

    round.players.forEach((voter) => {
      impostorIds.forEach((suspectId) => {
        const toggle = toggleVotingSelectionForPlayer(votingRound, voter.id, suspectId);
        votingRound = toggle.round;
      });

      const submitVote = submitPlayerVoting(votingRound, voter.id);
      votingRound = submitVote.round;
    });

    expect(votingRound.phase).toBe('guessing');

    const firstGuess = submitImpostorGuess(votingRound, impostorIds[0], 'errado');
    expect(firstGuess.round.phase).toBe('guessing');

    const secondGuess = submitImpostorGuess(firstGuess.round, impostorIds[1], votingRound.civilPrompt);

    expect(secondGuess.round.phase).toBe('result');
    expect(secondGuess.round.result?.winner).toBe('impostors');
  });

  it('with 2 impostors, one wrong suspect immediately gives impostor victory', () => {
    const round = createImpostorRound({
      lobby: buildLobby(),
      locale: 'pt',
      random: createSequenceRandom([0.2, 0.7, 0.4, 0.9, 0.6, 0.1]),
    });
    const oneImpostorId = round.players.find((player) => player.isImpostor)?.id;
    const oneCivilId = round.players.find((player) => !player.isImpostor)?.id;
    let votingRound: ImpostorRound = {
      ...round,
      phase: 'voting',
      votingSelectionsByPlayer: {},
      votingSubmittedPlayerIds: [],
      votingTallies: {},
      selectedSuspectIds: [],
    };

    if (!oneImpostorId || !oneCivilId) {
      throw new Error('Expected both impostor and civil players for this test.');
    }

    round.players.forEach((voter) => {
      const firstToggle = toggleVotingSelectionForPlayer(votingRound, voter.id, oneImpostorId);
      votingRound = firstToggle.round;
      const secondToggle = toggleVotingSelectionForPlayer(votingRound, voter.id, oneCivilId);
      votingRound = secondToggle.round;
      votingRound = submitPlayerVoting(votingRound, voter.id).round;
    });

    expect(votingRound.phase).toBe('result');
    expect(votingRound.result?.winner).toBe('impostors');
  });

  it('rejects repeated clue in the same round', () => {
    const round = createImpostorRound({
      lobby: buildLobby(),
      locale: 'pt',
      random: createSequenceRandom([0.1, 0.5, 0.3, 0.8, 0.2]),
    });
    const cluesRound = {
      ...round,
      phase: 'clues' as const,
      activeTurnIndex: 0,
    };
    const firstPlayerId = cluesRound.players[0].id;
    const secondPlayerId = cluesRound.players[1].id;

    const firstClue = submitRoundClue(cluesRound, firstPlayerId, 'neon');
    expect(firstClue.error).toBeUndefined();

    const secondClue = submitRoundClue(firstClue.round, secondPlayerId, 'Neon');
    expect(secondClue.error).toBeDefined();
  });

  it('gives impostors a broad hint instead of the exact civil word in words mode', () => {
    const entry = pickImpostorPromptEntry('words', 'pt', () => 0);

    expect(entry.civilPrompt).toBe('Hambúrguer');
    expect(entry.impostorPrompt).toBe('Comida');
    expect(entry.impostorPrompt).not.toBe(entry.civilPrompt);
  });

  it('keeps last clue visible and only moves to decision after explicit continue', () => {
    const round = createImpostorRound({
      lobby: buildLobby(),
      locale: 'pt',
      random: createSequenceRandom([0.3, 0.2, 0.6, 0.8]),
    });
    let cluesRound: ImpostorRound = {
      ...round,
      phase: 'clues',
      activeTurnIndex: 0,
    };

    round.players.forEach((player, index) => {
      const clueResult = submitRoundClue(cluesRound, player.id, `pista${index}`);
      cluesRound = clueResult.round;
    });

    expect(cluesRound.phase).toBe('clues');
    expect(Object.keys(cluesRound.clues)).toHaveLength(round.players.length);

    const proceedResult = proceedToRoundDecision(cluesRound);
    expect(proceedResult.error).toBeUndefined();
    let decisionRound = proceedResult.round;
    expect(decisionRound.phase).toBe('roundDecision');

    round.players.forEach((player) => {
      const voteResult = submitRoundDecisionVote(decisionRound, player.id, 'continue-clues');
      decisionRound = voteResult.round;
    });

    expect(decisionRound.phase).toBe('clues');
    expect(decisionRound.clueCycle).toBe(2);
    expect(Object.keys(decisionRound.clues)).toHaveLength(0);
    expect(decisionRound.players.map((player) => player.id)).not.toEqual(
      round.players.map((player) => player.id)
    );
    expect(
      decisionRound.players.every(
        (player) => (decisionRound.clueHistoryByPlayer[player.id] ?? []).length >= 1
      )
    ).toBe(true);
  });

  it('in round decision tie, defaults to continue clues', () => {
    const round = createImpostorRound({
      lobby: buildLobby(),
      locale: 'pt',
      random: createSequenceRandom([0.32, 0.14, 0.76, 0.48]),
    });
    const decisionRoundBase: ImpostorRound = {
      ...round,
      phase: 'roundDecision',
      decisionVotes: {},
    };
    const half = Math.floor(decisionRoundBase.players.length / 2);
    let decisionRound = decisionRoundBase;

    decisionRoundBase.players.forEach((player, index) => {
      const vote = index < half ? 'continue-clues' : 'vote-suspect';
      decisionRound = submitRoundDecisionVote(decisionRound, player.id, vote).round;
    });

    expect(decisionRound.phase).toBe('clues');
    expect(decisionRound.decisionVotes).toEqual({});
    expect(decisionRound.clueCycle).toBe(decisionRoundBase.clueCycle + 1);
  });

  it('avoids repeating exactly the same turn order between rounds when previous order is provided', () => {
    const random = createSequenceRandom([0.18, 0.41, 0.73, 0.27, 0.63, 0.9, 0.35]);
    const firstRound = createImpostorRound({
      lobby: buildLobby(),
      locale: 'pt',
      random,
    });
    const previousTurnOrder = firstRound.players.map((player) => player.id);
    const secondRound = createImpostorRound({
      lobby: buildLobby(),
      locale: 'pt',
      random: createSequenceRandom([0.18, 0.41, 0.73, 0.27, 0.63, 0.9, 0.35]),
      previousTurnOrder,
    });

    expect(secondRound.players.map((player) => player.id)).not.toEqual(previousTurnOrder);
  });
});
