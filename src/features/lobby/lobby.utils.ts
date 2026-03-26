import type { Locale } from '@/src/i18n';
import { QUICK_PLAYER_NAMES_EN, QUICK_PLAYER_NAMES_PT } from '@/src/features/lobby/lobby.constants';

export const resolveNextAutoPlayerName = (locale: Locale, totalPlayers: number): string => {
  const pool = locale === 'pt' ? QUICK_PLAYER_NAMES_PT : QUICK_PLAYER_NAMES_EN;
  const base = pool[totalPlayers % pool.length] ?? (locale === 'pt' ? 'Jogador' : 'Player');
  const cycle = Math.floor(totalPlayers / pool.length) + 1;
  return cycle > 1 ? `${base} ${cycle}` : base;
};
