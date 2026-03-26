import { setDevicePresence, subscribeRemoteLobby } from '@/src/features/lobby/firebaseRealtime';
import { resolveRealtimeMessage } from '@/src/features/lobby/lobbyErrorMap';
import { type RemoteSessionContext } from '@/src/features/lobby/lobbyPersistenceService';
import { executeWithRetry } from '@/src/features/lobby/lobbyRetry';
import type { HybridLobbyState } from '@/src/features/lobby/types';

let remoteSessionContext: RemoteSessionContext | null = null;
let unsubscribeRemoteLobby: (() => void) | null = null;
let unsubscribeDevicePresence: (() => void) | null = null;

export const getRemoteSessionContext = (): RemoteSessionContext | null => remoteSessionContext;

export const setRemoteSessionContext = (context: RemoteSessionContext | null): void => {
  remoteSessionContext = context;
};

export const clearRemoteSubscriptions = (): void => {
  if (unsubscribeRemoteLobby) {
    unsubscribeRemoteLobby();
    unsubscribeRemoteLobby = null;
  }

  if (unsubscribeDevicePresence) {
    unsubscribeDevicePresence();
    unsubscribeDevicePresence = null;
  }
};

export const connectRoomSubscriptions = (
  context: RemoteSessionContext,
  handlers: {
    onLobby: (lobby: HybridLobbyState, context: RemoteSessionContext) => void;
    onError: (message: string) => void;
  }
): void => {
  clearRemoteSubscriptions();
  setRemoteSessionContext(context);

  unsubscribeRemoteLobby = subscribeRemoteLobby({
    roomCode: context.roomCode,
    localDeviceId: context.deviceId,
    onLobby: (lobby) => {
      const nextContext: RemoteSessionContext = {
        roomCode: context.roomCode,
        deviceId: context.deviceId,
        gameId: lobby.gameId,
      };
      setRemoteSessionContext(nextContext);
      handlers.onLobby(lobby, nextContext);
    },
    onError: handlers.onError,
  });

  unsubscribeDevicePresence = setDevicePresence(context.roomCode, context.deviceId);
};

export const executeRemoteAction = (
  action: () => Promise<void>,
  fallbackMessage: string,
  onError: (message: string) => void,
  options?: {
    maxAttempts?: number;
  }
): void => {
  void executeWithRetry(action, {
    fallbackMessage,
    maxAttempts: options?.maxAttempts,
  }).catch((error) => {
    onError(resolveRealtimeMessage(error, fallbackMessage));
  });
};
