import { RoomMode } from '@/src/features/lobby';

export type SintoniaPhase = 'secrets' | 'ordering' | 'revealing' | 'finished';

export type SintoniaPlayer = {
  id: string;
  name: string;
  avatarId: number;
  deviceId: string;
  isHost: boolean;
  isLocalDevice: boolean;
  secretNumber: number;
};

export type SintoniaRound = {
  id: string;
  theme: string;
  mode: RoomMode;
  players: SintoniaPlayer[];
  initialOrder: string[];
};

export type SintoniaRevealFeedback = 'hidden' | 'correct' | 'incorrect';

export type SintoniaRoundResult = 'pending' | 'success' | 'failure';

export type OrderingEvaluation = {
  isSuccess: boolean;
  firstFailureIndex: number | null;
};
