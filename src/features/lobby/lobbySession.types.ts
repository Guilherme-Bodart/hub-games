import type { HybridLobbyState, LobbyGameSettings, RoomMode } from '@/src/features/lobby/types';

export type RealtimeStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error';
export type SessionRestoreStatus = 'idle' | 'restoring' | 'ready' | 'failed';

export type LobbySessionStore = {
  selectedGameId: string | null;
  selectedMode: RoomMode | null;
  lobby: HybridLobbyState | null;
  realtimeStatus: RealtimeStatus;
  realtimeError: string | null;
  sessionRestoreStatus: SessionRestoreStatus;
  getPreferredNickname: () => Promise<string>;
  setPreferredNickname: (nickname: string) => Promise<void>;
  selectGame: (gameId: string) => void;
  startSession: (gameId: string, mode: RoomMode) => void;
  endSession: () => void;
  restoreRemoteSessionIfAny: () => Promise<void>;
  createRemoteSession: (gameId: string, options?: { nickname?: string }) => Promise<void>;
  joinRemoteSession: (roomCode: string, options?: { nickname?: string }) => Promise<void>;
  updateGameSettings: (nextSettings: Partial<LobbyGameSettings>) => void;
  scheduleRemoteStart: (startAt: number) => Promise<void>;
  clearRemoteStart: () => Promise<void>;
  addPlayerToSelectedDevice: (name: string) => void;
  togglePlayerReady: (playerId: string) => void;
  removePlayer: (playerId: string) => void;
};

export type LobbyStoreSet = (
  partial:
    | Partial<LobbySessionStore>
    | ((state: LobbySessionStore) => Partial<LobbySessionStore>)
) => void;

export type LobbyStoreGet = () => LobbySessionStore;

export type LobbySessionStateKeys =
  | 'selectedGameId'
  | 'selectedMode'
  | 'lobby'
  | 'realtimeStatus'
  | 'realtimeError'
  | 'sessionRestoreStatus';

export type LobbySessionActions = Omit<LobbySessionStore, LobbySessionStateKeys>;
