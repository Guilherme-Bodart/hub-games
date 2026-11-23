import {
  GameCatalogMeta as GameCatalogItem,
  GameMode,
  implementedCatalogGames,
} from '@/src/features/games';

export const gameCatalog: GameCatalogItem[] = [...implementedCatalogGames];

export const getGameById = (gameId: string): GameCatalogItem | undefined =>
  gameCatalog.find((game) => game.id === gameId);

export type { GameCatalogItem, GameMode };
