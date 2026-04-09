import {
  GameCatalogMeta as GameCatalogItem,
  GAME_COVER_ASSETS,
  GAME_COVER_ASPECT_RATIOS,
  GameMode,
  implementedCatalogGames,
} from '@/src/features/games';

const catalogSeed: GameCatalogItem[] = [
  {
    id: 'sintonia',
    coverGlyph: '01',
    coverTone: '#2A153A',
    coverImage: GAME_COVER_ASSETS.SINTONIA,
    coverAspectRatio: GAME_COVER_ASPECT_RATIOS.SINTONIA,
    title: { pt: 'Sintonia', en: 'Sync Match' },
    subtitle: {
      pt: 'Acerte o número escondido no embalo da galera.',
      en: 'Match the hidden number with your squad vibe.',
    },
    players: { min: 2, max: 10 },
    mode: 'both',
    status: 'ready',
  },
  {
    id: 'impostor-neon',
    coverGlyph: 'EYE',
    coverTone: '#281622',
    coverImage: GAME_COVER_ASSETS.IMPOSTOR,
    title: { pt: 'Impostor', en: 'Impostor' },
    subtitle: {
      pt: 'Blefe social rápido com rounds explosivos.',
      en: 'Fast social bluffing with explosive rounds.',
    },
    players: { min: 4, max: 12 },
    mode: 'both',
    status: 'ready',
  },
  {
    id: 'draw-pass',
    coverGlyph: 'DRW',
    coverTone: '#10243A',
    title: { pt: 'Desenha e Passa', en: 'Draw and Pass' },
    subtitle: {
      pt: 'Desenho caótico no mesmo aparelho.',
      en: 'Chaotic drawing rounds on one shared phone.',
    },
    players: { min: 3, max: 12 },
    mode: 'local',
    status: 'coming',
  },
];

const catalogMap = new Map(catalogSeed.map((game) => [game.id, game]));

implementedCatalogGames.forEach((pluginGame) => {
  catalogMap.set(pluginGame.id, pluginGame);
});

export const gameCatalog: GameCatalogItem[] = Array.from(catalogMap.values());

export const getGameById = (gameId: string): GameCatalogItem | undefined =>
  gameCatalog.find((game) => game.id === gameId);

export type { GameCatalogItem, GameMode };
