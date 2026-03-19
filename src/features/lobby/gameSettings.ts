import { LobbyGameSettings } from '@/src/features/lobby/types';

export type LobbyActionAuthorityMode = 'host-only' | 'collaborative';
export type ImpostorContentMode = 'words' | 'questions';

export const LOBBY_SETTINGS_KEYS = {
  actionAuthorityMode: 'sessionActionAuthorityMode',
  impostorContentMode: 'impostorContentMode',
  impostorTargetPlayers: 'impostorTargetPlayers',
  impostorCount: 'impostorCount',
} as const;

const LEGACY_LOBBY_SETTINGS_KEYS = {
  actionAuthorityMode: 'session.actionAuthorityMode',
  impostorContentMode: 'impostor.contentMode',
  impostorTargetPlayers: 'impostor.targetPlayers',
  impostorCount: 'impostor.impostorCount',
} as const;

const DEFAULT_ACTION_AUTHORITY_MODE: LobbyActionAuthorityMode = 'host-only';
const DEFAULT_IMPOSTOR_CONTENT_MODE: ImpostorContentMode = 'words';
const IMPOSTOR_MIN_PLAYERS = 4;
const IMPOSTOR_MAX_PLAYERS = 12;
const MAX_IMPOSTORS = 2;

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const getSettingValue = (
  settings: LobbyGameSettings,
  key: keyof typeof LOBBY_SETTINGS_KEYS
): LobbyGameSettings[keyof LobbyGameSettings] | undefined => {
  const primaryValue = settings[LOBBY_SETTINGS_KEYS[key]];

  if (primaryValue !== undefined) {
    return primaryValue;
  }

  return settings[LEGACY_LOBBY_SETTINGS_KEYS[key]];
};

export const getDefaultLobbyGameSettings = (
  gameId: string,
  _availablePlayers: number = IMPOSTOR_MAX_PLAYERS
): LobbyGameSettings => {
  if (gameId === 'impostor-neon') {
    return {
      [LOBBY_SETTINGS_KEYS.actionAuthorityMode]: DEFAULT_ACTION_AUTHORITY_MODE,
      [LOBBY_SETTINGS_KEYS.impostorContentMode]: DEFAULT_IMPOSTOR_CONTENT_MODE,
      [LOBBY_SETTINGS_KEYS.impostorTargetPlayers]: IMPOSTOR_MAX_PLAYERS,
      [LOBBY_SETTINGS_KEYS.impostorCount]: 1,
    };
  }

  return {
    [LOBBY_SETTINGS_KEYS.actionAuthorityMode]: DEFAULT_ACTION_AUTHORITY_MODE,
  };
};

export const normalizeLobbyGameSettings = (
  gameId: string,
  rawSettings: LobbyGameSettings | null | undefined,
  availablePlayers: number
): LobbyGameSettings => {
  const defaults = getDefaultLobbyGameSettings(gameId, availablePlayers);
  const merged: LobbyGameSettings = {
    ...defaults,
    ...(rawSettings || {}),
  };

  const actionMode =
    getSettingValue(merged, 'actionAuthorityMode') === 'collaborative'
      ? 'collaborative'
      : 'host-only';
  merged[LOBBY_SETTINGS_KEYS.actionAuthorityMode] = actionMode;

  if (gameId !== 'impostor-neon') {
    return merged;
  }

  const maxRoundPlayers = IMPOSTOR_MAX_PLAYERS;
  const parsedTargetPlayers = toFiniteNumber(getSettingValue(merged, 'impostorTargetPlayers'));
  const targetPlayers = clamp(
    Math.floor(parsedTargetPlayers ?? maxRoundPlayers),
    IMPOSTOR_MIN_PLAYERS,
    maxRoundPlayers
  );
  const parsedImpostorCount = toFiniteNumber(getSettingValue(merged, 'impostorCount'));
  const desiredImpostorCount = clamp(Math.floor(parsedImpostorCount ?? 1), 1, MAX_IMPOSTORS);
  const impostorCount = targetPlayers >= 7 ? desiredImpostorCount : 1;
  const contentMode = getSettingValue(merged, 'impostorContentMode') === 'questions' ? 'questions' : 'words';

  merged[LOBBY_SETTINGS_KEYS.impostorContentMode] = contentMode;
  merged[LOBBY_SETTINGS_KEYS.impostorTargetPlayers] = targetPlayers;
  merged[LOBBY_SETTINGS_KEYS.impostorCount] = impostorCount;

  return merged;
};

export const resolveLobbyActionAuthorityMode = (
  settings: LobbyGameSettings
): LobbyActionAuthorityMode =>
  getSettingValue(settings, 'actionAuthorityMode') === 'collaborative'
    ? 'collaborative'
    : 'host-only';

export const resolveImpostorContentMode = (settings: LobbyGameSettings): ImpostorContentMode =>
  getSettingValue(settings, 'impostorContentMode') === 'questions' ? 'questions' : 'words';

export const resolveImpostorRoundTargetPlayers = (settings: LobbyGameSettings): number => {
  const parsed = toFiniteNumber(getSettingValue(settings, 'impostorTargetPlayers'));
  return parsed ? Math.max(4, Math.floor(parsed)) : IMPOSTOR_MIN_PLAYERS;
};

export const resolveImpostorCount = (settings: LobbyGameSettings): number => {
  const parsed = toFiniteNumber(getSettingValue(settings, 'impostorCount'));
  return parsed ? clamp(Math.floor(parsed), 1, MAX_IMPOSTORS) : 1;
};
