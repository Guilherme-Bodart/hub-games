import { ThemeTokens } from '@/src/theme/types';
import { GameTopBar } from '@/src/ui/atoms';

type ImpostorRoundHeaderPlayer = {
  id: string;
  avatarId: number;
};

type ImpostorRoundHeaderProps = {
  theme: ThemeTokens;
  title: string;
  roundLabel: string;
  players: ImpostorRoundHeaderPlayer[];
  playersCountLabel: string;
  onPressInfo: () => void;
  infoLabel: string;
};

export function ImpostorRoundHeader({
  title,
  roundLabel,
  playersCountLabel,
  onPressInfo,
  infoLabel,
}: ImpostorRoundHeaderProps) {
  return (
    <GameTopBar
      title={title}
      subtitle={playersCountLabel}
      showStatus
      statusTone="error"
      statusLabel={roundLabel}
      onPressRight={onPressInfo}
      rightLabel="?"
      rightAccessibilityLabel={infoLabel}
    />
  );
}
