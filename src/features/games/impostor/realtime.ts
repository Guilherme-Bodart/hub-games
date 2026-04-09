import { get, onValue, ref, set, update } from 'firebase/database';
import { z } from 'zod';

import { ImpostorRound } from '@/src/features/games/impostor/types';
import { ensureFirebaseAnonymousAuth, getFirebaseServices } from '@/src/integrations/firebase';

type SubscribeRemoteImpostorStateParams = {
  roomCode: string;
  onState: (round: ImpostorRound | null) => void;
  onError: (message: string) => void;
};

const remoteImpostorPlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  avatarId: z.number().int().min(0),
  isHost: z.boolean(),
  isLocalDevice: z.boolean(),
  deviceId: z.string().min(1),
  isImpostor: z.boolean(),
});

const coerceToArray = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.preprocess(
    (value) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (value && typeof value === 'object') {
        return Object.values(value as Record<string, unknown>);
      }

      return [];
    },
    z.array(itemSchema)
  );

const remoteImpostorRoundSchema = z.object({
  id: z.string().min(1),
  mode: z.union([z.literal('words'), z.literal('questions')]),
  theme: z.string().min(1),
  civilPrompt: z.string().min(1),
  impostorPrompt: z.string().min(1),
  players: coerceToArray(remoteImpostorPlayerSchema),
  impostorCount: z.number().int().min(1).max(2),
  clueTurnSeconds: z.union([z.literal(10), z.literal(20), z.literal(30)]).default(20),
  phase: z.union([
    z.literal('reveal'),
    z.literal('clues'),
    z.literal('roundDecision'),
    z.literal('voting'),
    z.literal('guessing'),
    z.literal('result'),
  ]),
  activeTurnIndex: z.number().int().min(0),
  activeTurnStartedAt: z.number().int().min(0).default(0),
  clues: z.record(z.string(), z.string()).default({}),
  submittedCluePlayerIds: coerceToArray(z.string()).default([]),
  clueHistoryByPlayer: z.record(z.string(), coerceToArray(z.string())).default({}),
  usedClueTokens: coerceToArray(z.string()).default([]),
  clueCycle: z.number().int().min(1).default(1),
  decisionVotes: z
    .record(z.string(), z.union([z.literal('continue-clues'), z.literal('vote-suspect')]))
    .default({}),
  votingSelectionsByPlayer: z.record(z.string(), coerceToArray(z.string())).default({}),
  votingSubmittedPlayerIds: coerceToArray(z.string()).default([]),
  votingTallies: z.record(z.string(), z.number().int().min(0)).default({}),
  selectedSuspectIds: coerceToArray(z.string()).default([]),
  caughtImpostorIds: coerceToArray(z.string()).default([]),
  impostorGuesses: z.record(z.string(), z.string()).default({}),
  result: z
    .object({
      winner: z.union([z.literal('civilians'), z.literal('impostors')]),
      reason: z.string().min(1),
    })
    .nullable()
    .default(null),
});

const remoteImpostorStateSchema = z.object({
  round: remoteImpostorRoundSchema,
  updatedByDeviceId: z.string().min(1),
  updatedAt: z.number().int().min(0),
});

const REMOTE_TIMEOUT_MS = 8500;
const REMOTE_MAX_ATTEMPTS = 3;
const REMOTE_BASE_DELAY_MS = 320;
const REMOTE_MAX_DELAY_MS = 1800;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const withTimeout = async <T>(action: Promise<T>, fallbackMessage: string): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race<T>([
      action,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error(fallbackMessage)), REMOTE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};

const isRetriableError = (error: unknown): boolean => {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: string }).code || '').toLowerCase()
      : '';

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

  return (
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('offline') ||
    message.includes('disconnected')
  );
};

const mapErrorMessage = (message: string, fallbackMessage: string): string => {
  const normalized = message.trim();

  if (!normalized) {
    return fallbackMessage;
  }

  const lowered = normalized.toLowerCase();

  if (lowered.includes('permission denied')) {
    return 'Sem permissão para sincronizar a rodada.';
  }

  if (
    lowered.includes('timeout') ||
    lowered.includes('network') ||
    lowered.includes('offline') ||
    lowered.includes('disconnected')
  ) {
    return 'Conexão instável durante a rodada. Tentando reconectar.';
  }

  if (lowered.includes('invalid') || lowered.includes('payload')) {
    return 'Dados incompletos da rodada recebidos. Mantendo o último estado válido.';
  }

  return normalized;
};

const toFirebaseError = (fallbackMessage: string, error: unknown): Error => {
  if (error instanceof Error && error.message) {
    return new Error(mapErrorMessage(error.message, fallbackMessage));
  }

  return new Error(mapErrorMessage(fallbackMessage, fallbackMessage));
};

const runWithRetry = async <T>(action: () => Promise<T>, fallbackMessage: string): Promise<T> => {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= REMOTE_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await withTimeout(action(), fallbackMessage);
    } catch (error) {
      lastError = error;

      if (attempt >= REMOTE_MAX_ATTEMPTS || !isRetriableError(error)) {
        break;
      }

      const backoffMs = Math.min(REMOTE_BASE_DELAY_MS * 2 ** (attempt - 1), REMOTE_MAX_DELAY_MS);
      const jitterMs = Math.floor(Math.random() * 160);
      await sleep(backoffMs + jitterMs);
    }
  }

  throw toFirebaseError(fallbackMessage, lastError);
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const parseRemoteImpostorRound = (
  rawValue: unknown,
  previousRound: ImpostorRound | null
): ImpostorRound | null => {
  const parsed = remoteImpostorStateSchema.safeParse(rawValue);

  if (parsed.success) {
    return parsed.data.round;
  }

  if (!previousRound) {
    return null;
  }

  const rawState = toRecord(rawValue);
  const rawRound = toRecord(rawState.round);

  const mergedRoundPayload = {
    ...previousRound,
    ...rawRound,
    id: typeof rawRound.id === 'string' && rawRound.id.trim() ? rawRound.id.trim() : previousRound.id,
    mode:
      rawRound.mode === 'words' || rawRound.mode === 'questions' ? rawRound.mode : previousRound.mode,
    theme:
      typeof rawRound.theme === 'string' && rawRound.theme.trim() ? rawRound.theme : previousRound.theme,
    civilPrompt:
      typeof rawRound.civilPrompt === 'string' && rawRound.civilPrompt.trim()
        ? rawRound.civilPrompt
        : previousRound.civilPrompt,
    impostorPrompt:
      typeof rawRound.impostorPrompt === 'string' && rawRound.impostorPrompt.trim()
        ? rawRound.impostorPrompt
        : previousRound.impostorPrompt,
    players: rawRound.players ?? previousRound.players,
    impostorCount:
      typeof rawRound.impostorCount === 'number' ? rawRound.impostorCount : previousRound.impostorCount,
    clueTurnSeconds:
      rawRound.clueTurnSeconds === 10 || rawRound.clueTurnSeconds === 20 || rawRound.clueTurnSeconds === 30
        ? rawRound.clueTurnSeconds
        : previousRound.clueTurnSeconds,
    phase:
      typeof rawRound.phase === 'string'
        ? rawRound.phase
        : previousRound.phase,
    activeTurnIndex:
      typeof rawRound.activeTurnIndex === 'number'
        ? rawRound.activeTurnIndex
        : previousRound.activeTurnIndex,
    activeTurnStartedAt:
      typeof rawRound.activeTurnStartedAt === 'number'
        ? rawRound.activeTurnStartedAt
        : previousRound.activeTurnStartedAt,
  };

  const mergedStatePayload = {
    ...rawState,
    round: mergedRoundPayload,
    updatedByDeviceId:
      typeof rawState.updatedByDeviceId === 'string' && rawState.updatedByDeviceId.trim()
        ? rawState.updatedByDeviceId
        : 'unknown-device',
    updatedAt:
      typeof rawState.updatedAt === 'number' && Number.isFinite(rawState.updatedAt)
        ? rawState.updatedAt
        : Date.now(),
  };

  const reparsed = remoteImpostorStateSchema.safeParse(mergedStatePayload);
  return reparsed.success ? reparsed.data.round : null;
};

const getDatabaseOrThrow = () => {
  const services = getFirebaseServices();

  if (!services.database || services.error) {
    throw new Error(
      services.error || 'Realtime Database unavailable. Check EXPO_PUBLIC_FIREBASE_DATABASE_URL.'
    );
  }

  return services.database;
};

const getLiveRef = (roomCode: string) => ref(getDatabaseOrThrow(), `rooms/${roomCode}/games/impostor-neon/live`);
const touchRoomActivity = async (roomCode: string): Promise<void> => {
  await update(ref(getDatabaseOrThrow(), `rooms/${roomCode}/lobby`), {
    lastActivityAt: Date.now(),
  });
};

export const remoteImpostorStateExists = async (roomCode: string): Promise<boolean> => {
  await ensureFirebaseAnonymousAuth();
  const snapshot = await runWithRetry(
    () => get(getLiveRef(roomCode)),
    'Falha ao verificar estado remoto de Impostor.'
  );
  return snapshot.exists();
};

export const initializeRemoteImpostorRound = async (
  roomCode: string,
  round: ImpostorRound,
  deviceId: string
): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  await runWithRetry(
    () =>
      set(getLiveRef(roomCode), {
        round,
        updatedByDeviceId: deviceId,
        updatedAt: Date.now(),
      }),
    'Falha ao iniciar rodada remota de Impostor.'
  );
  await runWithRetry(() => touchRoomActivity(roomCode), 'Falha ao registrar atividade da sala.');
};

export const updateRemoteImpostorRound = async (
  roomCode: string,
  round: ImpostorRound,
  deviceId: string
): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  await runWithRetry(
    () =>
      set(getLiveRef(roomCode), {
        round,
        updatedByDeviceId: deviceId,
        updatedAt: Date.now(),
      }),
    'Falha ao sincronizar rodada remota de Impostor.'
  );
  await runWithRetry(() => touchRoomActivity(roomCode), 'Falha ao registrar atividade da sala.');
};

export const resetRemoteImpostorRound = async (roomCode: string): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  await runWithRetry(
    () => set(getLiveRef(roomCode), null),
    'Falha ao limpar rodada remota de Impostor.'
  );
  await runWithRetry(() => touchRoomActivity(roomCode), 'Falha ao registrar atividade da sala.');
};

export const subscribeRemoteImpostorState = ({
  roomCode,
  onState,
  onError,
}: SubscribeRemoteImpostorStateParams): (() => void) => {
  const liveRef = getLiveRef(roomCode);
  let lastRound: ImpostorRound | null = null;

  return onValue(
    liveRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        lastRound = null;
        onState(null);
        return;
      }

      const parsedRound = parseRemoteImpostorRound(snapshot.val(), lastRound);

      if (!parsedRound) {
        if (lastRound) {
          onState(lastRound);
          return;
        }

        onError('Estado remoto incompleto no Impostor.');
        return;
      }

      lastRound = parsedRound;
      onState(parsedRound);
    },
    (error) => {
      onError(toFirebaseError('Sincronização remota de Impostor instável.', error).message);
    }
  );
};
