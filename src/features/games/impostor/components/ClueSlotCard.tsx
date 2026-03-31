import { memo } from 'react';

import { ImpostorRound } from '@/src/features/games/impostor/types';
import { ThemeTokens } from '@/src/theme/types';
import { PlayerClueCard } from '@/src/features/games/impostor/components/PlayerClueCard';

type ClueSlotCardProps = {
  player: ImpostorRound['players'][number];
  clue?: string;
  isActive: boolean;
  previousClues: string[];
  typingLabel: string;
  waitingLabel: string;
  theme: ThemeTokens;
};

export const ClueSlotCard = memo(function ClueSlotCard({
  player,
  clue,
  isActive,
  previousClues,
  typingLabel,
  waitingLabel,
  theme,
}: ClueSlotCardProps) {
  const hasClue = Boolean(clue);

  return (
    <PlayerClueCard
      player={player}
      clue={clue}
      previousClues={previousClues}
      playerLabel="Player"
      statusLabel={hasClue ? 'Clue sent' : isActive ? 'Typing now' : 'Waiting turn'}
      emphasisLabel={hasClue ? clue ?? '' : isActive ? typingLabel : waitingLabel}
      historyLabel="Recent history"
      tone={hasClue ? 'submitted' : isActive ? 'typing' : 'waiting'}
      theme={theme}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.player.id === nextProps.player.id &&
    prevProps.player.name === nextProps.player.name &&
    prevProps.player.avatarId === nextProps.player.avatarId &&
    prevProps.clue === nextProps.clue &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.typingLabel === nextProps.typingLabel &&
    prevProps.waitingLabel === nextProps.waitingLabel &&
    prevProps.previousClues.length === nextProps.previousClues.length &&
    prevProps.previousClues.every((value, index) => value === nextProps.previousClues[index]) &&
    prevProps.theme === nextProps.theme
  );
});
