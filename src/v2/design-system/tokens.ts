import { defaultHybridThemeId, getHybridTheme } from '@/src/v2/design-system/themes';

const activeTheme = getHybridTheme(defaultHybridThemeId);

export const v2Tokens = {
  colors: {
    background: activeTheme.palette.appBg,
    backgroundSecondary: activeTheme.palette.appBgSecondary,
    surface: activeTheme.palette.bentoCardBg,
    surfaceStrong: activeTheme.palette.bentoCardBgAlt,
    border: activeTheme.palette.borderSoft,
    borderStrong: activeTheme.palette.borderStrong,
    textPrimary: activeTheme.palette.textPrimary,
    textSecondary: activeTheme.palette.textSecondary,
    textMuted: activeTheme.palette.textMuted,
    neonPrimary: activeTheme.palette.accentPurple,
    neonSecondary: activeTheme.palette.accentTeal,
    neonAccent: activeTheme.palette.accentCoral,
    clayPrimaryBg: activeTheme.palette.clayPrimaryBg,
    clayPrimaryText: activeTheme.palette.clayPrimaryText,
    claySecondaryBg: activeTheme.palette.claySecondaryBg,
    claySecondaryText: activeTheme.palette.claySecondaryText,
    clayDangerBg: activeTheme.palette.clayDangerBg,
    clayDangerText: activeTheme.palette.clayDangerText,
    success: activeTheme.palette.success,
    warning: activeTheme.palette.warning,
    danger: activeTheme.palette.danger,
    glassBg: activeTheme.palette.glassBg,
    glassBorder: activeTheme.palette.glassBorder,
    overlay: activeTheme.palette.overlay,
  },
  radius: activeTheme.radius,
  spacing: activeTheme.spacing,
  typography: {
    hero: activeTheme.typography.hero,
    title: activeTheme.typography.title,
    section: activeTheme.typography.section,
    subtitle: activeTheme.typography.body,
    body: activeTheme.typography.body,
    caption: activeTheme.typography.caption,
    chip: activeTheme.typography.chip,
    button: activeTheme.typography.button,
  },
  motion: activeTheme.motion,
  shadows: {
    bento: activeTheme.shadows.bento,
    clayRaised: activeTheme.shadows.clayRaised,
    clayPressed: activeTheme.shadows.clayPressed,
    glass: activeTheme.shadows.glass,
    glow: activeTheme.shadows.glow,
    neonSoft: activeTheme.shadows.glass,
    neonStrong: activeTheme.shadows.glow,
  },
} as const;

export type V2Tokens = typeof v2Tokens;
