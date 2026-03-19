import { impostorGamePlugin } from '@/src/features/games/impostor/plugin';
import { sintoniaGamePlugin } from '@/src/features/games/sintonia/plugin';
import { GamePlugin } from '@/src/features/games/types';

const installedGamePlugins: GamePlugin[] = [sintoniaGamePlugin, impostorGamePlugin];

const pluginMap = new Map(installedGamePlugins.map((plugin) => [plugin.manifest.id, plugin]));

export const implementedCatalogGames = installedGamePlugins.map((plugin) => plugin.manifest);

export const getGamePlugin = (gameId: string): GamePlugin | undefined => pluginMap.get(gameId);

export const hasGamePlugin = (gameId: string): boolean => pluginMap.has(gameId);
