import { create } from 'zustand';

import { buildLobbySessionActions } from '@/src/features/lobby/lobbySessionActions';
import type { LobbySessionStore } from '@/src/features/lobby/lobbySession.types';

const INITIAL_STORE_STATE: Pick<
  LobbySessionStore,
  'selectedGameId' | 'selectedMode' | 'lobby' | 'realtimeStatus' | 'realtimeError' | 'sessionRestoreStatus'
> = {
  selectedGameId: null,
  selectedMode: null,
  lobby: null,
  realtimeStatus: 'idle',
  realtimeError: null,
  sessionRestoreStatus: 'idle',
};

export type { RealtimeStatus, SessionRestoreStatus } from '@/src/features/lobby/lobbySession.types';

export const useLobbySessionStore = create<LobbySessionStore>((set, get) => ({
  ...INITIAL_STORE_STATE,
  ...buildLobbySessionActions(set, get),
}));
