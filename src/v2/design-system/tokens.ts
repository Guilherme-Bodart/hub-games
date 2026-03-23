export const v2Tokens = {
  colors: {
    background: '#0D0A17',
    surface: 'rgba(26, 21, 41, 0.82)',
    surfaceStrong: '#221B36',
    border: 'rgba(130, 104, 204, 0.42)',
    borderStrong: 'rgba(184, 136, 255, 0.72)',
    textPrimary: '#F3F1FF',
    textSecondary: '#B8B1CF',
    textMuted: '#8E86A9',
    neonPrimary: '#C084FC',
    neonSecondary: '#22D3EE',
    neonAccent: '#F472B6',
    success: '#10D9B5',
    warning: '#F6C945',
    danger: '#FF4D7A',
    overlay: 'rgba(8, 6, 14, 0.68)',
  },
  radius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    pill: 999,
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  typography: {
    hero: 42,
    title: 30,
    subtitle: 15,
    body: 13,
    caption: 11,
    button: 15,
  },
  shadows: {
    neonSoft: {
      shadowOpacity: 0.32,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 0 },
      elevation: 7,
    },
    neonStrong: {
      shadowOpacity: 0.6,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 0 },
      elevation: 12,
    },
  },
} as const;

export type V2Tokens = typeof v2Tokens;
