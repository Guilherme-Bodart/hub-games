import { GamePlugin } from '@/src/features/games/types';
import { SintoniaGameScreen } from '@/src/features/games/sintonia/SintoniaGameScreen';

export const sintoniaGamePlugin: GamePlugin = {
  manifest: {
    id: 'sintonia',
    coverGlyph: '01',
    coverTone: '#2A153A',
    coverImage: require('../../../../assets/images/game_1.webp'),
    coverAspectRatio: 922 / 512,
    title: { pt: 'Sintonia', en: 'Sync Match' },
    subtitle: {
      pt: 'Acerte o n\u00FAmero escondido no embalo da galera.',
      en: 'Match the hidden number with your squad vibe.',
    },
    players: { min: 2, max: 10 },
    mode: 'both',
    status: 'ready',
    actionAuthorityRules: {
      ordering: {
        defaultMode: 'host-only',
        allowHostOverride: true,
      },
      revealing: {
        defaultMode: 'host-only',
        allowHostOverride: false,
      },
    },
  },
  Screen: SintoniaGameScreen,
};
