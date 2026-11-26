import { Text, View } from 'react-native';

import { secretPhaseStyles as styles } from '@/src/features/games/sintonia/styles/secretPhaseStyles';
import { SintoniaPlayer } from '@/src/features/games/sintonia/types';
import { getGameAccent } from '@/src/theme';
import { ThemeTokens } from '@/src/theme/types';
import { AvatarSprite, Badge, GameTopBar } from '@/src/ui/atoms';

type SecretPhaseHeaderProps = {
  theme: ThemeTokens;
  title: string;
  roundLabel: string;
  players: SintoniaPlayer[];
  readyStatusLabel: string;
  onPressInfo: () => void;
  infoLabel: string;
  onPressBack?: () => void;
  backLabel?: string;
  statusTone?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
};

const MAX_VISIBLE_PLAYER_BUBBLES = 6;

export function SecretPhaseHeader({
  theme,
  title,
  roundLabel,
  players,
  readyStatusLabel,
  onPressInfo,
  infoLabel,
  onPressBack,
  backLabel,
  statusTone = 'success',
}: SecretPhaseHeaderProps) {
  const accent = getGameAccent('sintonia');
  const visiblePlayers = players.slice(0, MAX_VISIBLE_PLAYER_BUBBLES);
  const overflowCount = players.length - MAX_VISIBLE_PLAYER_BUBBLES;

  return (
    <View style={styles.headerWrap}>
      <GameTopBar
        title={title}
        subtitle={roundLabel}
        statusTone={statusTone}
        statusLabel={readyStatusLabel}
        onPressLeft={onPressBack}
        leftAccessibilityLabel={backLabel}
        onPressRight={onPressInfo}
        rightLabel="?"
        rightAccessibilityLabel={infoLabel}
      />

      {players.length > 0 ? (
        <View style={styles.rosterRow}>
          <View style={styles.playerStack}>
            {visiblePlayers.map((player) => (
              <View
                key={player.id}
                style={[
                  styles.playerBubble,
                  {
                    borderColor: player.isHost ? theme.semantic.status.warning : theme.semantic.border.hairline,
                    backgroundColor: theme.semantic.bg.surface,
                  },
                ]}>
                <AvatarSprite avatarId={player.avatarId} size={22} />
              </View>
            ))}

            {overflowCount > 0 ? (
              <View
                style={[
                  styles.playerBubble,
                  {
                    borderColor: theme.semantic.border.hairline,
                    backgroundColor: accent.tint,
                  },
                ]}>
                <Text
                  style={[
                    styles.plusBubbleLabel,
                    {
                      color: accent.primary,
                      fontFamily: theme.semantic.typography.numberFamily,
                      fontWeight: theme.semantic.typography.numberWeight,
                    },
                  ]}>
                  {`+${overflowCount}`}
                </Text>
              </View>
            ) : null}
          </View>

          <Badge label={roundLabel} variant="info" />
        </View>
      ) : null}
    </View>
  );
}
