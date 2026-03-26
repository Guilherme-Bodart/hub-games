import type { GameCatalogItem } from '@/src/features/catalog/games';
import { NICKNAME_PREFIXES, NICKNAME_SUFFIXES } from '@/src/features/catalog/catalog.constants';
import type { CatalogModeMeta, CatalogTileTone, CatalogButtonTone } from '@/src/features/catalog/catalog.types';

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

export const resolveModeMeta = (mode: GameCatalogItem['mode']): CatalogModeMeta => {
  if (mode === 'local') {
    return { icons: ['phone-portrait-outline'] };
  }

  if (mode === 'remote') {
    return { icons: ['globe-outline'] };
  }

  return { icons: ['phone-portrait-outline', 'globe-outline'] };
};

export const resolveTileTone = (index: number): CatalogTileTone => {
  if (index === 0) {
    return 'purple';
  }
  if (index === 1) {
    return 'cyan';
  }
  if (index === 2) {
    return 'pink';
  }
  return 'blue';
};

export const resolveActionTone = (index: number): CatalogButtonTone =>
  index % 2 === 0 ? 'orange' : 'blue';
