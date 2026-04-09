import {
  GAME_COVER_ASSETS,
  GAME_COVER_ASPECT_RATIOS,
} from '@/src/features/games/gameCoverAssets';
import { GamePlugin } from '@/src/features/games/types';
import { SintoniaGameScreen } from '@/src/features/games/sintonia/screens/SintoniaGameScreen';

export const sintoniaGamePlugin: GamePlugin = {
  manifest: {
    id: 'sintonia',
    coverGlyph: '01',
    coverTone: '#2A153A',
    coverImage: GAME_COVER_ASSETS.SINTONIA,
    coverAspectRatio: GAME_COVER_ASPECT_RATIOS.SINTONIA,
    title: { pt: 'Sintonia', en: 'Sync Match' },
    subtitle: {
      pt: 'Acerte o número escondido no embalo da galera.',
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
