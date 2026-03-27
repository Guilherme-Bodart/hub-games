import type { Locale } from '@/src/i18n';

type LobbyGameMeta = {
  title: Record<Locale, string>;
  players: {
    min: number;
    max: number;
  };
};

const DEFAULT_PLAYER_LIMITS = {
  min: 1,
  max: Number.MAX_SAFE_INTEGER,
} as const;

const LOBBY_GAME_META: Record<string, LobbyGameMeta> = {
  sintonia: {
    title: { pt: 'Sintonia', en: 'Sync Match' },
    players: { min: 2, max: 10 },
  },
  'impostor-neon': {
    title: { pt: 'Impostor Neon', en: 'Neon Impostor' },
    players: { min: 4, max: 12 },
  },
  'draw-pass': {
    title: { pt: 'Desenha e Passa', en: 'Draw and Pass' },
    players: { min: 3, max: 12 },
  },
};

export const getLobbyGameMeta = (gameId: string): LobbyGameMeta | undefined =>
  LOBBY_GAME_META[gameId];

export const getLobbyGamePlayerLimits = (gameId: string) =>
  getLobbyGameMeta(gameId)?.players ?? DEFAULT_PLAYER_LIMITS;

export const getLobbyGameTitle = (gameId: string, locale: Locale): string | undefined =>
  getLobbyGameMeta(gameId)?.title[locale];

