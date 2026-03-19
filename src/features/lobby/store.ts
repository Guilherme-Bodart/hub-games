import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { getGameById } from '@/src/features/catalog';
import { assignUniqueAvatarIds, pickAvailableAvatarId } from '@/src/features/lobby/avatarPool';
import {
  addRemotePlayer,
  createRemoteRoom,
  joinRemoteRoom,
  removeRemotePlayer,
  setRemoteLobbyStartAt,
  setDevicePresence,
  subscribeRemoteLobby,
  toggleRemotePlayerReady,
  updateRemoteLobbySettings,
} from '@/src/features/lobby/firebaseRealtime';
import { normalizeLobbyGameSettings, resolveImpostorRoundTargetPlayers } from '@/src/features/lobby/gameSettings';
import { buildInitialHybridLobby } from '@/src/features/lobby/mockState';
import { HybridLobbyState, LobbyGameSettings, RoomMode } from '@/src/features/lobby/types';

export type RealtimeStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error';
export type SessionRestoreStatus = 'idle' | 'restoring' | 'ready' | 'failed';

const CLIENT_ID_STORAGE_KEY = '@hub-games/realtime-client-id';
const PREFERRED_NICKNAME_STORAGE_KEY = '@hub-games/preferred-nickname';
const REMOTE_SESSION_CONTEXT_STORAGE_KEY = '@hub-games/remote-session-context';
const REMOTE_SYNC_TIMEOUT_MS = 8000;
const REMOTE_ACTION_TIMEOUT_MS = 8500;
const REMOTE_ACTION_MAX_ATTEMPTS = 3;
const REMOTE_ACTION_BASE_DELAY_MS = 320;
const REMOTE_ACTION_MAX_DELAY_MS = 1800;
const ROOM_CODE_LENGTH = 5;
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

type LobbySessionStore = {
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

type RemoteSessionContext = {
  roomCode: string;
  deviceId: string;
  gameId?: string;
};

let remoteSessionContext: RemoteSessionContext | null = null;
let unsubscribeRemoteLobby: (() => void) | null = null;
let unsubscribeDevicePresence: (() => void) | null = null;

const createRoomCode = (): string =>
  Array.from({ length: ROOM_CODE_LENGTH }, () => {
    const index = Math.floor(Math.random() * ROOM_CODE_ALPHABET.length);
    return ROOM_CODE_ALPHABET[index];
  }).join('');

const createClientId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const mapRealtimeMessage = (message: string, fallbackMessage: string): string => {
  const normalized = message.trim();

  if (!normalized) {
    return fallbackMessage;
  }

  const lowered = normalized.toLowerCase();

  if (lowered.includes('permission denied') || lowered.includes('sem permiss') || lowered.includes('rules')) {
    return 'Sem permissao para concluir essa acao nesta sala.';
  }

  if (
    lowered.includes('timeout') ||
    lowered.includes('network') ||
    lowered.includes('offline') ||
    lowered.includes('disconnected') ||
    lowered.includes('reconnect')
  ) {
    return 'Conexao instavel. Tente novamente em alguns segundos.';
  }

  if (
    lowered.includes('invalid lobby structure') ||
    lowered.includes('dados incompletos') ||
    lowered.includes('payload')
  ) {
    return 'A sala recebeu dados incompletos. Aguarde a proxima sincronizacao.';
  }

  return normalized;
};

const resolveRealtimeMessage = (error: unknown, fallbackMessage: string): string =>
  mapRealtimeMessage(error instanceof Error && error.message ? error.message : fallbackMessage, fallbackMessage);

const createTimeoutError = (fallbackMessage: string): Error => {
  const timeoutError = new Error('Tempo limite de conexao atingido.') as Error & { code?: string };
  timeoutError.code = 'timeout';
  timeoutError.message = fallbackMessage;
  return timeoutError;
};

const withTimeout = async <T>(
  action: Promise<T>,
  timeoutMs: number,
  fallbackMessage: string
): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race<T>([
      action,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => reject(createTimeoutError(fallbackMessage)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};

const extractRealtimeErrorCode = (error: unknown): string => {
  if (typeof error === 'object' && error && 'code' in error) {
    return String((error as { code?: string }).code || '').toLowerCase();
  }

  return '';
};

const isRetriableRealtimeError = (error: unknown): boolean => {
  const code = extractRealtimeErrorCode(error);

  if (code.includes('permission-denied') || code.includes('invalid-argument')) {
    return false;
  }

  if (
    code.includes('timeout') ||
    code.includes('network') ||
    code.includes('unavailable') ||
    code.includes('disconnected')
  ) {
    return true;
  }

  const message =
    error instanceof Error && typeof error.message === 'string' ? error.message.toLowerCase() : '';

  if (
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('offline') ||
    message.includes('disconnected') ||
    message.includes('temporarily')
  ) {
    return true;
  }

  if (message.includes('permission') || message.includes('invalid')) {
    return false;
  }

  return false;
};

const executeWithRetry = async <T>(
  action: () => Promise<T>,
  options: {
    fallbackMessage: string;
    timeoutMs?: number;
    maxAttempts?: number;
  }
): Promise<T> => {
  const timeoutMs = options.timeoutMs ?? REMOTE_ACTION_TIMEOUT_MS;
  const maxAttempts = Math.max(1, options.maxAttempts ?? REMOTE_ACTION_MAX_ATTEMPTS);
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await withTimeout(action(), timeoutMs, options.fallbackMessage);
    } catch (error) {
      lastError = error;

      if (attempt >= maxAttempts || !isRetriableRealtimeError(error)) {
        break;
      }

      const backoffMs = Math.min(
        REMOTE_ACTION_BASE_DELAY_MS * 2 ** (attempt - 1),
        REMOTE_ACTION_MAX_DELAY_MS
      );
      const jitterMs = Math.floor(Math.random() * 180);
      await sleep(backoffMs + jitterMs);
    }
  }

  throw new Error(resolveRealtimeMessage(lastError, options.fallbackMessage));
};

const parseRemoteSessionContext = (rawValue: string | null): RemoteSessionContext | null => {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<RemoteSessionContext>;
    const roomCode = typeof parsed.roomCode === 'string' ? normalizeRoomCode(parsed.roomCode) : '';
    const deviceId = typeof parsed.deviceId === 'string' ? parsed.deviceId.trim() : '';
    const gameId = typeof parsed.gameId === 'string' && parsed.gameId.trim() ? parsed.gameId.trim() : undefined;

    if (!roomCode || !deviceId) {
      return null;
    }

    return {
      roomCode,
      deviceId,
      gameId,
    };
  } catch {
    return null;
  }
};

const persistRemoteSessionContext = async (context: RemoteSessionContext): Promise<void> => {
  await AsyncStorage.setItem(REMOTE_SESSION_CONTEXT_STORAGE_KEY, JSON.stringify(context));
};

const clearStoredRemoteSessionContext = async (): Promise<void> => {
  await AsyncStorage.removeItem(REMOTE_SESSION_CONTEXT_STORAGE_KEY);
};

const normalizeRoomCode = (roomCode: string): string =>
  roomCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, ROOM_CODE_LENGTH);

const getMaxPlayersForLobby = (lobby: HybridLobbyState): number =>
  lobby.gameId === 'impostor-neon'
    ? Math.min(
        resolveImpostorRoundTargetPlayers(lobby.gameSettings),
        getGameById(lobby.gameId)?.players.max ?? Number.MAX_SAFE_INTEGER
      )
    : getGameById(lobby.gameId)?.players.max ?? Number.MAX_SAFE_INTEGER;

const isLocalDeviceHost = (lobby: HybridLobbyState): boolean =>
  lobby.devices
    .find((device) => device.id === lobby.selectedDeviceId)
    ?.players.some((player) => player.isHost) ?? false;

const normalizeLobbyWithCurrentPlayers = (lobby: HybridLobbyState): HybridLobbyState => ({
  ...lobby,
  gameSettings: normalizeLobbyGameSettings(lobby.gameId, lobby.gameSettings, countPlayers(lobby)),
});

const clearRemoteSubscriptions = (): void => {
  if (unsubscribeRemoteLobby) {
    unsubscribeRemoteLobby();
    unsubscribeRemoteLobby = null;
  }

  if (unsubscribeDevicePresence) {
    unsubscribeDevicePresence();
    unsubscribeDevicePresence = null;
  }
};

const waitForLobbySync = async (
  get: () => LobbySessionStore,
  matcher: (lobby: HybridLobbyState) => boolean,
  timeoutMs: number = REMOTE_SYNC_TIMEOUT_MS
): Promise<void> => {
  const startedAt = Date.now();

  while (Date.now() - startedAt <= timeoutMs) {
    const state = get();

    if (state.realtimeError && state.realtimeStatus === 'error') {
      throw new Error(state.realtimeError);
    }

    if (state.lobby && matcher(state.lobby)) {
      return;
    }

    await sleep(90);
  }

  throw new Error('Tempo limite ao sincronizar sala em tempo real.');
};

const getOrCreateClientIdentity = async (nickname?: string): Promise<{
  clientId: string;
  playerName: string;
  deviceLabel: string;
}> => {
  const storedClientId = await AsyncStorage.getItem(CLIENT_ID_STORAGE_KEY);
  const storedNickname = await AsyncStorage.getItem(PREFERRED_NICKNAME_STORAGE_KEY);
  const clientId = storedClientId ?? createClientId();

  if (!storedClientId) {
    await AsyncStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);
  }

  const normalizedNickname = nickname?.trim();
  const resolvedNickname = normalizedNickname || storedNickname?.trim() || '';

  if (normalizedNickname) {
    await AsyncStorage.setItem(PREFERRED_NICKNAME_STORAGE_KEY, normalizedNickname);
  }

  const suffix = clientId.slice(-4).toUpperCase();
  const fallbackPlayerName = `Jogador ${suffix}`;

  return {
    clientId,
    playerName: resolvedNickname || fallbackPlayerName,
    deviceLabel: `Dispositivo ${suffix}`,
  };
};

const getStoredPreferredNickname = async (): Promise<string> => {
  try {
    const storedNickname = await AsyncStorage.getItem(PREFERRED_NICKNAME_STORAGE_KEY);
    return storedNickname?.trim() ?? '';
  } catch {
    return '';
  }
};

const persistPreferredNickname = async (nickname: string): Promise<void> => {
  const normalizedNickname = nickname.trim().slice(0, 20);

  try {
    if (!normalizedNickname) {
      await AsyncStorage.removeItem(PREFERRED_NICKNAME_STORAGE_KEY);
      return;
    }

    await AsyncStorage.setItem(PREFERRED_NICKNAME_STORAGE_KEY, normalizedNickname);
  } catch {
    // ignore storage failures to avoid blocking gameplay actions
  }
};

const connectRoomSubscriptions = (
  set: (partial:
    | Partial<LobbySessionStore>
    | ((state: LobbySessionStore) => Partial<LobbySessionStore>)
  ) => void,
  context: RemoteSessionContext
): void => {
  clearRemoteSubscriptions();

  unsubscribeRemoteLobby = subscribeRemoteLobby({
    roomCode: context.roomCode,
    localDeviceId: context.deviceId,
    onLobby: (lobby) => {
      remoteSessionContext = {
        roomCode: context.roomCode,
        deviceId: context.deviceId,
        gameId: lobby.gameId,
      };
      void persistRemoteSessionContext(remoteSessionContext).catch(() => undefined);

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
        realtimeError: resolveRealtimeMessage(new Error(message), 'Conexao instavel. Tentando reconectar.'),
      });
    },
  });

  unsubscribeDevicePresence = setDevicePresence(context.roomCode, context.deviceId);
};

const executeRemoteAction = (
  set: (partial:
    | Partial<LobbySessionStore>
    | ((state: LobbySessionStore) => Partial<LobbySessionStore>)
  ) => void,
  action: () => Promise<void>,
  fallbackMessage: string,
  options?: {
    maxAttempts?: number;
  }
): void => {
  void executeWithRetry(action, {
    fallbackMessage,
    maxAttempts: options?.maxAttempts,
  }).catch((error) => {
    set({
      realtimeStatus: 'error',
      realtimeError: resolveRealtimeMessage(error, fallbackMessage),
    });
  });
};

export const countPlayers = (lobby: HybridLobbyState | null): number => {
  if (!lobby) {
    return 0;
  }

  return lobby.devices.reduce((total, device) => total + device.players.length, 0);
};

export const useLobbySessionStore = create<LobbySessionStore>((set, get) => ({
  selectedGameId: null,
  selectedMode: null,
  lobby: null,
  realtimeStatus: 'idle',
  realtimeError: null,
  sessionRestoreStatus: 'idle',
  getPreferredNickname: async () => getStoredPreferredNickname(),
  setPreferredNickname: async (nickname) => {
    await persistPreferredNickname(nickname);
  },
  selectGame: (gameId) => set({ selectedGameId: gameId }),
  startSession: (gameId, mode) => {
    clearRemoteSubscriptions();
    remoteSessionContext = null;
    void clearStoredRemoteSessionContext().catch(() => undefined);
    const nextRoomCode = mode === 'remote' ? createRoomCode() : '';

    set({
      selectedGameId: gameId,
      selectedMode: mode,
      lobby: assignUniqueAvatarIds(buildInitialHybridLobby(gameId, mode, nextRoomCode)),
      realtimeStatus: 'idle',
      realtimeError: null,
      sessionRestoreStatus: 'ready',
    });
  },
  endSession: () => {
    clearRemoteSubscriptions();
    remoteSessionContext = null;
    void clearStoredRemoteSessionContext().catch(() => undefined);
    set({
      selectedGameId: null,
      selectedMode: null,
      lobby: null,
      realtimeStatus: 'idle',
      realtimeError: null,
      sessionRestoreStatus: 'ready',
    });
  },
  restoreRemoteSessionIfAny: async () => {
    const currentStatus = get().sessionRestoreStatus;

    if (currentStatus === 'restoring') {
      return;
    }

    set({ sessionRestoreStatus: 'restoring' });

    try {
      const rawContext = await AsyncStorage.getItem(REMOTE_SESSION_CONTEXT_STORAGE_KEY);
      const storedContext = parseRemoteSessionContext(rawContext);

      if (!storedContext) {
        remoteSessionContext = null;
        clearRemoteSubscriptions();
        await clearStoredRemoteSessionContext().catch(() => undefined);
        set({ sessionRestoreStatus: 'ready' });
        return;
      }

      remoteSessionContext = storedContext;

      set({
        selectedGameId: storedContext.gameId ?? null,
        selectedMode: 'remote',
        lobby: null,
        realtimeStatus: 'reconnecting',
        realtimeError: null,
      });

      connectRoomSubscriptions(set, storedContext);

      await waitForLobbySync(
        get,
        (lobby) =>
          lobby.mode === 'remote' &&
          lobby.roomCode === storedContext.roomCode &&
          lobby.selectedDeviceId === storedContext.deviceId,
        REMOTE_SYNC_TIMEOUT_MS + 3500
      );

      set({ sessionRestoreStatus: 'ready' });
    } catch (error) {
      clearRemoteSubscriptions();
      remoteSessionContext = null;
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
  },
  createRemoteSession: async (gameId, options) => {
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
          }),
        {
          fallbackMessage: 'Falha ao criar sala remota.',
          maxAttempts: 2,
        }
      );

      remoteSessionContext = {
        roomCode: createdRoom.roomCode,
        deviceId: createdRoom.deviceId,
        gameId,
      };

      await persistRemoteSessionContext(remoteSessionContext).catch(() => undefined);
      connectRoomSubscriptions(set, remoteSessionContext);

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
      remoteSessionContext = null;
      await clearStoredRemoteSessionContext().catch(() => undefined);

      const message = resolveRealtimeMessage(error, 'Falha ao criar sala remota.');
      set({
        realtimeStatus: 'error',
        realtimeError: message,
      });
      throw new Error(message);
    }
  },
  joinRemoteSession: async (roomCode, options) => {
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
          }),
        {
          fallbackMessage: 'Falha ao entrar na sala.',
          maxAttempts: 2,
        }
      );

      remoteSessionContext = {
        roomCode: joinedRoom.roomCode,
        deviceId: joinedRoom.deviceId,
      };

      await persistRemoteSessionContext(remoteSessionContext).catch(() => undefined);
      connectRoomSubscriptions(set, remoteSessionContext);

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
      remoteSessionContext = null;
      await clearStoredRemoteSessionContext().catch(() => undefined);

      const message = resolveRealtimeMessage(error, 'Falha ao entrar na sala.');
      set({
        realtimeStatus: 'error',
        realtimeError: message,
      });
      throw new Error(message);
    }
  },
  updateGameSettings: (nextSettings) => {
    const lobby = get().lobby;

    if (!lobby) {
      return;
    }

    const sanitizedPatch = Object.entries(nextSettings).reduce<LobbyGameSettings>(
      (accumulator, [key, value]) => {
        if (value !== undefined) {
          accumulator[key] = value;
        }

        return accumulator;
      },
      {}
    );

    const mergedSettings = normalizeLobbyGameSettings(
      lobby.gameId,
      {
        ...lobby.gameSettings,
        ...sanitizedPatch,
      },
      countPlayers(lobby)
    );

    if (lobby.mode === 'remote') {
      const session = remoteSessionContext;

      if (!session || !isLocalDeviceHost(lobby)) {
        return;
      }

      executeRemoteAction(
        set,
        () => updateRemoteLobbySettings(session.roomCode, mergedSettings),
        'Falha ao atualizar configuracoes da sala.',
        { maxAttempts: 3 }
      );
      return;
    }

    set((state) => {
      if (!state.lobby) {
        return state;
      }

      return {
        ...state,
        lobby: normalizeLobbyWithCurrentPlayers({
          ...state.lobby,
          gameSettings: mergedSettings,
        }),
      };
    });
  },
  scheduleRemoteStart: async (startAt) => {
    const lobby = get().lobby;
    const session = remoteSessionContext;

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
      set({
        realtimeStatus: 'error',
        realtimeError: message,
      });
      throw new Error(message);
    }
  },
  clearRemoteStart: async () => {
    const lobby = get().lobby;
    const session = remoteSessionContext;

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
      set({
        realtimeStatus: 'error',
        realtimeError: message,
      });
      throw new Error(message);
    }
  },
  addPlayerToSelectedDevice: (name) => {
    const lobby = get().lobby;

    if (!lobby) {
      return;
    }

    const trimmed = name.trim();

    if (!trimmed) {
      return;
    }

    if (lobby.mode === 'remote') {
      const session = remoteSessionContext;
      const totalPlayers = countPlayers(lobby);
      const maximumPlayers = getMaxPlayersForLobby(lobby);

      if (!session || totalPlayers >= maximumPlayers) {
        set({
          realtimeStatus: 'error',
          realtimeError:
            totalPlayers >= maximumPlayers
              ? `Limite da sala atingido (${maximumPlayers}).`
              : 'Conexao remota indisponivel.',
        });
        return;
      }

      executeRemoteAction(
        set,
        () => addRemotePlayer(session.roomCode, session.deviceId, trimmed),
        'Falha ao adicionar jogador remoto.',
        { maxAttempts: 1 }
      );
      return;
    }

    set((state) => {
      if (!state.lobby) {
        return state;
      }

      const localLobby = state.lobby;
      const totalPlayers = countPlayers(localLobby);
      const maximumPlayers = getMaxPlayersForLobby(localLobby);

      if (totalPlayers >= maximumPlayers) {
        return state;
      }

      const updatedLobby = {
        ...localLobby,
        devices: localLobby.devices.map((device) => {
          if (device.id !== localLobby.selectedDeviceId) {
            return device;
          }

          const newPlayer = {
            id: `${device.id}-${Date.now()}`,
            name: trimmed,
            avatarId: pickAvailableAvatarId(localLobby),
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

      return { ...state, lobby: normalizeLobbyWithCurrentPlayers(updatedLobby) };
    });
  },
  togglePlayerReady: (playerId) => {
    const lobby = get().lobby;

    if (!lobby) {
      return;
    }

    if (lobby.mode === 'remote') {
      const session = remoteSessionContext;
      const localDevice = lobby.devices.find((device) => device.id === lobby.selectedDeviceId);
      const ownsPlayer = localDevice?.players.some((player) => player.id === playerId);

      if (!ownsPlayer || !session) {
        return;
      }

      executeRemoteAction(
        set,
        () => toggleRemotePlayerReady(session.roomCode, session.deviceId, playerId),
        'Falha ao atualizar status de pronto.',
        { maxAttempts: 1 }
      );
      return;
    }

    set((state) => {
      if (!state.lobby) {
        return state;
      }

      return {
        ...state,
        lobby: {
          ...state.lobby,
          devices: state.lobby.devices.map((device) => ({
            ...device,
            players: device.players.map((player) =>
              player.id === playerId ? { ...player, isReady: !player.isReady } : player
            ),
          })),
        },
      };
    });
  },
  removePlayer: (playerId) => {
    const lobby = get().lobby;

    if (!lobby) {
      return;
    }

    if (lobby.mode === 'remote') {
      const session = remoteSessionContext;
      const localDevice = lobby.devices.find((device) => device.id === lobby.selectedDeviceId);
      const targetPlayer = localDevice?.players.find((player) => player.id === playerId);

      if (!targetPlayer || targetPlayer.isHost || !session) {
        return;
      }

      executeRemoteAction(
        set,
        () => removeRemotePlayer(session.roomCode, session.deviceId, playerId),
        'Falha ao remover jogador remoto.',
        { maxAttempts: 2 }
      );
      return;
    }

    set((state) => {
      if (!state.lobby) {
        return state;
      }

      const updatedLobby = {
        ...state.lobby,
        devices: state.lobby.devices.map((device) => ({
          ...device,
          players: device.players.filter((player) => player.id !== playerId || player.isHost),
        })),
      };

      return {
        ...state,
        lobby: normalizeLobbyWithCurrentPlayers(updatedLobby),
      };
    });
  },
}));
