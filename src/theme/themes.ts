import { RawColors, ThemeName, ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';

const textPrimary = '#23254D';
const textSecondary = '#556082';
const textMuted = '#8792AF';
const textInverse = '#FFFFFF';

const themePresets: Record<
  ThemeName,
  {
    label: string;
    raw: RawColors;
    systemGradient: [string, string];
  }
> = {
  coralPop: {
    label: 'Coral Pop',
    raw: {
      background: '#DDE4EE',
      primary: '#F47D74',
      secondary: '#F2D365',
      accent: '#35B8D4',
      surface: '#F8FAFF',
    },
    systemGradient: ['#FFF4F5', '#EAF4FF'],
  },
  mintJam: {
    label: 'Mint Jam',
    raw: {
      background: '#DFE8F2',
      primary: '#27C4A8',
      secondary: '#F3D774',
      accent: '#7C72E4',
      surface: '#F7FBFF',
    },
    systemGradient: ['#EEFFF8', '#F0EEFF'],
  },
  blueberrySky: {
    label: 'Blueberry Sky',
    raw: {
      background: '#DEE7F5',
      primary: '#5C84FF',
      secondary: '#8EDBFF',
      accent: '#A187FF',
      surface: '#F7FAFF',
    },
    systemGradient: ['#EFF6FF', '#F2EFFF'],
  },
};

const buildTheme = (name: ThemeName): ThemeTokens => {
  const { raw, label } = themePresets[name];
  const warningColor = '#F4B647';
  const errorColor = '#FF6B8A';
  const successColor = '#2EBE97';
  const infoColor = '#4E8FFF';
  const borderSubtle = '#D5DEEC';
  const borderAccent = withAlpha(raw.primary, 0.42);

  return {
    name,
    label,
    raw,
    semantic: {
      bg: {
        app: raw.background,
        surface: raw.surface,
        elevated: withAlpha('#FFFFFF', 0.82),
        overlay: withAlpha('#FFFFFF', 0.9),
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        muted: textMuted,
        inverse: textInverse,
      },
      border: {
        subtle: borderSubtle,
        accent: borderAccent,
        focus: raw.primary,
      },
      button: {
        primary: {
          bg: raw.primary,
          text: '#20255C',
          glow: raw.primary,
        },
        secondary: {
          bg: raw.secondary,
          text: '#20255C',
        },
        accent: {
          bg: raw.accent,
          text: '#FFFFFF',
        },
        destructive: {
          bg: errorColor,
          text: '#FFFFFF',
        },
        ghost: {
          bg: '#FFFFFF',
          text: '#2B2A46',
        },
      },
      card: {
        bg: '#FFFFFF',
        border: '#DCE3EF',
        radius: 24,
        borderWidth: 1,
      },
      input: {
        bg: '#FFFFFF',
        border: '#D4DDEB',
        text: textPrimary,
        placeholder: '#98A3BF',
      },
      badge: {
        successBg: withAlpha(successColor, 0.18),
        successText: '#1F8E70',
        errorBg: withAlpha(errorColor, 0.18),
        errorText: '#B84A66',
        warningBg: withAlpha(warningColor, 0.2),
        warningText: warningColor,
        infoBg: withAlpha(infoColor, 0.16),
        infoText: '#3B73D2',
        hostBg: withAlpha('#F7B85D', 0.2),
        hostText: '#C17A17',
        neutralBg: withAlpha('#8E9CBC', 0.2),
        neutralText: '#5E6B89',
      },
      status: {
        success: successColor,
        error: errorColor,
        warning: warningColor,
        info: infoColor,
      },
      shadow: {
        base: '#000000',
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
          sm: 8,
          md: 12,
          lg: 16,
          xl: 24,
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
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        },
        medium: {
          shadowOpacity: 0.12,
          shadowRadius: 14,
          elevation: 5,
        },
        high: {
          shadowOpacity: 0.18,
          shadowRadius: 22,
          elevation: 8,
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
          pressedOpacity: 0.9,
          disabledOpacity: 0.56,
        },
      },
      game: {
        phase: {
          waiting: '#9AA6C2',
          secrets: '#7C72E4',
          ordering: '#35B8D4',
          revealing: '#F47D74',
          finished: '#2EBE97',
          reveal: '#F47D74',
          clues: '#35B8D4',
          roundDecision: '#5C84FF',
          voting: warningColor,
          guessing: '#A187FF',
          result: '#2EBE97',
        },
        connection: {
          connected: successColor,
          reconnecting: warningColor,
          error: errorColor,
          offline: '#9AA6C2',
        },
        result: {
          success: successColor,
          failure: errorColor,
          pending: infoColor,
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

const legacyThemeAliasMap: Record<string, ThemeName> = {
  // TODO_REMOVE_NEON: remove aliases after users migrate persisted theme names.
  neonParty: 'coralPop',
  sunsetPulse: 'mintJam',
  arcadeIce: 'blueberrySky',
};

export const resolveThemeName = (value: string): ThemeName | null => {
  if (isThemeName(value)) {
    return value;
  }

  if (Object.prototype.hasOwnProperty.call(legacyThemeAliasMap, value)) {
    return legacyThemeAliasMap[value];
  }

  return null;
};

export const getTheme = (name: ThemeName): ThemeTokens => themes[name];

export const resolveThemeSystemGradient = (name: ThemeName): [string, string] =>
  themePresets[name].systemGradient;

export const defaultThemeName: ThemeName = 'coralPop';
