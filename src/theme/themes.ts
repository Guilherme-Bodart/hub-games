import { RawColors, ThemeName, ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';

const textPrimary = '#F4F3FF';

const themePresets: Record<ThemeName, { label: string; raw: RawColors }> = {
  neonParty: {
    label: 'Neon Party',
    raw: {
      background: '#070A18',
      primary: '#C778FF',
      secondary: '#10D8C2',
      accent: '#FF5F8B',
      surface: '#121933',
    },
  },
  sunsetPulse: {
    label: 'Sunset Pulse',
    raw: {
      background: '#170C14',
      primary: '#FF8F6B',
      secondary: '#FF6FC8',
      accent: '#FFD45C',
      surface: '#2B1830',
    },
  },
  arcadeIce: {
    label: 'Arcade Ice',
    raw: {
      background: '#091326',
      primary: '#48B7FF',
      secondary: '#9D83FF',
      accent: '#30E5B4',
      surface: '#152640',
    },
  },
};

const buildTheme = (name: ThemeName): ThemeTokens => {
  const { raw, label } = themePresets[name];
  const warningColor = '#FFB547';

  return {
    name,
    label,
    raw,
    semantic: {
      bg: {
        app: raw.background,
        surface: raw.surface,
        elevated: withAlpha(raw.primary, 0.14),
        overlay: withAlpha(raw.background, 0.9),
      },
      text: {
        primary: textPrimary,
        secondary: withAlpha(textPrimary, 0.82),
        muted: withAlpha(textPrimary, 0.62),
        inverse: raw.background,
      },
      border: {
        subtle: withAlpha(raw.primary, 0.33),
        accent: withAlpha(raw.secondary, 0.62),
        focus: raw.secondary,
      },
      button: {
        primary: {
          bg: raw.primary,
          text: raw.background,
          glow: raw.primary,
        },
        secondary: {
          bg: raw.secondary,
          text: raw.background,
        },
        accent: {
          bg: raw.accent,
          text: textPrimary,
        },
        destructive: {
          bg: raw.accent,
          text: textPrimary,
        },
        ghost: {
          bg: withAlpha(raw.surface, 0.62),
          text: textPrimary,
        },
      },
      card: {
        bg: raw.surface,
        border: withAlpha(raw.primary, 0.38),
        radius: 16,
        borderWidth: 1,
      },
      input: {
        bg: withAlpha(raw.surface, 0.9),
        border: withAlpha(raw.primary, 0.42),
        text: textPrimary,
        placeholder: withAlpha(textPrimary, 0.54),
      },
      badge: {
        successBg: withAlpha(raw.secondary, 0.24),
        successText: raw.secondary,
        errorBg: withAlpha(raw.accent, 0.24),
        errorText: raw.accent,
        warningBg: withAlpha(warningColor, 0.24),
        warningText: warningColor,
        infoBg: withAlpha(raw.primary, 0.24),
        infoText: raw.primary,
        hostBg: withAlpha(raw.accent, 0.24),
        hostText: raw.accent,
        neutralBg: withAlpha(raw.primary, 0.24),
        neutralText: raw.primary,
      },
      status: {
        success: raw.secondary,
        error: raw.accent,
        warning: warningColor,
        info: raw.primary,
      },
      shadow: {
        neon: raw.primary,
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
          sm: 6,
          md: 10,
          lg: 14,
          xl: 20,
          full: 999,
        },
        borderWidth: {
          subtle: 1,
          medium: 1.5,
          strong: 2,
        },
        minTouchTarget: 44,
      },
      elevation: {
        low: {
          shadowOpacity: 0.14,
          shadowRadius: 5,
          elevation: 2,
        },
        medium: {
          shadowOpacity: 0.22,
          shadowRadius: 12,
          elevation: 6,
        },
        high: {
          shadowOpacity: 0.34,
          shadowRadius: 20,
          elevation: 10,
        },
      },
      motion: {
        duration: {
          instant: 100,
          fast: 200,
          normal: 250,
          slow: 500,
        },
        feedback: {
          pressedOpacity: 0.82,
          disabledOpacity: 0.45,
        },
      },
      game: {
        phase: {
          waiting: withAlpha(textPrimary, 0.64),
          secrets: raw.primary,
          ordering: raw.secondary,
          revealing: raw.accent,
          finished: raw.secondary,
          reveal: raw.accent,
          clues: raw.secondary,
          roundDecision: raw.primary,
          voting: warningColor,
          guessing: raw.accent,
          result: raw.secondary,
        },
        connection: {
          connected: raw.secondary,
          reconnecting: warningColor,
          error: raw.accent,
          offline: withAlpha(textPrimary, 0.55),
        },
        result: {
          success: raw.secondary,
          failure: raw.accent,
          pending: raw.primary,
        },
      },
      zIndex: {
        hud: 20,
        floating: 30,
        overlay: 40,
        modal: 50,
      },
      typography: {
        titleFamily: 'Inter_700Bold',
        bodyFamily: 'Inter_400Regular',
        numberFamily: 'Inter_800ExtraBold',
        titleWeight: '700',
        bodyWeight: '400',
        numberWeight: '800',
      },
    },
  };
};

export const themeOptions = (Object.keys(themePresets) as ThemeName[]).map((name) => ({
  name,
  label: themePresets[name].label,
}));

const themes = (Object.keys(themePresets) as ThemeName[]).reduce<Record<ThemeName, ThemeTokens>>(
  (accumulator, name) => {
    accumulator[name] = buildTheme(name);
    return accumulator;
  },
  {} as Record<ThemeName, ThemeTokens>
);

export const isThemeName = (value: string): value is ThemeName =>
  Object.prototype.hasOwnProperty.call(themePresets, value);

export const getTheme = (name: ThemeName): ThemeTokens => themes[name];

export const defaultThemeName: ThemeName = 'neonParty';
