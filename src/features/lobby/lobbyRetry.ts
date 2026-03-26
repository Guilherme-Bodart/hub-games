import { resolveRealtimeMessage } from '@/src/features/lobby/lobbyErrorMap';

const REMOTE_ACTION_TIMEOUT_MS = 8500;
const REMOTE_ACTION_MAX_ATTEMPTS = 3;
const REMOTE_ACTION_BASE_DELAY_MS = 320;
const REMOTE_ACTION_MAX_DELAY_MS = 1800;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

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

export const executeWithRetry = async <T>(
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

export const waitWithPolling = async (
  poll: () => boolean | Promise<boolean>,
  options: {
    timeoutMs: number;
    intervalMs?: number;
    timeoutMessage: string;
  }
): Promise<void> => {
  const startedAt = Date.now();
  const intervalMs = options.intervalMs ?? 90;

  while (Date.now() - startedAt <= options.timeoutMs) {
    const isDone = await poll();
    if (isDone) {
      return;
    }
    await sleep(intervalMs);
  }

  throw new Error(options.timeoutMessage);
};
