export type ImpostorPromptMode = 'words' | 'questions';
export type ImpostorPhase =
  | 'reveal'
  | 'clues'
  | 'roundDecision'
  | 'voting'
  | 'guessing'
  | 'result';
export type ImpostorWinner = 'civilians' | 'impostors';
export type ImpostorRoundDecision = 'continue-clues' | 'vote-suspect';

export type ImpostorRoundPlayer = {
  id: string;
  name: string;
  avatarId: number;
  isHost: boolean;
  isLocalDevice: boolean;
  deviceId: string;
  isImpostor: boolean;
};

export type ImpostorRoundResult = {
  winner: ImpostorWinner;
  reason: string;
};

export type ImpostorRound = {
  id: string;
  mode: ImpostorPromptMode;
  theme: string;
  civilPrompt: string;
  impostorPrompt: string;
  players: ImpostorRoundPlayer[];
  impostorCount: number;
  phase: ImpostorPhase;
  activeTurnIndex: number;
  clues: Record<string, string>;
  clueHistoryByPlayer: Record<string, string[]>;
  usedClueTokens: string[];
  clueCycle: number;
  decisionVotes: Record<string, ImpostorRoundDecision>;
  votingSelectionsByPlayer: Record<string, string[]>;
  votingSubmittedPlayerIds: string[];
  votingTallies: Record<string, number>;
  selectedSuspectIds: string[];
  caughtImpostorIds: string[];
  impostorGuesses: Record<string, string>;
  result: ImpostorRoundResult | null;
};
