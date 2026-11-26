import type { LobbyPlayer } from '@/src/features/lobby';

export type VisibleLobbyPlayer = {
  player: LobbyPlayer;
  isLocalDevice: boolean;
};

export type LobbyPanelCopy = {
  settingsTitle: string;
  roomMode: string;
  hybridMode: string;
  onlineOnlyMode: string;
  onlineOnlyBadge: string;
  onlineOnlyBlockedHint: string;
  localPassPhoneBadge: string;
  controlMode: string;
  hostOnly: string;
  collaborative: string;
  impostorMode: string;
  words: string;
  questions: string;
  roundPlayers: string;
  impostors: string;
  clueTimer: string;
  secondsShort: string;
  hostOnlyHint: string;
  waitingHostStart: string;
  countdownStarting: string;
  addPlayerLabel: string;
  backLabel: string;
  hostLabel: string;
  readyPill: string;
  tapReadyPill: string;
  waitingPill: string;
};
