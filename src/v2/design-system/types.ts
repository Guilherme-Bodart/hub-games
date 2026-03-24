export type HybridStyleLayer = 'bento' | 'clay' | 'glass';

export type HybridThemeId = 'party' | 'sunset' | 'arcade';

export type HybridPalette = {
  appBg: string;
  appBgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderSoft: string;
  borderStrong: string;
  bentoCardBg: string;
  bentoCardBgAlt: string;
  clayPrimaryBg: string;
  clayPrimaryText: string;
  claySecondaryBg: string;
  claySecondaryText: string;
  clayDangerBg: string;
  clayDangerText: string;
  glassBg: string;
  glassBorder: string;
  accentTeal: string;
  accentPurple: string;
  accentCoral: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
};

export type HybridSpacingScale = {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};

export type HybridRadiusScale = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  pill: number;
};

export type HybridTypographyScale = {
  hero: number;
  title: number;
  section: number;
  body: number;
  caption: number;
  chip: number;
  button: number;
};

export type HybridMotionScale = {
  instant: number;
  fast: number;
  normal: number;
  slow: number;
};

export type HybridShadow = {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
};

export type HybridShadowSet = {
  bento: HybridShadow;
  clayRaised: HybridShadow;
  clayPressed: HybridShadow;
  glass: HybridShadow;
  glow: HybridShadow;
};

export type HybridThemeTokens = {
  id: HybridThemeId;
  name: string;
  palette: HybridPalette;
  spacing: HybridSpacingScale;
  radius: HybridRadiusScale;
  typography: HybridTypographyScale;
  motion: HybridMotionScale;
  shadows: HybridShadowSet;
};
