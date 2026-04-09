import {
  DataSnapshot,
  Database,
  get,
  onDisconnect,
  onValue,
  ref,
  runTransaction,
  serverTimestamp,
  set,
  update,
} from 'firebase/database';
import { z } from 'zod';

import { AVATAR_SPRITE_TOTAL } from '@/src/features/lobby/avatarPool';
import {
  getDefaultLobbyGameSettings,
  normalizeLobbyGameSettings,
  resolveImpostorRoundTargetPlayers,
} from '@/src/features/lobby/gameSettings';
import { getLobbyGamePlayerLimits } from '@/src/features/lobby/lobbyGameMeta';
import { HybridLobbyState, LobbyDeviceGroup, LobbyGameSettings, LobbyPlayer } from '@/src/features/lobby/types';
import { ensureFirebaseAnonymousAuth, getFirebaseServices } from '@/src/integrations/firebase';

type RemoteIdentity = {
  playerName: string;
  deviceLabel: string;
  preferredAvatarId?: number;
};

type CreateRemoteRoomParams = RemoteIdentity & {
  gameId: string;
};

type JoinRemoteRoomParams = RemoteIdentity & {
  roomCode: string;
};

type RemoteRoomHandle = {
  roomCode: string;
  deviceId: string;
};

type SubscribeRemoteLobbyParams = {
  roomCode: string;
  localDeviceId: string;
  onLobby: (lobby: HybridLobbyState) => void;
  onError: (message: string) => void;
};

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 5;
const MAX_ROOM_CODE_ATTEMPTS = 28;
const MAX_DEVICE_PLAYERS = 12;
const ROOM_IDLE_TTL_MS = 30 * 60 * 1000;

const remotePlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  avatarId: z.number().int().min(0),
  isReady: z.boolean(),
  isHost: z.boolean(),
  deviceId: z.string().min(1),
});

const remoteDeviceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  ownerUid: z.string().min(1),
  isConnected: z.boolean(),
  lastSeenAt: z.number().optional(),
  players: z.record(z.string(), remotePlayerSchema).default({}),
});

const remoteLobbySchema = z.object({
  roomCode: z.string().length(ROOM_CODE_LENGTH),
  gameId: z.string().min(1),
  mode: z.literal('remote'),
  settings: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
  members: z.record(z.string(), z.string().min(1)).default({}),
  devices: z.record(z.string(), remoteDeviceSchema).default({}),
  startAt: z.number().int().min(0).nullable().default(null),
});

type RemoteLobbySnapshot = z.infer<typeof remoteLobbySchema>;

const mapFirebaseMessage = (message: string, fallbackMessage: string): string => {
  const normalized = message.trim();

  if (!normalized) {
    return fallbackMessage;
  }

  const lowered = normalized.toLowerCase();

  if (lowered.includes('permission denied') || lowered.includes('sem permiss')) {
    return 'Sem permissão para acessar esta sala.';
  }

  if (
    lowered.includes('timeout') ||
    lowered.includes('network') ||
    lowered.includes('offline') ||
    lowered.includes('disconnected')
  ) {
    return 'Conexão instável com a sala. Tente novamente em instantes.';
  }

  if (lowered.includes('expired') || lowered.includes('inactivity') || lowered.includes('inativa')) {
    return 'Sala encerrada por inatividade.';
  }

  if (lowered.includes('invalid') || lowered.includes('payload')) {
    return 'A sala enviou dados incompletos. Aguarde a próxima sincronização.';
  }

  return normalized;
};

const toFirebaseError = (fallbackMessage: string, error: unknown): Error => {
  if (error instanceof Error && error.message) {
    return new Error(mapFirebaseMessage(error.message, fallbackMessage));
  }

  return new Error(mapFirebaseMessage(fallbackMessage, fallbackMessage));
};

const getDatabaseOrThrow = (): Database => {
  const services = getFirebaseServices();

  if (!services.database || services.error) {
    throw new Error(
      services.error || 'Realtime Database unavailable. Check EXPO_PUBLIC_FIREBASE_DATABASE_URL.'
    );
  }

  return services.database;
};

const normalizeRoomCode = (roomCode: string): string =>
  roomCode.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, ROOM_CODE_LENGTH);

const createRoomCode = (): string =>
  Array.from({ length: ROOM_CODE_LENGTH }, () => {
    const index = Math.floor(Math.random() * ROOM_CODE_ALPHABET.length);
    return ROOM_CODE_ALPHABET[index];
  }).join('');

const createId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const getRoomIdleCutoff = (): number => Date.now() - ROOM_IDLE_TTL_MS;

const pickAvatarId = (
  usedAvatarIds: Set<number>,
  preferredAvatarId?: number,
  random: () => number = Math.random
): number => {
  if (typeof preferredAvatarId === 'number' && Number.isFinite(preferredAvatarId)) {
    const normalizedPreferredAvatarId = normalizeAvatarId(preferredAvatarId);

    if (!usedAvatarIds.has(normalizedPreferredAvatarId)) {
      return normalizedPreferredAvatarId;
    }
  }

  const availableAvatarIds: number[] = [];

  for (let avatarId = 0; avatarId < AVATAR_SPRITE_TOTAL; avatarId += 1) {
    if (!usedAvatarIds.has(avatarId)) {
      availableAvatarIds.push(avatarId);
    }
  }

  if (availableAvatarIds.length === 0) {
    return Math.floor(random() * AVATAR_SPRITE_TOTAL);
  }

  const selectedIndex = Math.floor(random() * availableAvatarIds.length);
  return availableAvatarIds[selectedIndex];
};

const collectUsedAvatarIds = (lobby: RemoteLobbySnapshot): Set<number> => {
  const usedAvatarIds = new Set<number>();

  Object.values(lobby.devices).forEach((device) => {
    Object.values(device.players).forEach((player) => {
      usedAvatarIds.add(player.avatarId);
    });
  });

  return usedAvatarIds;
};

const countLobbyPlayers = (lobby: RemoteLobbySnapshot): number =>
  Object.values(lobby.devices).reduce(
    (totalPlayers, device) => totalPlayers + Object.keys(device.players).length,
    0
  );

const getGameMaxPlayers = (gameId: string): number => getLobbyGamePlayerLimits(gameId).max;

const getLobbyMaxPlayers = (lobby: RemoteLobbySnapshot): number => {
  const gameMaxPlayers = getGameMaxPlayers(lobby.gameId);

  if (lobby.gameId !== 'impostor-neon') {
    return gameMaxPlayers;
  }

  const configuredMaxPlayers = resolveImpostorRoundTargetPlayers(
    normalizeLobbyGameSettings(lobby.gameId, lobby.settings, countLobbyPlayers(lobby))
  );

  return Math.min(gameMaxPlayers, configuredMaxPlayers);
};

const isLobbySettingValue = (value: unknown): value is string | number | boolean | null =>
  value === null ||
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  (typeof value === 'number' && Number.isFinite(value));

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const normalizeAvatarId = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  const normalized = Math.floor(value);

  if (normalized < 0) {
    return 0;
  }

  if (normalized >= AVATAR_SPRITE_TOTAL) {
    return normalized % AVATAR_SPRITE_TOTAL;
  }

  return normalized;
};

const coerceRemotePlayerPayload = (
  playerId: string,
  deviceId: string,
  rawPlayer: unknown
): z.infer<typeof remotePlayerSchema> | null => {
  const strictPlayer = remotePlayerSchema.safeParse(rawPlayer);

  if (strictPlayer.success) {
    return strictPlayer.data;
  }

  const playerRecord = toRecord(rawPlayer);
  const name = typeof playerRecord.name === 'string' ? playerRecord.name.trim() : '';

  if (!name) {
    return null;
  }

  return {
    id:
      typeof playerRecord.id === 'string' && playerRecord.id.trim() ? playerRecord.id.trim() : playerId,
    name,
    avatarId: normalizeAvatarId(playerRecord.avatarId),
    isReady: typeof playerRecord.isReady === 'boolean' ? playerRecord.isReady : false,
    isHost: typeof playerRecord.isHost === 'boolean' ? playerRecord.isHost : false,
    deviceId:
      typeof playerRecord.deviceId === 'string' && playerRecord.deviceId.trim()
        ? playerRecord.deviceId.trim()
        : deviceId,
  };
};

const coerceRemoteDevicePayload = (
  deviceId: string,
  rawDevice: unknown
): z.infer<typeof remoteDeviceSchema> => {
  const strictDevice = remoteDeviceSchema.safeParse(rawDevice);

  if (strictDevice.success) {
    return strictDevice.data;
  }

  const deviceRecord = toRecord(rawDevice);
  const rawPlayers = toRecord(deviceRecord.players);
  const players: Record<string, z.infer<typeof remotePlayerSchema>> = {};

  Object.entries(rawPlayers).forEach(([playerId, rawPlayer]) => {
    const normalizedPlayer = coerceRemotePlayerPayload(playerId, deviceId, rawPlayer);

    if (normalizedPlayer) {
      players[playerId] = normalizedPlayer;
    }
  });

  return {
    id:
      typeof deviceRecord.id === 'string' && deviceRecord.id.trim()
        ? deviceRecord.id.trim()
        : deviceId,
    label:
      typeof deviceRecord.label === 'string' && deviceRecord.label.trim()
        ? deviceRecord.label.trim()
        : 'Dispositivo',
    ownerUid:
      typeof deviceRecord.ownerUid === 'string' && deviceRecord.ownerUid.trim()
        ? deviceRecord.ownerUid.trim()
        : 'anonymous',
    isConnected: typeof deviceRecord.isConnected === 'boolean' ? deviceRecord.isConnected : true,
    lastSeenAt:
      typeof deviceRecord.lastSeenAt === 'number' && Number.isFinite(deviceRecord.lastSeenAt)
        ? deviceRecord.lastSeenAt
        : undefined,
    players,
  };
};

const coerceRemoteLobbyPayload = (
  rawLobby: unknown,
  options?: {
    fallbackRoomCode?: string;
    fallbackGameId?: string;
  }
): unknown => {
  const lobbyRecord = toRecord(rawLobby);
  const rawSettings = toRecord(lobbyRecord.settings);
  const settings: Record<string, string | number | boolean | null> = {};

  Object.entries(rawSettings).forEach(([key, value]) => {
    if (isLobbySettingValue(value)) {
      settings[key] = value;
    }
  });

  const rawMembers = toRecord(lobbyRecord.members);
  const members: Record<string, string> = {};

  Object.entries(rawMembers).forEach(([uid, deviceId]) => {
    if (typeof deviceId === 'string' && deviceId.trim()) {
      members[uid] = deviceId.trim();
    }
  });

  const rawDevices = toRecord(lobbyRecord.devices);
  const devices: Record<string, z.infer<typeof remoteDeviceSchema>> = {};

  Object.entries(rawDevices).forEach(([deviceId, rawDevice]) => {
    devices[deviceId] = coerceRemoteDevicePayload(deviceId, rawDevice);
  });

  const roomCodeFromPayload =
    typeof lobbyRecord.roomCode === 'string' ? normalizeRoomCode(lobbyRecord.roomCode) : '';
  const fallbackRoomCode = options?.fallbackRoomCode ? normalizeRoomCode(options.fallbackRoomCode) : '';
  const gameIdFromPayload = typeof lobbyRecord.gameId === 'string' ? lobbyRecord.gameId.trim() : '';
  const fallbackGameId = typeof options?.fallbackGameId === 'string' ? options.fallbackGameId.trim() : '';

  return {
    roomCode: roomCodeFromPayload || fallbackRoomCode,
    gameId: gameIdFromPayload || fallbackGameId,
    mode: 'remote',
    settings,
    members,
    devices,
    startAt:
      typeof lobbyRecord.startAt === 'number' && Number.isFinite(lobbyRecord.startAt)
        ? Math.max(0, Math.floor(lobbyRecord.startAt))
        : null,
  };
};

const parseRemoteLobbySnapshot = (
  snapshot: DataSnapshot,
  options?: {
    fallbackRoomCode?: string;
    fallbackGameId?: string;
  }
): RemoteLobbySnapshot => {
  const parsedLobby = remoteLobbySchema.safeParse(snapshot.val());

  if (!parsedLobby.success) {
    const coercedLobby = coerceRemoteLobbyPayload(snapshot.val(), options);
    const reparsedLobby = remoteLobbySchema.safeParse(coercedLobby);

    if (!reparsedLobby.success) {
      throw new Error('Dados da sala estão incompletos no Firebase.');
    }

    return reparsedLobby.data;
  }

  return parsedLobby.data;
};

const extractPlayerOrder = (playerId: string): number => {
  const segments = playerId.split('-');

  if (segments.length >= 3) {
    const encodedTimestamp = segments[1];
    const parsedTimestamp = Number.parseInt(encodedTimestamp, 36);

    if (Number.isFinite(parsedTimestamp)) {
      return parsedTimestamp;
    }
  }

  return Number.MAX_SAFE_INTEGER;
};

const sortPlayers = (players: LobbyPlayer[]): LobbyPlayer[] =>
  [...players].sort((leftPlayer, rightPlayer) => {
    if (leftPlayer.isHost !== rightPlayer.isHost) {
      return leftPlayer.isHost ? -1 : 1;
    }

    const leftOrder = extractPlayerOrder(leftPlayer.id);
    const rightOrder = extractPlayerOrder(rightPlayer.id);

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return leftPlayer.id.localeCompare(rightPlayer.id);
  });

const mapSnapshotToLobbyState = (
  snapshot: RemoteLobbySnapshot,
  localDeviceId: string
): HybridLobbyState => {
  const availablePlayers = countLobbyPlayers(snapshot);
  const devices: LobbyDeviceGroup[] = Object.values(snapshot.devices).map((device) => ({
    id: device.id,
    label: device.label,
    isLocalDevice: device.id === localDeviceId,
    isConnected: device.isConnected,
    players: sortPlayers(Object.values(device.players)),
  }));

  devices.sort((leftDevice, rightDevice) => {
    if (leftDevice.isLocalDevice !== rightDevice.isLocalDevice) {
      return leftDevice.isLocalDevice ? -1 : 1;
    }

    if (leftDevice.isConnected !== rightDevice.isConnected) {
      return leftDevice.isConnected ? -1 : 1;
    }

    return leftDevice.label.localeCompare(rightDevice.label);
  });

  const selectedDeviceId = devices.some((device) => device.id === localDeviceId)
    ? localDeviceId
    : devices[0]?.id || localDeviceId;

  return {
    roomCode: snapshot.roomCode,
    gameId: snapshot.gameId,
    mode: 'remote',
    gameSettings: normalizeLobbyGameSettings(
      snapshot.gameId,
      snapshot.settings,
      availablePlayers
    ),
    devices,
    selectedDeviceId,
    startAt: snapshot.startAt,
  };
};

const buildRemoteDevice = (
  lobby: RemoteLobbySnapshot,
  identity: RemoteIdentity,
  ownerUid: string,
  isHostDevice: boolean
): { deviceId: string; devicePayload: z.infer<typeof remoteDeviceSchema> } => {
  const deviceId = createId('device');
  const playerId = createId('player');
  const usedAvatarIds = collectUsedAvatarIds(lobby);
  const avatarId = pickAvatarId(usedAvatarIds, identity.preferredAvatarId);

  return {
    deviceId,
    devicePayload: {
      id: deviceId,
      label: identity.deviceLabel.trim(),
      ownerUid,
      isConnected: true,
      lastSeenAt: Date.now(),
      players: {
        [playerId]: {
          id: playerId,
          name: identity.playerName.trim(),
          avatarId,
          isReady: isHostDevice,
          isHost: isHostDevice,
          deviceId,
        },
      },
    },
  };
};

const resolveInitialRoomSettings = (gameId: string): LobbyGameSettings =>
  normalizeLobbyGameSettings(gameId, getDefaultLobbyGameSettings(gameId, 1), 1);

export const createRemoteRoom = async (
  params: CreateRemoteRoomParams
): Promise<RemoteRoomHandle> => {
  const ownerUid = await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();

  for (let attempt = 0; attempt < MAX_ROOM_CODE_ATTEMPTS; attempt += 1) {
    const roomCode = createRoomCode();
    const roomRef = ref(database, `rooms/${roomCode}`);
    const deviceId = createId('device');
    const playerId = createId('player');

    const initialRoomPayload = {
      lobby: {
        roomCode,
        gameId: params.gameId,
        mode: 'remote' as const,
        settings: resolveInitialRoomSettings(params.gameId),
        startAt: null,
        lastActivityAt: Date.now(),
        members: {
          [ownerUid]: deviceId,
        },
        devices: {
          [deviceId]: {
            id: deviceId,
            label: params.deviceLabel.trim(),
            ownerUid,
            isConnected: true,
            lastSeenAt: Date.now(),
            players: {
              [playerId]: {
                id: playerId,
                name: params.playerName.trim(),
                avatarId: pickAvatarId(new Set<number>(), params.preferredAvatarId),
                isReady: true,
                isHost: true,
                deviceId,
              },
            },
          },
        },
      },
      games: {},
      createdAt: Date.now(),
    };

    try {
      await set(roomRef, initialRoomPayload);
      return { roomCode, deviceId };
    } catch (error) {
      // Existing rooms are rejected by rules with permission_denied.
      // In that case we retry with a new room code.
      const errorCode =
        typeof error === 'object' && error && 'code' in error
          ? String((error as { code?: string }).code)
          : '';

      if (errorCode === 'PERMISSION_DENIED' || errorCode === 'database/permission-denied') {
        continue;
      }

      throw toFirebaseError('Unable to create remote room right now.', error);
    }
  }

  throw new Error('Unable to create a unique room right now.');
};

export const joinRemoteRoom = async (
  params: JoinRemoteRoomParams
): Promise<RemoteRoomHandle> => {
  const ownerUid = await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  const roomCode = normalizeRoomCode(params.roomCode);
  const lobbyRef = ref(database, `rooms/${roomCode}/lobby`);
  let preflightSnapshot;

  try {
    preflightSnapshot = await get(lobbyRef);
  } catch (error) {
    const errorCode =
      typeof error === 'object' && error && 'code' in error
        ? String((error as { code?: string }).code)
        : '';

    if (errorCode === 'PERMISSION_DENIED' || errorCode === 'database/permission-denied') {
      throw new Error('Permission denied while checking this room. Verify deployed Firebase rules.');
    }

    throw toFirebaseError('Unable to verify room before joining.', error);
  }

  if (!preflightSnapshot.exists()) {
    throw new Error('Room not found for this code.');
  }

  const lobby = parseRemoteLobbySnapshot(preflightSnapshot, { fallbackRoomCode: roomCode });
  const lobbyLastActivityAt =
    typeof preflightSnapshot.child('lastActivityAt').val() === 'number'
      ? Number(preflightSnapshot.child('lastActivityAt').val())
      : 0;

  if (lobbyLastActivityAt > 0 && lobbyLastActivityAt < getRoomIdleCutoff()) {
    throw new Error('Room expired due to inactivity.');
  }

  const existingDeviceIdFromMembers = lobby.members[ownerUid];
  const existingDevice =
    (existingDeviceIdFromMembers && lobby.devices[existingDeviceIdFromMembers]) ||
    Object.values(lobby.devices).find((device) => device.ownerUid === ownerUid);
  const maxPlayers = getLobbyMaxPlayers(lobby);
  const totalPlayers = countLobbyPlayers(lobby);
  const baseUpdates: Record<string, unknown> = {
    [`members/${ownerUid}`]: existingDevice?.id,
  };

  if (existingDevice) {
    const updates: Record<string, unknown> = {
      [`members/${ownerUid}`]: existingDevice.id,
      [`devices/${existingDevice.id}/label`]: params.deviceLabel.trim(),
      [`devices/${existingDevice.id}/isConnected`]: true,
      [`devices/${existingDevice.id}/lastSeenAt`]: Date.now(),
      [`devices/${existingDevice.id}/ownerUid`]: ownerUid,
      lastActivityAt: Date.now(),
    };

    const firstPlayerId = Object.keys(existingDevice.players)[0];

    if (!firstPlayerId) {
      if (totalPlayers >= maxPlayers) {
        throw new Error(`Room player limit reached (${maxPlayers}).`);
      }

      const usedAvatarIds = collectUsedAvatarIds(lobby);
      const newPlayerId = createId('player');
      updates[`devices/${existingDevice.id}/players/${newPlayerId}`] = {
        id: newPlayerId,
        name: params.playerName.trim(),
        avatarId: pickAvatarId(usedAvatarIds, params.preferredAvatarId),
        isReady: false,
        isHost: false,
        deviceId: existingDevice.id,
      };
    }

    try {
      await update(lobbyRef, updates);
    } catch (error) {
      const errorCode =
        typeof error === 'object' && error && 'code' in error
          ? String((error as { code?: string }).code)
          : '';

      if (errorCode === 'PERMISSION_DENIED' || errorCode === 'database/permission-denied') {
        throw new Error('Permission denied while joining this room. Verify deployed Firebase rules.');
      }

      throw toFirebaseError('Unable to join room right now.', error);
    }

    return { roomCode, deviceId: existingDevice.id };
  }

  if (totalPlayers >= maxPlayers) {
    throw new Error(`Room player limit reached (${maxPlayers}).`);
  }

  const { deviceId, devicePayload } = buildRemoteDevice(lobby, params, ownerUid, false);
  const updates: Record<string, unknown> = {
    ...baseUpdates,
    [`members/${ownerUid}`]: deviceId,
    [`devices/${deviceId}`]: devicePayload,
    lastActivityAt: Date.now(),
  };

  try {
    await update(lobbyRef, updates);
  } catch (error) {
    const errorCode =
      typeof error === 'object' && error && 'code' in error
        ? String((error as { code?: string }).code)
        : '';

    if (errorCode === 'PERMISSION_DENIED' || errorCode === 'database/permission-denied') {
      throw new Error('Permission denied while joining this room. Verify deployed Firebase rules.');
    }

    throw toFirebaseError('Unable to join room right now.', error);
  }

  const updatedLobbySnapshot = await get(lobbyRef);
  const updatedLobby = parseRemoteLobbySnapshot(updatedLobbySnapshot, {
    fallbackRoomCode: roomCode,
    fallbackGameId: lobby.gameId,
  });
  const targetDeviceId =
    updatedLobby.members[ownerUid] ||
    Object.values(updatedLobby.devices).find((device) => device.ownerUid === ownerUid)?.id;

  if (!targetDeviceId) {
    throw new Error('Joined room but device mapping failed.');
  }

  return { roomCode, deviceId: targetDeviceId };
};

export const setDevicePresence = (roomCode: string, deviceId: string): (() => void) => {
  const database = getDatabaseOrThrow();
  const connectedRef = ref(database, '.info/connected');
  const deviceBaseRef = ref(database, `rooms/${roomCode}/lobby/devices/${deviceId}`);
  const deviceConnectedRef = ref(database, `rooms/${roomCode}/lobby/devices/${deviceId}/isConnected`);
  const lastSeenAtRef = ref(database, `rooms/${roomCode}/lobby/devices/${deviceId}/lastSeenAt`);
  const lobbyRef = ref(database, `rooms/${roomCode}/lobby`);

  const unsubscribe = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() !== true) {
      return;
    }

    void onDisconnect(deviceConnectedRef).set(false);
    void onDisconnect(lastSeenAtRef).set(serverTimestamp());
    void update(deviceBaseRef, {
      isConnected: true,
      lastSeenAt: Date.now(),
    });
    void update(lobbyRef, {
      lastActivityAt: Date.now(),
    });
  });

  return () => {
    unsubscribe();
    void update(deviceBaseRef, { isConnected: false, lastSeenAt: Date.now() });
    void update(lobbyRef, {
      lastActivityAt: Date.now(),
    });
  };
};

export const subscribeRemoteLobby = ({
  roomCode,
  localDeviceId,
  onLobby,
  onError,
}: SubscribeRemoteLobbyParams): (() => void) => {
  const database = getDatabaseOrThrow();
  const lobbyRef = ref(database, `rooms/${roomCode}/lobby`);
  let lastSnapshot: RemoteLobbySnapshot | null = null;

  const unsubscribe = onValue(
    lobbyRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onError('Room closed or unavailable.');
        return;
      }

      try {
        const parsedLobby = parseRemoteLobbySnapshot(snapshot, {
          fallbackRoomCode: roomCode,
          fallbackGameId: lastSnapshot?.gameId,
        });
        lastSnapshot = parsedLobby;
        onLobby(mapSnapshotToLobbyState(parsedLobby, localDeviceId));
      } catch (error) {
        if (lastSnapshot) {
          onLobby(mapSnapshotToLobbyState(lastSnapshot, localDeviceId));
          return;
        }

        onError(toFirebaseError('Falha ao ler dados da sala remota.', error).message);
      }
    },
    (error) => {
      onError(toFirebaseError('Sincronização da sala instável. Tentando reconectar.', error).message);
    }
  );

  return unsubscribe;
};

export const updateRemoteLobbySettings = async (
  roomCode: string,
  settings: LobbyGameSettings
): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  await update(ref(database, `rooms/${roomCode}/lobby`), {
    settings,
    lastActivityAt: Date.now(),
  });
};

export const setRemoteLobbyStartAt = async (
  roomCode: string,
  startAt: number | null
): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  await update(ref(database, `rooms/${roomCode}/lobby`), {
    startAt,
    lastActivityAt: Date.now(),
  });
};

export const addRemotePlayer = async (
  roomCode: string,
  deviceId: string,
  playerName: string
): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  const lobbyRef = ref(database, `rooms/${roomCode}/lobby`);
  const lobbySnapshot = await get(lobbyRef);

  if (!lobbySnapshot.exists()) {
    throw new Error('Room not found.');
  }

  const lobby = parseRemoteLobbySnapshot(lobbySnapshot, { fallbackRoomCode: roomCode });
  const targetDevice = lobby.devices[deviceId];
  const maxPlayers = getLobbyMaxPlayers(lobby);
  const totalPlayersInRoom = countLobbyPlayers(lobby);

  if (!targetDevice) {
    throw new Error('Local device not found in room.');
  }

  const totalPlayersForDevice = Object.keys(targetDevice.players).length;

  if (totalPlayersForDevice >= MAX_DEVICE_PLAYERS) {
    throw new Error('Device player limit reached.');
  }

  if (totalPlayersInRoom >= maxPlayers) {
    throw new Error(`Room player limit reached (${maxPlayers}).`);
  }

  const usedAvatarIds = collectUsedAvatarIds(lobby);
  const playerId = createId('player');

  await update(lobbyRef, {
    lastActivityAt: Date.now(),
    [`devices/${deviceId}/players/${playerId}`]: {
      id: playerId,
      name: playerName.trim(),
      avatarId: pickAvatarId(usedAvatarIds),
      isReady: false,
      isHost: false,
      deviceId,
    },
  });
};

export const toggleRemotePlayerReady = async (
  roomCode: string,
  deviceId: string,
  playerId: string
): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  const playerRef = ref(database, `rooms/${roomCode}/lobby/devices/${deviceId}/players/${playerId}`);
  const lobbyRef = ref(database, `rooms/${roomCode}/lobby`);

  await runTransaction(playerRef, (currentPlayer) => {
    if (!currentPlayer || typeof currentPlayer !== 'object') {
      return currentPlayer;
    }

    const parsedPlayer = remotePlayerSchema.safeParse(currentPlayer);

    if (!parsedPlayer.success) {
      return currentPlayer;
    }

    return {
      ...parsedPlayer.data,
      isReady: !parsedPlayer.data.isReady,
    };
  });

  await update(lobbyRef, {
    lastActivityAt: Date.now(),
  });
};

export const removeRemotePlayer = async (
  roomCode: string,
  deviceId: string,
  playerId: string
): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  const playerRef = ref(database, `rooms/${roomCode}/lobby/devices/${deviceId}/players/${playerId}`);
  const playerSnapshot = await get(playerRef);

  if (!playerSnapshot.exists()) {
    return;
  }

  const parsedPlayer = remotePlayerSchema.safeParse(playerSnapshot.val());

  if (!parsedPlayer.success) {
    throw new Error('Invalid remote player payload.');
  }

  if (parsedPlayer.data.isHost) {
    throw new Error('Host player cannot be removed.');
  }

  await set(playerRef, null);
  await update(ref(database, `rooms/${roomCode}/lobby`), {
    lastActivityAt: Date.now(),
  });
};
