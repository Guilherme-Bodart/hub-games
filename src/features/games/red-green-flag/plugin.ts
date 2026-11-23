import { GAME_COVER_ASSETS } from '@/src/features/games/gameCoverAssets';
import { GamePlugin } from '@/src/features/games/types';
import { RedGreenFlagScreen } from '@/src/features/games/red-green-flag/RedGreenFlagScreen';

export const redGreenFlagPlugin: GamePlugin = {
  manifest: {
    id: 'red-green-flag',
    coverGlyph: 'FLG',
    coverTone: '#D96B52',
    coverImage: GAME_COVER_ASSETS.RED_GREEN_FLAG,
    title: { pt: 'Red Flag / Green Flag', en: 'Red Flag / Green Flag' },
    subtitle: {
      pt: 'Monte pretendentes perfeitos com defeitos bizarros e convença o solteiro da vez.',
      en: 'Build perfect dates with chaotic red flags and pitch them to the single player.',
    },
    players: { min: 2, max: 10 },
    mode: 'both',
    status: 'ready',
    requiresVoice: true,
  },
  Screen: RedGreenFlagScreen,
};
