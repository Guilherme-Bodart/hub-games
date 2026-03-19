import { GamePlugin } from '@/src/features/games/types';
import { ImpostorGameScreen } from '@/src/features/games/impostor/ImpostorGameScreen';

export const impostorGamePlugin: GamePlugin = {
  manifest: {
    id: 'impostor-neon',
    coverGlyph: 'EYE',
    coverTone: '#281622',
    title: { pt: 'Impostor Neon', en: 'Neon Impostor' },
    subtitle: {
      pt: 'Blefe social rapido com rounds explosivos.',
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

