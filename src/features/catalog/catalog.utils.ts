import { NICKNAME_PREFIXES, NICKNAME_SUFFIXES } from '@/src/features/catalog/catalog.constants';

export const resolveErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

export const createRandomNickname = (): string => {
  const prefix = NICKNAME_PREFIXES[Math.floor(Math.random() * NICKNAME_PREFIXES.length)];
  const suffix = NICKNAME_SUFFIXES[Math.floor(Math.random() * NICKNAME_SUFFIXES.length)];
  const seed = Math.floor(Math.random() * 90 + 10);
  return `${prefix}${suffix}${seed}`.slice(0, 20);
};

export const normalizeRoomCode = (value: string): string =>
  value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5);
