import { HybridLobbyState, LobbyDeviceGroup } from '@/src/features/lobby/types';
import {
  getDefaultLobbyGameSettings,
  normalizeLobbyGameSettings,
} from '@/src/features/lobby/gameSettings';

const createLocalDevice = (): LobbyDeviceGroup => ({
  id: 'device-local-1',
  label: 'Seu celular',
  isLocalDevice: true,
  isConnected: true,
  players: [
    {
      id: 'p-gui',
      name: 'Gui',
      avatarId: 0,
      isReady: true,
      isHost: true,
      deviceId: 'device-local-1',
    },
    {
      id: 'p-luna',
      name: 'Luna',
      avatarId: 1,
      isReady: true,
      isHost: false,
      deviceId: 'device-local-1',
    },
    {
      id: 'p-rick',
      name: 'Rick',
      avatarId: 2,
      isReady: false,
      isHost: false,
      deviceId: 'device-local-1',
    },
  ],
});

const createRemoteDevice = (): LobbyDeviceGroup => ({
  id: 'device-remote-1',
  label: 'Celular do Pedro',
  isLocalDevice: false,
  isConnected: true,
  players: [
    {
      id: 'p-pedro',
      name: 'Pedro',
      avatarId: 3,
      isReady: true,
      isHost: false,
      deviceId: 'device-remote-1',
    },
    {
      id: 'p-ana',
      name: 'Ana',
      avatarId: 4,
      isReady: false,
      isHost: false,
      deviceId: 'device-remote-1',
    },
  ],
});

export const buildInitialHybridLobby = (
  gameId: string,
  mode: 'local' | 'remote',
  roomCode: string
): HybridLobbyState => {
  const devices = mode === 'local' ? [createLocalDevice()] : [createLocalDevice(), createRemoteDevice()];
  const availablePlayers = devices.reduce((total, device) => total + device.players.length, 0);

  return {
    roomCode,
    gameId,
    mode,
    gameSettings: normalizeLobbyGameSettings(
      gameId,
      getDefaultLobbyGameSettings(gameId, availablePlayers),
      availablePlayers
    ),
    devices,
    selectedDeviceId: 'device-local-1',
    startAt: null,
  };
};

export const hybridLobbyJsonExample = {
  roomCode: '7ZP2K',
  gameId: 'sintonia',
  mode: 'remote',
  gameSettings: getDefaultLobbyGameSettings('sintonia'),
  selectedDeviceId: 'device-local-1',
  startAt: null,
  devices: [createLocalDevice(), createRemoteDevice()],
};
