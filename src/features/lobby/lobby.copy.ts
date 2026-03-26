import type { Locale } from '@/src/i18n';
import type { LobbyPanelCopy } from '@/src/features/lobby/lobby.types';

export const buildLobbyPanelCopy = (locale: Locale): LobbyPanelCopy =>
  locale === 'pt'
    ? {
        settingsTitle: 'Configuracao da partida',
        controlMode: 'Controle de acoes',
        hostOnly: 'So host',
        collaborative: 'Colaborativo',
        impostorMode: 'Modalidade',
        words: 'Palavras',
        questions: 'Perguntas',
        roundPlayers: 'Limite de jogadores',
        impostors: 'Impostores',
        hostOnlyHint: 'Apenas o host pode alterar as configuracoes.',
        waitingHostStart: 'Aguardando host iniciar',
        countdownStarting: 'Partida iniciando em',
      }
    : {
        settingsTitle: 'Match settings',
        controlMode: 'Action control',
        hostOnly: 'Host only',
        collaborative: 'Collaborative',
        impostorMode: 'Mode',
        words: 'Words',
        questions: 'Questions',
        roundPlayers: 'Player limit',
        impostors: 'Impostors',
        hostOnlyHint: 'Only the host can change settings.',
        waitingHostStart: 'Waiting host to start',
        countdownStarting: 'Match starting in',
      };

export const getPlayersEmptyHint = (locale: Locale): string =>
  locale === 'pt'
    ? 'Nenhum jogador nesta sala ainda. Toque no card "+" para adicionar.'
    : 'No players in this room yet. Tap the "+" card to add one.';

export const getImpostorLobbyBadgeLabel = (locale: Locale, impostorCount: number): string =>
  locale === 'pt'
    ? `${impostorCount} impostor${impostorCount > 1 ? 'es' : ''}`
    : `${impostorCount} impostor${impostorCount > 1 ? 's' : ''}`;

export const getRoomCodeVisibilityLabels = (locale: Locale): {
  showLabel: string;
  hideLabel: string;
} => ({
  showLabel: locale === 'pt' ? 'Mostrar codigo da sala' : 'Show room code',
  hideLabel: locale === 'pt' ? 'Ocultar codigo da sala' : 'Hide room code',
});
