import { getGameById } from '@/src/features/catalog';
import { pickAvailableAvatarId } from '@/src/features/lobby/avatarPool';
import { normalizeLobbyGameSettings, resolveImpostorRoundTargetPlayers } from '@/src/features/lobby/gameSettings';
import type { HybridLobbyState } from '@/src/features/lobby/types';

const ROOM_CODE_LENGTH = 5;
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const createRoomCode = (): string =>
  Array.from({ length: ROOM_CODE_LENGTH }, () => {
    const index = Math.floor(Math.random() * ROOM_CODE_ALPHABET.length);
    return ROOM_CODE_ALPHABET[index];
  }).join('');

export const countPlayers = (lobby: HybridLobbyState | null): number => {
  if (!lobby) {
    return 0;
  }

  return lobby.devices.reduce((total, device) => total + device.players.length, 0);
};

export const getMaxPlayersForLobby = (lobby: HybridLobbyState): number =>
  lobby.gameId === 'impostor-neon'
    ? Math.min(
        resolveImpostorRoundTargetPlayers(lobby.gameSettings),
        getGameById(lobby.gameId)?.players.max ?? Number.MAX_SAFE_INTEGER
      )
    : getGameById(lobby.gameId)?.players.max ?? Number.MAX_SAFE_INTEGER;

export const isLocalDeviceHost = (lobby: HybridLobbyState): boolean =>
  lobby.devices
    .find((device) => device.id === lobby.selectedDeviceId)
    ?.players.some((player) => player.isHost) ?? false;

export const normalizeLobbyWithCurrentPlayers = (lobby: HybridLobbyState): HybridLobbyState => ({
  ...lobby,
  gameSettings: normalizeLobbyGameSettings(lobby.gameId, lobby.gameSettings, countPlayers(lobby)),
});

export const withAddedLocalPlayer = (
  lobby: HybridLobbyState,
  playerName: string
): HybridLobbyState => {
  const updatedLobby = {
    ...lobby,
    devices: lobby.devices.map((device) => {
      if (device.id !== lobby.selectedDeviceId) {
        return device;
      }

      const newPlayer = {
        id: `${device.id}-${Date.now()}`,
        name: playerName,
        avatarId: pickAvailableAvatarId(lobby),
        isReady: false,
        isHost: false,
        deviceId: device.id,
      };

      return {
        ...device,
        players: [...device.players, newPlayer],
      };
    }),
  };

  return normalizeLobbyWithCurrentPlayers(updatedLobby);
};

export const withToggledPlayerReady = (
  lobby: HybridLobbyState,
  playerId: string
): HybridLobbyState => ({
  ...lobby,
  devices: lobby.devices.map((device) => ({
    ...device,
    players: device.players.map((player) =>
      player.id === playerId ? { ...player, isReady: !player.isReady } : player
    ),
  })),
});

export const withRemovedLocalPlayer = (
  lobby: HybridLobbyState,
  playerId: string
): HybridLobbyState => {
  const updatedLobby = {
    ...lobby,
    devices: lobby.devices.map((device) => ({
      ...device,
      players: device.players.filter((player) => player.id !== playerId || player.isHost),
    })),
  };

  return normalizeLobbyWithCurrentPlayers(updatedLobby);
};
