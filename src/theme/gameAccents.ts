export type GameAccentPalette = {
  id: string;
  primary: string;
  plinth: string;
  tint: string;
  textOnPrimary: string;
  secondary?: string;
  secondaryPlinth?: string;
  secondaryTint?: string;
};

export const HUB_DEFAULT_ACCENT: GameAccentPalette = {
  id: 'hub',
  primary: '#5B6CFF',
  plinth: '#3D4CE0',
  tint: '#EEF0FF',
  textOnPrimary: '#FFFFFF',
};

export const GAME_ACCENTS: Record<string, GameAccentPalette> = {
  'impostor-neon': {
    id: 'impostor-neon',
    primary: '#FF4D6D',
    plinth: '#D92B4E',
    tint: '#FFF0F3',
    textOnPrimary: '#FFFFFF',
  },
  sintonia: {
    id: 'sintonia',
    primary: '#6366F1',
    plinth: '#4338CA',
    tint: '#EEF2FF',
    textOnPrimary: '#FFFFFF',
  },
  'draw-pass': {
    id: 'draw-pass',
    primary: '#0EA5E9',
    plinth: '#0284C7',
    tint: '#E0F2FE',
    textOnPrimary: '#FFFFFF',
  },
  'forbidden-word': {
    id: 'forbidden-word',
    primary: '#F97316',
    plinth: '#EA580C',
    tint: '#FFF7ED',
    textOnPrimary: '#FFFFFF',
  },
  'red-green-flag': {
    id: 'red-green-flag',
    primary: '#10B981',
    plinth: '#059669',
    tint: '#ECFDF5',
    textOnPrimary: '#FFFFFF',
    secondary: '#F43F5E',
    secondaryPlinth: '#E11D48',
    secondaryTint: '#FFF1F2',
  },
};

export const getGameAccent = (gameId?: string | null): GameAccentPalette => {
  if (!gameId) {
    return HUB_DEFAULT_ACCENT;
  }
  return GAME_ACCENTS[gameId] ?? HUB_DEFAULT_ACCENT;
};
