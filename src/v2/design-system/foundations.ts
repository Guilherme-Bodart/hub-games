import { HybridMotionScale, HybridRadiusScale, HybridSpacingScale, HybridTypographyScale } from '@/src/v2/design-system/types';

export const hybridSpacing: HybridSpacingScale = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const hybridRadius: HybridRadiusScale = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
  pill: 999,
};

export const hybridTypography: HybridTypographyScale = {
  hero: 34,
  title: 28,
  section: 20,
  body: 15,
  caption: 12,
  chip: 11,
  button: 15,
};

export const hybridMotion: HybridMotionScale = {
  instant: 110,
  fast: 170,
  normal: 230,
  slow: 320,
};
