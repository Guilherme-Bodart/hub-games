import type { Locale } from '@/src/i18n';

export type LobbyGameMeta = {
  title: Record<Locale, string>;
  players: {
    min: number;
    max: number;
  };
  supportsOnlineSync: boolean;
};

const DEFAULT_PLAYER_LIMITS = {
  min: 2,
  max: 12,
} as const;

const LOBBY_GAME_META: Record<string, LobbyGameMeta> = {
  'impostor-neon': {
    title: { pt: 'Impostor', en: 'Impostor' },
    players: { min: 4, max: 12 },
    supportsOnlineSync: true,
  },
  sintonia: {
    title: { pt: 'Sintonia', en: 'Sync Match' },
    players: { min: 2, max: 10 },
    supportsOnlineSync: true,
  },
  'draw-pass': {
    title: { pt: 'Desenha e Passa', en: 'Draw and Pass' },
    players: { min: 2, max: 12 },
    supportsOnlineSync: false,
  },
  'forbidden-word': {
    title: { pt: 'Palavra Proibida', en: 'Forbidden Word' },
    players: { min: 2, max: 12 },
    supportsOnlineSync: false,
  },
  'red-green-flag': {
    title: { pt: 'Red / Green Flag', en: 'Red / Green Flag' },
    players: { min: 2, max: 10 },
    supportsOnlineSync: false,
  },
};

export const getLobbyGameMeta = (gameId: string): LobbyGameMeta | undefined =>
  LOBBY_GAME_META[gameId];

export const getLobbyGamePlayerLimits = (gameId: string) =>
  getLobbyGameMeta(gameId)?.players ?? DEFAULT_PLAYER_LIMITS;

export const getLobbyGameTitle = (gameId: string, locale: Locale): string | undefined =>
  getLobbyGameMeta(gameId)?.title[locale];

export const doesLobbyGameSupportOnlineSync = (gameId: string): boolean =>
  getLobbyGameMeta(gameId)?.supportsOnlineSync ?? false;
