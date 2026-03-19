import { ComponentType } from 'react';
import { ImageSourcePropType } from 'react-native';

import { Locale } from '@/src/i18n';
import { HybridLobbyState } from '@/src/features/lobby';

export type GameId = string;

export type GameMode = 'local' | 'remote' | 'both';

export type GameStatus = 'ready' | 'coming';

export type GameActionAuthorityMode = 'host-only' | 'collaborative';

export type GameActionAuthorityRule = {
  defaultMode: GameActionAuthorityMode;
  allowHostOverride: boolean;
};

export type GameCatalogMeta = {
  id: GameId;
  coverGlyph: string;
  coverTone: string;
  coverImage?: ImageSourcePropType;
  coverAspectRatio?: number;
  title: Record<Locale, string>;
  subtitle: Record<Locale, string>;
  players: { min: number; max: number };
  mode: GameMode;
  status: GameStatus;
  actionAuthorityRules?: Record<string, GameActionAuthorityRule>;
};

export type GameRuntimeScreenProps = {
  lobby: HybridLobbyState;
  onExitLobby: () => void;
  setShellPhase?: (phaseLabel: string) => void;
};

export type GamePlugin = {
  manifest: GameCatalogMeta;
  Screen: ComponentType<GameRuntimeScreenProps>;
};
