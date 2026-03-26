import type { LobbyPlayer } from '@/src/features/lobby';

export type VisibleLobbyPlayer = {
  player: LobbyPlayer;
  isLocalDevice: boolean;
};

export type LobbyPanelCopy = {
  settingsTitle: string;
  controlMode: string;
  hostOnly: string;
  collaborative: string;
  impostorMode: string;
  words: string;
  questions: string;
  roundPlayers: string;
  impostors: string;
  hostOnlyHint: string;
  waitingHostStart: string;
  countdownStarting: string;
};
