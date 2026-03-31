import {
  createRemoteRoom,
  joinRemoteRoom,
  setRemoteLobbyStartAt,
} from '@/src/features/lobby/firebaseRealtime';
import { resolveRealtimeMessage } from '@/src/features/lobby/lobbyErrorMap';
import {
  clearStoredRemoteSessionContext,
  getOrCreateClientIdentity,
  normalizeRoomCode,
  persistRemoteSessionContext,
  readStoredRemoteSessionContext,
  type RemoteSessionContext,
} from '@/src/features/lobby/lobbyPersistenceService';
import {
  clearRemoteSubscriptions,
  getRemoteSessionContext,
  setRemoteSessionContext,
} from '@/src/features/lobby/lobbyRealtimeService';
import { executeWithRetry } from '@/src/features/lobby/lobbyRetry';
import { bindRoomSubscriptions, waitForLobbySync } from '@/src/features/lobby/lobbySessionSync';
import type { LobbyStoreGet, LobbyStoreSet } from '@/src/features/lobby/lobbySession.types';
import { isLocalDeviceHost } from '@/src/features/lobby/lobbySessionUtils';

const REMOTE_SYNC_TIMEOUT_MS = 8000;

const setRealtimeError = (set: LobbyStoreSet, message: string): void => {
  set({
    realtimeStatus: 'error',
    realtimeError: message,
  });
};

export const restoreRemoteSessionIfAny = async (
  set: LobbyStoreSet,
  get: LobbyStoreGet
): Promise<void> => {
  const currentStatus = get().sessionRestoreStatus;

  if (currentStatus === 'restoring') {
    return;
  }

  set({ sessionRestoreStatus: 'restoring' });

  try {
    const storedContext = await readStoredRemoteSessionContext();

    if (!storedContext) {
      setRemoteSessionContext(null);
      clearRemoteSubscriptions();
      await clearStoredRemoteSessionContext().catch(() => undefined);
      set({ sessionRestoreStatus: 'ready' });
      return;
    }

    setRemoteSessionContext(storedContext);

    set({
      selectedGameId: storedContext.gameId ?? null,
      selectedMode: 'remote',
      lobby: null,
      realtimeStatus: 'reconnecting',
      realtimeError: null,
    });

    bindRoomSubscriptions(set, storedContext);

    await waitForLobbySync(
      get,
      (lobby) =>
        lobby.mode === 'remote' &&
        lobby.roomCode === storedContext.roomCode &&
        lobby.selectedDeviceId === storedContext.deviceId,
      {
        timeoutMs: REMOTE_SYNC_TIMEOUT_MS + 3500,
      }
    );

    set({ sessionRestoreStatus: 'ready' });
  } catch (error) {
    clearRemoteSubscriptions();
    setRemoteSessionContext(null);
    await clearStoredRemoteSessionContext().catch(() => undefined);

    const message = resolveRealtimeMessage(error, 'Nao foi possivel restaurar a sala remota.');
    set({
      selectedGameId: null,
      selectedMode: null,
      lobby: null,
      realtimeStatus: 'error',
      realtimeError: message,
      sessionRestoreStatus: 'failed',
    });
  }
};

export const createRemoteSessionFlow = async (
  set: LobbyStoreSet,
  get: LobbyStoreGet,
  gameId: string,
  options?: { nickname?: string }
): Promise<void> => {
  try {
    const identity = await getOrCreateClientIdentity(options?.nickname);

    set({
      selectedGameId: gameId,
      selectedMode: 'remote',
      lobby: null,
      realtimeStatus: 'connecting',
      realtimeError: null,
      sessionRestoreStatus: 'ready',
    });

    const createdRoom = await executeWithRetry(
      () =>
        createRemoteRoom({
          gameId,
          playerName: identity.playerName,
          deviceLabel: identity.deviceLabel,
          preferredAvatarId: identity.avatarId,
        }),
      {
        fallbackMessage: 'Falha ao criar sala remota.',
        maxAttempts: 2,
      }
    );

    const createdSessionContext: RemoteSessionContext = {
      roomCode: createdRoom.roomCode,
      deviceId: createdRoom.deviceId,
      gameId,
    };
    setRemoteSessionContext(createdSessionContext);
    await persistRemoteSessionContext(createdSessionContext).catch(() => undefined);
    bindRoomSubscriptions(set, createdSessionContext);

    await executeWithRetry(
      () =>
        waitForLobbySync(
          get,
          (lobby) =>
            lobby.mode === 'remote' &&
            lobby.gameId === gameId &&
            lobby.roomCode === createdRoom.roomCode &&
            lobby.selectedDeviceId === createdRoom.deviceId
        ),
      {
        fallbackMessage: 'Falha ao sincronizar sala recem-criada.',
        maxAttempts: 2,
      }
    );
  } catch (error) {
    clearRemoteSubscriptions();
    setRemoteSessionContext(null);
    await clearStoredRemoteSessionContext().catch(() => undefined);

    const message = resolveRealtimeMessage(error, 'Falha ao criar sala remota.');
    setRealtimeError(set, message);
    throw new Error(message);
  }
};

export const joinRemoteSessionFlow = async (
  set: LobbyStoreSet,
  get: LobbyStoreGet,
  roomCode: string,
  options?: { nickname?: string }
): Promise<void> => {
  const normalizedCode = normalizeRoomCode(roomCode);

  if (!normalizedCode) {
    const message = 'Digite um codigo valido para entrar na sala.';
    set({
      realtimeStatus: 'error',
      realtimeError: message,
      sessionRestoreStatus: 'ready',
    });
    throw new Error(message);
  }

  try {
    const identity = await getOrCreateClientIdentity(options?.nickname);

    set({
      selectedMode: 'remote',
      lobby: null,
      realtimeStatus: 'connecting',
      realtimeError: null,
      sessionRestoreStatus: 'ready',
    });

    const joinedRoom = await executeWithRetry(
      () =>
        joinRemoteRoom({
          roomCode: normalizedCode,
          playerName: identity.playerName,
          deviceLabel: identity.deviceLabel,
          preferredAvatarId: identity.avatarId,
        }),
      {
        fallbackMessage: 'Falha ao entrar na sala.',
        maxAttempts: 2,
      }
    );

    const joinedSessionContext: RemoteSessionContext = {
      roomCode: joinedRoom.roomCode,
      deviceId: joinedRoom.deviceId,
    };
    setRemoteSessionContext(joinedSessionContext);
    await persistRemoteSessionContext(joinedSessionContext).catch(() => undefined);
    bindRoomSubscriptions(set, joinedSessionContext);

    await executeWithRetry(
      () =>
        waitForLobbySync(
          get,
          (lobby) =>
            lobby.mode === 'remote' &&
            lobby.roomCode === joinedRoom.roomCode &&
            lobby.selectedDeviceId === joinedRoom.deviceId
        ),
      {
        fallbackMessage: 'Falha ao sincronizar sala apos entrada.',
        maxAttempts: 2,
      }
    );
  } catch (error) {
    clearRemoteSubscriptions();
    setRemoteSessionContext(null);
    await clearStoredRemoteSessionContext().catch(() => undefined);

    const message = resolveRealtimeMessage(error, 'Falha ao entrar na sala.');
    setRealtimeError(set, message);
    throw new Error(message);
  }
};

export const scheduleRemoteStartFlow = async (
  set: LobbyStoreSet,
  get: LobbyStoreGet,
  startAt: number
): Promise<void> => {
  const lobby = get().lobby;
  const session = getRemoteSessionContext();

  if (!lobby || lobby.mode !== 'remote' || !session || !isLocalDeviceHost(lobby)) {
    return;
  }

  try {
    await executeWithRetry(() => setRemoteLobbyStartAt(session.roomCode, startAt), {
      fallbackMessage: 'Falha ao sincronizar inicio da partida.',
      maxAttempts: 3,
    });
  } catch (error) {
    const message = resolveRealtimeMessage(error, 'Falha ao sincronizar inicio da partida.');
    setRealtimeError(set, message);
    throw new Error(message);
  }
};

export const clearRemoteStartFlow = async (
  set: LobbyStoreSet,
  get: LobbyStoreGet
): Promise<void> => {
  const lobby = get().lobby;
  const session = getRemoteSessionContext();

  if (!lobby || lobby.mode !== 'remote' || !session || !isLocalDeviceHost(lobby)) {
    return;
  }

  try {
    await executeWithRetry(() => setRemoteLobbyStartAt(session.roomCode, null), {
      fallbackMessage: 'Falha ao limpar inicio sincronizado.',
      maxAttempts: 3,
    });
  } catch (error) {
    const message = resolveRealtimeMessage(error, 'Falha ao limpar inicio sincronizado.');
    setRealtimeError(set, message);
    throw new Error(message);
  }
};
