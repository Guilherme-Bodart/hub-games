import AsyncStorage from '@react-native-async-storage/async-storage';

const CLIENT_ID_STORAGE_KEY = '@hub-games/realtime-client-id';
const PREFERRED_NICKNAME_STORAGE_KEY = '@hub-games/preferred-nickname';
const REMOTE_SESSION_CONTEXT_STORAGE_KEY = '@hub-games/remote-session-context';
const ROOM_CODE_LENGTH = 5;

export type RemoteSessionContext = {
  roomCode: string;
  deviceId: string;
  gameId?: string;
};

export const normalizeRoomCode = (roomCode: string): string =>
  roomCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, ROOM_CODE_LENGTH);

export const parseRemoteSessionContext = (rawValue: string | null): RemoteSessionContext | null => {
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

export const readStoredRemoteSessionContext = async (): Promise<RemoteSessionContext | null> => {
  const rawContext = await AsyncStorage.getItem(REMOTE_SESSION_CONTEXT_STORAGE_KEY);
  return parseRemoteSessionContext(rawContext);
};

export const persistRemoteSessionContext = async (context: RemoteSessionContext): Promise<void> => {
  await AsyncStorage.setItem(REMOTE_SESSION_CONTEXT_STORAGE_KEY, JSON.stringify(context));
};

export const clearStoredRemoteSessionContext = async (): Promise<void> => {
  await AsyncStorage.removeItem(REMOTE_SESSION_CONTEXT_STORAGE_KEY);
};

const createClientId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const getOrCreateClientIdentity = async (nickname?: string): Promise<{
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

export const getStoredPreferredNickname = async (): Promise<string> => {
  try {
    const storedNickname = await AsyncStorage.getItem(PREFERRED_NICKNAME_STORAGE_KEY);
    return storedNickname?.trim() ?? '';
  } catch {
    return '';
  }
};

export const persistPreferredNickname = async (nickname: string): Promise<void> => {
  const normalizedNickname = nickname.trim().slice(0, 20);

  try {
    if (!normalizedNickname) {
      await AsyncStorage.removeItem(PREFERRED_NICKNAME_STORAGE_KEY);
      return;
    }

    await AsyncStorage.setItem(PREFERRED_NICKNAME_STORAGE_KEY, normalizedNickname);
  } catch {
    // Ignore storage failures to avoid blocking game actions.
  }
};
