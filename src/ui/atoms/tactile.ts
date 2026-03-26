import { ViewStyle } from 'react-native';

import { ThemeTokens } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';

export const tactileGlossColors = ['rgba(255,255,255,0.24)', 'rgba(255,255,255,0.03)'] as const;

export const tactileShadowStyle: ViewStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.14,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
};

type IconButtonTone = 'neutral' | 'primary' | 'secondary';

export const resolveIconButtonTone = (theme: ThemeTokens, tone: IconButtonTone) => {
  if (tone === 'primary') {
    return {
      backgroundColor: theme.semantic.button.primary.bg,
      borderColor: withAlpha('#000000', 0.14),
      iconColor: theme.semantic.button.primary.text,
    };
  }

  if (tone === 'secondary') {
    return {
      backgroundColor: theme.semantic.button.secondary.bg,
      borderColor: withAlpha('#000000', 0.12),
      iconColor: theme.semantic.button.secondary.text,
    };
  }

  return {
    backgroundColor: '#FFFFFF',
    borderColor: withAlpha('#000000', 0.14),
    iconColor: theme.semantic.text.primary,
  };
};

