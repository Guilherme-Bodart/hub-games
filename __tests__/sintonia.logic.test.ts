import {
  createPlayersMap,
  createSintoniaRound,
  drawUniqueNumbers,
  evaluateOrdering,
} from '@/src/features/games/sintonia/logic';
import { HybridLobbyState } from '@/src/features/lobby';
import { SintoniaPlayer } from '@/src/features/games/sintonia/types';

const createSequenceRandom = (sequence: number[]): (() => number) => {
  let index = 0;

  return () => {
    const value = sequence[index % sequence.length];
    index += 1;
    return value;
  };
};

const buildLobby = (mode: 'local' | 'remote'): HybridLobbyState => ({
  roomCode: 'AB12',
  gameId: 'sintonia',
  mode,
  gameSettings: {
    'sessionActionAuthorityMode': 'host-only',
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
          avatarId: 0,
          isReady: true,
          isHost: true,
          deviceId: 'device-local',
        },
        {
          id: 'p-2',
          name: 'Jo',
          avatarId: 1,
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
          id: 'p-3',
          name: 'Mia',
          avatarId: 2,
          isReady: true,
          isHost: false,
          deviceId: 'device-remote',
        },
        {
          id: 'p-4',
          name: 'Noa',
          avatarId: 3,
          isReady: true,
          isHost: false,
          deviceId: 'device-remote',
        },
      ],
    },
    {
      id: 'device-offline',
      label: 'Offline',
      isLocalDevice: false,
      isConnected: false,
      players: [
        {
          id: 'p-5',
          name: 'Zed',
          avatarId: 4,
          isReady: true,
          isHost: false,
          deviceId: 'device-offline',
        },
      ],
    },
  ],
});

describe('Sintonia logic', () => {
  it('draws unique secret numbers from 1 to 100', () => {
    const numbers = drawUniqueNumbers(
      12,
      createSequenceRandom([0.32, 0.89, 0.05, 0.65, 0.11, 0.41])
    );

    expect(numbers).toHaveLength(12);
    expect(new Set(numbers).size).toBe(12);
    numbers.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(100);
    });
  });

  it('uses local players only in local mode', () => {
    const round = createSintoniaRound({
      lobby: buildLobby('local'),
      locale: 'pt',
      random: createSequenceRandom([0.2, 0.7, 0.5, 0.9, 0.1]),
    });

    expect(round.mode).toBe('local');
    expect(round.players).toHaveLength(2);
    expect(round.players.every((player) => player.isLocalDevice)).toBe(true);
  });

  it('uses connected local + remote players in remote mode', () => {
    const round = createSintoniaRound({
      lobby: buildLobby('remote'),
      locale: 'en',
      random: createSequenceRandom([0.4, 0.6, 0.8, 0.3, 0.9]),
    });

    expect(round.mode).toBe('remote');
    expect(round.players).toHaveLength(4);
    expect(round.players.some((player) => player.id === 'p-5')).toBe(false);
  });

  it('detects first ordering failure index', () => {
    const players: SintoniaPlayer[] = [
      {
        id: 'a',
        name: 'A',
        avatarId: 10,
        deviceId: 'device-1',
        isHost: true,
        isLocalDevice: true,
        secretNumber: 20,
      },
      {
        id: 'b',
        name: 'B',
        avatarId: 11,
        deviceId: 'device-1',
        isHost: false,
        isLocalDevice: true,
        secretNumber: 70,
      },
      {
        id: 'c',
        name: 'C',
        avatarId: 12,
        deviceId: 'device-2',
        isHost: false,
        isLocalDevice: false,
        secretNumber: 55,
      },
    ];

    const playersById = createPlayersMap(players);

    expect(evaluateOrdering(['a', 'c', 'b'], playersById)).toEqual({
      isSuccess: true,
      firstFailureIndex: null,
    });

    expect(evaluateOrdering(['a', 'b', 'c'], playersById)).toEqual({
      isSuccess: false,
      firstFailureIndex: 2,
    });
  });
});
