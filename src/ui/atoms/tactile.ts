import { ViewStyle } from 'react-native';

import { ThemeTokens } from '@/src/theme';

export const tactileGlossColors = ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.02)'] as const;

export const tactileShadowStyle: ViewStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.14,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
};

type IconButtonTone = 'neutral' | 'primary' | 'secondary';

export const resolveIconButtonTone = (theme: ThemeTokens, tone: IconButtonTone) => {
  if (tone === 'primary') {
    return {
      backgroundColor: 'rgba(255,255,255,0.98)',
      borderColor: 'rgba(183,191,208,0.9)',
      iconColor: theme.semantic.button.primary.text,
    };
  }

  if (tone === 'secondary') {
    return {
      backgroundColor: 'rgba(255,255,255,0.98)',
      borderColor: 'rgba(183,191,208,0.9)',
      iconColor: theme.semantic.button.accent.bg,
    };
  }

  return {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderColor: 'rgba(183,191,208,0.9)',
    iconColor: '#2B2A46',
  };
};
