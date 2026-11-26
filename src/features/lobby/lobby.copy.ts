import type { Locale } from '@/src/i18n';
import type { LobbyPanelCopy } from '@/src/features/lobby/lobby.types';

export const buildLobbyPanelCopy = (locale: Locale): LobbyPanelCopy =>
  locale === 'pt'
    ? {
        settingsTitle: 'Configuração da partida',
        roomMode: 'Modo da sala',
        hybridMode: 'Híbrido (permite locais)',
        onlineOnlyMode: 'Apenas Online (1 por celular)',
        onlineOnlyBadge: 'Apenas Online · 1 por celular',
        onlineOnlyBlockedHint: 'Remova jogadores extras locais antes de ativar Apenas Online',
        localPassPhoneBadge: 'Jogo local / passa o celular',
        controlMode: 'Controle de ações',
        hostOnly: 'Só host',
        collaborative: 'Colaborativo',
        impostorMode: 'Modalidade',
        words: 'Palavras',
        questions: 'Perguntas',
        roundPlayers: 'Limite de jogadores',
        impostors: 'Impostores',
        clueTimer: 'Tempo da pista',
        secondsShort: 's',
        hostOnlyHint: 'Apenas o host pode alterar as configurações.',
        waitingHostStart: 'Aguardando o host iniciar',
        countdownStarting: 'Partida iniciando em',
        addPlayerLabel: '+ Adicionar jogador',
        backLabel: 'Voltar',
        hostLabel: 'Host',
        readyPill: 'Pronto',
        tapReadyPill: 'Toque p/ pronto',
        waitingPill: 'Aguardando',
      }
    : {
        settingsTitle: 'Match settings',
        roomMode: 'Room mode',
        hybridMode: 'Hybrid (allows local)',
        onlineOnlyMode: 'Online Only (1 per phone)',
        onlineOnlyBadge: 'Online Only · 1 per phone',
        onlineOnlyBlockedHint: 'Remove extra local players before enabling Online Only',
        localPassPhoneBadge: 'Local / pass-the-phone game',
        controlMode: 'Action control',
        hostOnly: 'Host only',
        collaborative: 'Collaborative',
        impostorMode: 'Mode',
        words: 'Words',
        questions: 'Questions',
        roundPlayers: 'Player limit',
        impostors: 'Impostors',
        clueTimer: 'Clue timer',
        secondsShort: 's',
        hostOnlyHint: 'Only the host can change settings.',
        waitingHostStart: 'Waiting for the host to start',
        countdownStarting: 'Match starting in',
        addPlayerLabel: '+ Add player',
        backLabel: 'Back',
        hostLabel: 'Host',
        readyPill: 'Ready',
        tapReadyPill: 'Tap when ready',
        waitingPill: 'Waiting',
      };

export const getPlayersEmptyHint = (locale: Locale): string =>
  locale === 'pt'
    ? 'Nenhum jogador nesta sala ainda. Toque em "+ Adicionar jogador" para começar.'
    : 'No players in this room yet. Tap "+ Add player" to get started.';

export const getImpostorLobbyBadgeLabel = (locale: Locale, impostorCount: number): string =>
  locale === 'pt'
    ? `${impostorCount} impostor${impostorCount > 1 ? 'es' : ''}`
    : `${impostorCount} impostor${impostorCount > 1 ? 's' : ''}`;

export const getRoomCodeVisibilityLabels = (
  locale: Locale
): {
  showLabel: string;
  hideLabel: string;
} => ({
  showLabel: locale === 'pt' ? 'Mostrar código da sala' : 'Show room code',
  hideLabel: locale === 'pt' ? 'Ocultar código da sala' : 'Hide room code',
});
