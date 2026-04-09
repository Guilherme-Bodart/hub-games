import { resolveRealtimeMessage } from '@/src/features/lobby/lobbyErrorMap';
import {
  persistRemoteSessionContext,
  type RemoteSessionContext,
} from '@/src/features/lobby/lobbyPersistenceService';
import { connectRoomSubscriptions } from '@/src/features/lobby/lobbyRealtimeService';
import { waitWithPolling } from '@/src/features/lobby/lobbyRetry';
import type { LobbyStoreGet, LobbyStoreSet } from '@/src/features/lobby/lobbySession.types';
import type { HybridLobbyState } from '@/src/features/lobby/types';

export const waitForLobbySync = async (
  get: LobbyStoreGet,
  matcher: (lobby: HybridLobbyState) => boolean,
  options?: {
    timeoutMs?: number;
    timeoutMessage?: string;
  }
): Promise<void> => {
  await waitWithPolling(
    async () => {
      const state = get();

      if (state.realtimeError && state.realtimeStatus === 'error') {
        throw new Error(state.realtimeError);
      }

      if (state.lobby && matcher(state.lobby)) {
        return true;
      }

      return false;
    },
    {
      timeoutMs: options?.timeoutMs ?? 8000,
      intervalMs: 90,
      timeoutMessage: options?.timeoutMessage ?? 'Tempo limite ao sincronizar sala em tempo real.',
    }
  );
};

export const bindRoomSubscriptions = (set: LobbyStoreSet, context: RemoteSessionContext): void => {
  connectRoomSubscriptions(context, {
    onLobby: (lobby, nextContext) => {
      void persistRemoteSessionContext(nextContext).catch(() => undefined);

      set({
        selectedGameId: lobby.gameId,
        selectedMode: lobby.mode,
        lobby,
        realtimeStatus: 'connected',
        realtimeError: null,
        sessionRestoreStatus: 'ready',
      });
    },
    onError: (message) => {
      set({
        realtimeStatus: 'reconnecting',
        realtimeError: resolveRealtimeMessage(new Error(message), 'Conexão instável. Tentando reconectar.'),
      });
    },
  });
};
