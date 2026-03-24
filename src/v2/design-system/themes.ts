import { hybridMotion, hybridRadius, hybridSpacing, hybridTypography } from '@/src/v2/design-system/foundations';
import { HybridThemeId, HybridThemeTokens } from '@/src/v2/design-system/types';

const partyTheme: HybridThemeTokens = {
  id: 'party',
  name: 'Party Fusion',
  palette: {
    appBg: '#0E0B1A',
    appBgSecondary: '#18122A',
    textPrimary: '#F8F6FF',
    textSecondary: '#C2BAD9',
    textMuted: '#9389B2',
    borderSoft: 'rgba(157, 130, 232, 0.38)',
    borderStrong: 'rgba(206, 154, 255, 0.7)',
    bentoCardBg: 'rgba(24, 20, 41, 0.88)',
    bentoCardBgAlt: 'rgba(31, 24, 52, 0.9)',
    clayPrimaryBg: '#FF6D8D',
    clayPrimaryText: '#2B1020',
    claySecondaryBg: '#1FDAC8',
    claySecondaryText: '#052723',
    clayDangerBg: '#FF4F68',
    clayDangerText: '#2A070F',
    glassBg: 'rgba(38, 29, 60, 0.46)',
    glassBorder: 'rgba(222, 200, 255, 0.3)',
    accentTeal: '#22D3EE',
    accentPurple: '#C084FC',
    accentCoral: '#FF6D8D',
    success: '#16D59A',
    warning: '#F4C94E',
    danger: '#FF5E7E',
    overlay: 'rgba(8, 6, 13, 0.7)',
  },
  spacing: hybridSpacing,
  radius: hybridRadius,
  typography: hybridTypography,
  motion: hybridMotion,
  shadows: {
    bento: {
      shadowColor: '#000000',
      shadowOpacity: 0.22,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 5,
    },
    clayRaised: {
      shadowColor: '#150B22',
      shadowOpacity: 0.46,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 6 },
      elevation: 9,
    },
    clayPressed: {
      shadowColor: '#150B22',
      shadowOpacity: 0.22,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    glass: {
      shadowColor: '#0B0614',
      shadowOpacity: 0.28,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    glow: {
      shadowColor: '#C084FC',
      shadowOpacity: 0.5,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 0 },
      elevation: 10,
    },
  },
};

const sunsetTheme: HybridThemeTokens = {
  ...partyTheme,
  id: 'sunset',
  name: 'Sunset Burst',
  palette: {
    ...partyTheme.palette,
    appBg: '#1A0F17',
    appBgSecondary: '#2A1420',
    bentoCardBg: 'rgba(43, 24, 34, 0.88)',
    bentoCardBgAlt: 'rgba(55, 31, 43, 0.88)',
    accentCoral: '#FF7B56',
    accentPurple: '#E088F9',
    accentTeal: '#39D8B6',
    clayPrimaryBg: '#FF7B56',
    clayPrimaryText: '#2A1209',
    claySecondaryBg: '#39D8B6',
    claySecondaryText: '#082A22',
    glassBg: 'rgba(68, 34, 49, 0.45)',
  },
};

const arcadeTheme: HybridThemeTokens = {
  ...partyTheme,
  id: 'arcade',
  name: 'Arcade Splash',
  palette: {
    ...partyTheme.palette,
    appBg: '#0A1324',
    appBgSecondary: '#0E1D36',
    bentoCardBg: 'rgba(19, 30, 55, 0.88)',
    bentoCardBgAlt: 'rgba(25, 38, 67, 0.88)',
    accentCoral: '#FF6FA7',
    accentPurple: '#9C8CFF',
    accentTeal: '#2CD4E8',
    clayPrimaryBg: '#6AD5FF',
    clayPrimaryText: '#08223A',
    claySecondaryBg: '#9C8CFF',
    claySecondaryText: '#1A1245',
    glassBg: 'rgba(29, 49, 78, 0.45)',
  },
};

export const hybridThemes: Record<HybridThemeId, HybridThemeTokens> = {
  party: partyTheme,
  sunset: sunsetTheme,
  arcade: arcadeTheme,
};

export const defaultHybridThemeId: HybridThemeId = 'party';

export const getHybridTheme = (themeId: HybridThemeId): HybridThemeTokens => hybridThemes[themeId];
