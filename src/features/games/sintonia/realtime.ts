import { get, onValue, ref, set, update } from 'firebase/database';
import { z } from 'zod';

import { SintoniaPhase, SintoniaRevealFeedback, SintoniaRound, SintoniaRoundResult } from '@/src/features/games/sintonia/types';
import { createDevicesReadyMap } from '@/src/features/games/sintonia/logic';
import { ensureFirebaseAnonymousAuth, getFirebaseServices } from '@/src/integrations/firebase';

type RemoteSintoniaPlayer = {
  id: string;
  name: string;
  avatarId: number;
  deviceId: string;
  isHost: boolean;
  secretNumber: number;
};

type SintoniaRealtimeState = {
  round: SintoniaRound;
  phase: SintoniaPhase;
  roundResult: SintoniaRoundResult;
  orderedPlayerIds: string[];
  revealedById: Record<string, SintoniaRevealFeedback>;
  revealedCount: number;
  devicesReadyById: Record<string, boolean>;
};

type SubscribeSintoniaParams = {
  roomCode: string;
  localDeviceId: string;
  onState: (state: SintoniaRealtimeState | null) => void;
  onError: (message: string) => void;
};

const remotePlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  avatarId: z.number().int().min(0),
  deviceId: z.string().min(1),
  isHost: z.boolean(),
  secretNumber: z.number().int().min(1).max(100),
});

const sessionSchema = z.object({
  roundId: z.string().min(1),
  theme: z.string().min(1),
  themeScaleLow: z.string().min(1).optional(),
  themeScaleHigh: z.string().min(1).optional(),
  mode: z.literal('remote'),
  players: z.array(remotePlayerSchema).min(2).max(10),
  initialOrder: z.array(z.string().min(1)).min(2),
});

const liveSchema = z.object({
  roundId: z.string().min(1),
  phase: z.enum(['secrets', 'ordering', 'revealing', 'finished']),
  roundResult: z.enum(['pending', 'success', 'failure']),
  orderedPlayerIds: z.array(z.string().min(1)).min(2),
  revealedById: z.record(z.string(), z.enum(['hidden', 'correct', 'incorrect'])),
  revealedCount: z.number().int().min(0),
  devicesReadyById: z.record(z.string(), z.boolean()).default({}),
  updatedAt: z.number().optional(),
  updatedByDeviceId: z.string().optional(),
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
    return 'Sem permissão para sincronizar a rodada de Sintonia.';
  }

  if (
    lowered.includes('timeout') ||
    lowered.includes('network') ||
    lowered.includes('offline') ||
    lowered.includes('disconnected')
  ) {
    return 'Conexão instável na Sintonia. Tentando reconectar.';
  }

  if (lowered.includes('invalid') || lowered.includes('payload')) {
    return 'Dados incompletos recebidos na Sintonia. Mantendo estado anterior.';
  }

  return normalized;
};

const toRealtimeError = (fallbackMessage: string, error: unknown): Error => {
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

  throw toRealtimeError(fallbackMessage, lastError);
};

const getDatabaseOrThrow = () => {
  const services = getFirebaseServices();

  if (!services.database || services.error) {
    throw new Error(
      services.error || 'Realtime Database indisponivel. Verifique EXPO_PUBLIC_FIREBASE_DATABASE_URL.'
    );
  }

  return services.database;
};

const touchRoomActivity = async (roomCode: string): Promise<void> => {
  const database = getDatabaseOrThrow();
  await update(ref(database, `rooms/${roomCode}/lobby`), {
    lastActivityAt: Date.now(),
  });
};

const mapRoundToSession = (round: SintoniaRound) => ({
  roundId: round.id,
  theme: round.theme,
  themeScaleLow: round.themeScaleLow,
  themeScaleHigh: round.themeScaleHigh,
  mode: 'remote' as const,
  players: round.players.map<RemoteSintoniaPlayer>((player) => ({
    id: player.id,
    name: player.name,
    avatarId: player.avatarId,
    deviceId: player.deviceId,
    isHost: player.isHost,
    secretNumber: player.secretNumber,
  })),
  initialOrder: round.initialOrder,
});

const mapSessionToRound = (
  session: z.infer<typeof sessionSchema>,
  localDeviceId: string
): SintoniaRound => ({
  id: session.roundId,
  theme: session.theme,
  themeScaleLow: session.themeScaleLow || 'menos',
  themeScaleHigh: session.themeScaleHigh || 'mais',
  mode: 'remote',
  initialOrder: session.initialOrder,
  players: session.players.map((player) => ({
    ...player,
    isLocalDevice: player.deviceId === localDeviceId,
  })),
});

export const initializeRemoteSintoniaRound = async (
  roomCode: string,
  round: SintoniaRound,
  ownerDeviceId: string
): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  const roomGamesRef = ref(database, `rooms/${roomCode}/games/sintonia`);
  const session = mapRoundToSession(round);
  const live = {
    roundId: round.id,
    phase: 'secrets' as const,
    roundResult: 'pending' as const,
    orderedPlayerIds: round.initialOrder,
    revealedById: round.players.reduce<Record<string, SintoniaRevealFeedback>>(
      (accumulator, player) => {
        accumulator[player.id] = 'hidden';
        return accumulator;
      },
      {}
    ),
    revealedCount: 0,
    devicesReadyById: createDevicesReadyMap(round.players),
    updatedAt: Date.now(),
    updatedByDeviceId: ownerDeviceId,
  };

  await runWithRetry(
    () =>
      update(roomGamesRef, {
        session,
        live,
      }),
    'Falha ao iniciar rodada remota da Sintonia.'
  );
  await runWithRetry(() => touchRoomActivity(roomCode), 'Falha ao registrar atividade da sala.');
};

export const subscribeRemoteSintoniaState = ({
  roomCode,
  localDeviceId,
  onState,
  onError,
}: SubscribeSintoniaParams): (() => void) => {
  const database = getDatabaseOrThrow();
  const sessionRef = ref(database, `rooms/${roomCode}/games/sintonia/session`);
  const liveRef = ref(database, `rooms/${roomCode}/games/sintonia/live`);

  let session: z.infer<typeof sessionSchema> | null = null;
  let live: z.infer<typeof liveSchema> | null = null;

  const emitIfReady = (): void => {
    if (!session || !live) {
      onState(null);
      return;
    }

    if (session.roundId !== live.roundId) {
      return;
    }

    onState({
      round: mapSessionToRound(session, localDeviceId),
      phase: live.phase,
      roundResult: live.roundResult,
      orderedPlayerIds: live.orderedPlayerIds,
      revealedById: live.revealedById,
      revealedCount: live.revealedCount,
      devicesReadyById: live.devicesReadyById,
    });
  };

  const unsubscribeSession = onValue(
    sessionRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        session = null;
        onState(null);
        return;
      }

      const parsedSession = sessionSchema.safeParse(snapshot.val());

      if (!parsedSession.success) {
        if (!session) {
          onError('Sessão Sintonia inválida no Firebase.');
        }
        return;
      }

      session = parsedSession.data;
      emitIfReady();
    },
    (error) => {
      onError(mapErrorMessage(error.message || '', 'Falha ao sincronizar sessão da Sintonia.'));
    }
  );

  const unsubscribeLive = onValue(
    liveRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        live = null;
        onState(null);
        return;
      }

      const parsedLive = liveSchema.safeParse(snapshot.val());

      if (!parsedLive.success) {
        if (!live) {
          onError('Estado em tempo real da Sintonia invalido.');
        }
        return;
      }

      live = parsedLive.data;
      emitIfReady();
    },
    (error) => {
      onError(mapErrorMessage(error.message || '', 'Falha ao sincronizar estado Sintonia.'));
    }
  );

  return () => {
    unsubscribeSession();
    unsubscribeLive();
  };
};

export const remoteSintoniaStateExists = async (roomCode: string): Promise<boolean> => {
  await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  const sessionSnapshot = await runWithRetry(
    () => get(ref(database, `rooms/${roomCode}/games/sintonia/session`)),
    'Falha ao verificar estado remoto da Sintonia.'
  );
  return sessionSnapshot.exists();
};

export const setRemoteSintoniaPhase = async (
  roomCode: string,
  phase: SintoniaPhase,
  deviceId: string
): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  await runWithRetry(
    () =>
      update(ref(database, `rooms/${roomCode}/games/sintonia/live`), {
        phase,
        updatedAt: Date.now(),
        updatedByDeviceId: deviceId,
      }),
    'Falha ao sincronizar fase da Sintonia.'
  );
  await runWithRetry(() => touchRoomActivity(roomCode), 'Falha ao registrar atividade da sala.');
};

export const setRemoteSintoniaOrder = async (
  roomCode: string,
  orderedPlayerIds: string[],
  deviceId: string
): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  await runWithRetry(
    () =>
      update(ref(database, `rooms/${roomCode}/games/sintonia/live`), {
        orderedPlayerIds,
        updatedAt: Date.now(),
        updatedByDeviceId: deviceId,
      }),
    'Falha ao sincronizar ordem da Sintonia.'
  );
  await runWithRetry(() => touchRoomActivity(roomCode), 'Falha ao registrar atividade da sala.');
};

export const setRemoteSintoniaDeviceReady = async (
  roomCode: string,
  readyDeviceId: string,
  ready: boolean,
  actorDeviceId: string
): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  await runWithRetry(
    () =>
      update(ref(database, `rooms/${roomCode}/games/sintonia/live`), {
        [`devicesReadyById/${readyDeviceId}`]: ready,
        updatedAt: Date.now(),
        updatedByDeviceId: actorDeviceId,
      }),
    'Falha ao sincronizar a prontidão do dispositivo na Sintonia.'
  );
  await runWithRetry(() => touchRoomActivity(roomCode), 'Falha ao registrar atividade da sala.');
};

export const startRemoteSintoniaReveal = async (
  roomCode: string,
  revealedById: Record<string, SintoniaRevealFeedback>,
  deviceId: string
): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  await runWithRetry(
    () =>
      update(ref(database, `rooms/${roomCode}/games/sintonia/live`), {
        phase: 'revealing',
        roundResult: 'pending',
        revealedById,
        revealedCount: 0,
        updatedAt: Date.now(),
        updatedByDeviceId: deviceId,
      }),
    'Falha ao iniciar revelação remota na Sintonia.'
  );
  await runWithRetry(() => touchRoomActivity(roomCode), 'Falha ao registrar atividade da sala.');
};

export const applyRemoteSintoniaRevealStep = async (
  roomCode: string,
  playerId: string,
  feedback: SintoniaRevealFeedback,
  revealedCount: number,
  deviceId: string
): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  await runWithRetry(
    () =>
      update(ref(database, `rooms/${roomCode}/games/sintonia/live`), {
        [`revealedById/${playerId}`]: feedback,
        revealedCount,
        updatedAt: Date.now(),
        updatedByDeviceId: deviceId,
      }),
    'Falha ao sincronizar a etapa de revelação da Sintonia.'
  );
  await runWithRetry(() => touchRoomActivity(roomCode), 'Falha ao registrar atividade da sala.');
};

export const finishRemoteSintoniaRound = async (
  roomCode: string,
  roundResult: SintoniaRoundResult,
  deviceId: string
): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  await runWithRetry(
    () =>
      update(ref(database, `rooms/${roomCode}/games/sintonia/live`), {
        phase: 'finished',
        roundResult,
        updatedAt: Date.now(),
        updatedByDeviceId: deviceId,
      }),
    'Falha ao finalizar rodada remota da Sintonia.'
  );
  await runWithRetry(() => touchRoomActivity(roomCode), 'Falha ao registrar atividade da sala.');
};

export const clearRemoteSintoniaState = async (roomCode: string): Promise<void> => {
  await ensureFirebaseAnonymousAuth();
  const database = getDatabaseOrThrow();
  await runWithRetry(
    () => set(ref(database, `rooms/${roomCode}/games/sintonia`), null),
    'Falha ao limpar estado remoto da Sintonia.'
  );
  await runWithRetry(() => touchRoomActivity(roomCode), 'Falha ao registrar atividade da sala.');
};
