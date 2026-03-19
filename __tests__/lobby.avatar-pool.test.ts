import {
  assignUniqueAvatarIds,
  AVATAR_SPRITE_TOTAL,
  pickAvailableAvatarId,
} from '@/src/features/lobby/avatarPool';
import { HybridLobbyState } from '@/src/features/lobby';

const baseLobby: HybridLobbyState = {
  roomCode: 'AB12',
  gameId: 'sintonia',
  mode: 'remote',
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
          avatarId: 0,
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
          avatarId: 0,
          isReady: true,
          isHost: false,
          deviceId: 'device-remote',
        },
      ],
    },
  ],
};

describe('lobby avatar sprite pool', () => {
  it('assigns unique avatar ids to all lobby players', () => {
    const roundRobinRandom = (() => {
      let counter = 0;
      return () => {
        counter += 1;
        return (counter % 97) / 97;
      };
    })();

    const lobby = assignUniqueAvatarIds(baseLobby, roundRobinRandom);
    const allAvatarIds = lobby.devices.flatMap((device) => device.players.map((player) => player.avatarId));

    expect(new Set(allAvatarIds).size).toBe(allAvatarIds.length);
    allAvatarIds.forEach((avatarId) => {
      expect(avatarId).toBeGreaterThanOrEqual(0);
      expect(avatarId).toBeLessThan(AVATAR_SPRITE_TOTAL);
    });
  });

  it('picks an avatar id that is not used yet in this lobby', () => {
    const picked = pickAvailableAvatarId({
      ...baseLobby,
      devices: [
        {
          ...baseLobby.devices[0],
          players: baseLobby.devices[0].players.map((player, index) => ({
            ...player,
            avatarId: index,
          })),
        },
        {
          ...baseLobby.devices[1],
          players: baseLobby.devices[1].players.map((player) => ({
            ...player,
            avatarId: 5,
          })),
        },
      ],
    });

    expect([0, 1, 5]).not.toContain(picked);
  });
});
