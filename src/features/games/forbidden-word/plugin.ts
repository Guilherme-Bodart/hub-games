import { GAME_COVER_ASSETS } from '@/src/features/games/gameCoverAssets';
import { GamePlugin } from '@/src/features/games/types';
import { ForbiddenWordScreen } from '@/src/features/games/forbidden-word/ForbiddenWordScreen';

export const forbiddenWordPlugin: GamePlugin = {
  manifest: {
    id: 'forbidden-word',
    coverGlyph: 'TAB',
    coverTone: '#F29F4B',
    coverImage: GAME_COVER_ASSETS.FORBIDDEN_WORD,
    title: { pt: 'Palavra Proibida', en: 'Forbidden Word' },
    subtitle: {
      pt: 'Faça seu grupo adivinhar a palavra em 45s sem falar nenhuma das 4 palavras proibidas!',
      en: 'Make your group guess the word in 45s without saying any of the 4 forbidden words!',
    },
    players: { min: 2, max: 12 },
    mode: 'local',
    status: 'ready',
    requiresVoice: true,
  },
  Screen: ForbiddenWordScreen,
};
