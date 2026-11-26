import { GAME_COVER_ASSETS } from '@/src/features/games/gameCoverAssets';
import { GamePlugin } from '@/src/features/games/types';
import { DrawPassScreen } from '@/src/features/games/draw-pass/screens/DrawPassScreen';

export const drawPassPlugin: GamePlugin = {
  manifest: {
    id: 'draw-pass',
    coverGlyph: 'DRW',
    coverTone: '#0EA5E9',
    coverImage: GAME_COVER_ASSETS.DRAW_PASS,
    title: { pt: 'Desenha e Passa', en: 'Draw & Pass' },
    subtitle: {
      pt: 'Telefone sem fio visual: desenhe, passe o celular e veja a frase virar um caos.',
      en: 'Visual broken telephone: draw, pass the phone, and watch the prompt go off the rails.',
    },
    players: { min: 2, max: 12 },
    mode: 'local',
    status: 'ready',
    requiresVoice: false,
  },
  Screen: DrawPassScreen,
};
