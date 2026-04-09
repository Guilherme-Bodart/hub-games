import { GAME_COVER_ASSETS } from '@/src/features/games/gameCoverAssets';
import { GamePlugin } from '@/src/features/games/types';
import { ImpostorGameScreen } from '@/src/features/games/impostor/screens/ImpostorGameScreen';

export const impostorGamePlugin: GamePlugin = {
  manifest: {
    id: 'impostor-neon',
    coverGlyph: 'EYE',
    coverTone: '#281622',
    coverImage: GAME_COVER_ASSETS.IMPOSTOR,
    title: { pt: 'Impostor', en: 'Impostor' },
    subtitle: {
      pt: 'Blefe social rápido com rounds explosivos.',
      en: 'Fast social bluffing with explosive rounds.',
    },
    players: { min: 4, max: 12 },
    mode: 'both',
    status: 'ready',
    actionAuthorityRules: {
      roundControl: {
        defaultMode: 'host-only',
        allowHostOverride: true,
      },
    },
  },
  Screen: ImpostorGameScreen,
};
