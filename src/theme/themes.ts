import { RawColors, ThemeName, ThemeTokens } from '@/src/theme/types';

const STUDIO_RAW: RawColors = {
  background: '#F4F6FB',
  primary: '#5B6CFF',
  secondary: '#EBF0F8',
  accent: '#FF4D6D',
  surface: '#FFFFFF',
};

const studioPartyTheme: ThemeTokens = {
  name: 'studioParty',
  label: 'Studio Party',
  raw: STUDIO_RAW,
  semantic: {
    bg: {
      app: '#F4F6FB',
      surface: '#FFFFFF',
      subtle: '#EBF0F8',
      elevated: '#FFFFFF',
      overlay: '#FFFFFF',
      scrim: 'rgba(19, 24, 48, 0.52)',
    },
    text: {
      primary: '#181C3A',
      secondary: '#525C7A',
      muted: '#7A85A3',
      inverse: '#FFFFFF',
    },
    border: {
      subtle: '#E2E8F4',
      hairline: '#E2E8F4',
      strong: '#C7D2E6',
      accent: '#5B6CFF',
      focus: '#5B6CFF',
    },
    button: {
      primary: {
        bg: '#5B6CFF',
        plinth: '#3D4CE0',
        text: '#FFFFFF',
        glow: '#5B6CFF',
      },
      secondary: {
        bg: '#FFFFFF',
        plinth: '#D4DDF0',
        text: '#181C3A',
      },
      accent: {
        bg: '#FF4D6D',
        plinth: '#D92B4E',
        text: '#FFFFFF',
      },
      destructive: {
        bg: '#F43F5E',
        plinth: '#BE123C',
        text: '#FFFFFF',
      },
      ghost: {
        bg: '#EBF0F8',
        plinth: '#D4DDF0',
        text: '#181C3A',
      },
    },
    card: {
      bg: '#FFFFFF',
      border: '#E2E8F4',
      radius: 20,
      borderWidth: 1,
    },
    input: {
      bg: '#FFFFFF',
      border: '#C7D2E6',
      text: '#181C3A',
      placeholder: '#7A85A3',
    },
    badge: {
      successBg: '#ECFDF5',
      successText: '#0A7B56',
      errorBg: '#FFF1F2',
      errorText: '#BE123C',
      warningBg: '#FFFBEB',
      warningText: '#B45309',
      infoBg: '#EFF6FF',
      infoText: '#1D4ED8',
      hostBg: '#FFFBEB',
      hostText: '#B45309',
      neutralBg: '#EBF0F8',
      neutralText: '#525C7A',
    },
    status: {
      success: '#12B981',
      error: '#F43F5E',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
    shadow: {
      base: '#181C3A',
    },
    layout: {
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      },
      radius: {
        sm: 10,
        md: 14,
        lg: 18,
        xl: 24,
        full: 999,
      },
      borderWidth: {
        subtle: 1,
        medium: 1,
        strong: 2,
      },
      minTouchTarget: 44,
    },
    elevation: {
      low: {
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
      },
      medium: {
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 6,
      },
      high: {
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 10,
      },
    },
    motion: {
      duration: {
        instant: 100,
        fast: 180,
        normal: 250,
        slow: 450,
      },
      feedback: {
        pressedOpacity: 0.96,
        disabledOpacity: 0.5,
      },
    },
    game: {
      phase: {
        waiting: '#7A85A3',
        secrets: '#6366F1',
        ordering: '#0EA5E9',
        revealing: '#FF4D6D',
        finished: '#12B981',
        reveal: '#FF4D6D',
        clues: '#0EA5E9',
        roundDecision: '#5B6CFF',
        voting: '#F59E0B',
        guessing: '#6366F1',
        result: '#12B981',
      },
      connection: {
        connected: '#12B981',
        reconnecting: '#F59E0B',
        error: '#F43F5E',
        offline: '#7A85A3',
      },
      result: {
        success: '#12B981',
        failure: '#F43F5E',
        pending: '#3B82F6',
      },
    },
    zIndex: {
      hud: 20,
      floating: 30,
      overlay: 40,
      modal: 50,
    },
    typography: {
      titleFamily: 'Baloo2_700Bold',
      bodyFamily: 'Nunito_700Bold',
      numberFamily: 'Nunito_800ExtraBold',
      titleWeight: '400',
      bodyWeight: '400',
      numberWeight: '400',
    },
  },
};

const themes: Record<ThemeName, ThemeTokens> = {
  studioParty: studioPartyTheme,
};

export const themeOptions: Array<{ name: ThemeName; label: string }> = [
  { name: 'studioParty', label: studioPartyTheme.label },
];

export const isThemeName = (value: string): value is ThemeName => value === 'studioParty';

export const resolveThemeName = (value: string): ThemeName | null => {
  if (
    value === 'studioParty' ||
    value === 'coralPop' ||
    value === 'mintJam' ||
    value === 'blueberrySky' ||
    value === 'neonParty' ||
    value === 'sunsetPulse' ||
    value === 'arcadeIce'
  ) {
    return 'studioParty';
  }
  return null;
};

export const getTheme = (_name: ThemeName = 'studioParty'): ThemeTokens => themes.studioParty;

export const resolveThemeSystemGradient = (_name: ThemeName = 'studioParty'): [string, string] => [
  '#F4F6FB',
  '#E9EEF7',
];

export const defaultThemeName: ThemeName = 'studioParty';
