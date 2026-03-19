export type RoomMode = 'local' | 'remote';
export type LobbyGameSettingsValue = string | number | boolean | null;
export type LobbyGameSettings = Record<string, LobbyGameSettingsValue>;

export type LobbyPlayer = {
  id: string;
  name: string;
  avatarId: number;
  isReady: boolean;
  isHost: boolean;
  deviceId: string;
};

export type LobbyDeviceGroup = {
  id: string;
  label: string;
  isLocalDevice: boolean;
  isConnected: boolean;
  players: LobbyPlayer[];
};

export type HybridLobbyState = {
  roomCode: string;
  gameId: string;
  mode: RoomMode;
  gameSettings: LobbyGameSettings;
  devices: LobbyDeviceGroup[];
  selectedDeviceId: string;
  startAt: number | null;
};
