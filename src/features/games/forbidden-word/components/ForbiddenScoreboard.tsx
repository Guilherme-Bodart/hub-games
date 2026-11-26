import { Text, View } from 'react-native';

import { ForbiddenPlayer } from '@/src/features/games/forbidden-word/hooks/useForbiddenWordGame';
import { forbiddenWordStyles as styles } from '@/src/features/games/forbidden-word/styles/forbiddenWordStyles';
import { getGameAccent, useTheme } from '@/src/theme';
import { AvatarSprite, Badge, Card } from '@/src/ui/atoms';

type ForbiddenScoreboardProps = {
  players: ForbiddenPlayer[];
  activeSpeakerId?: string;
  scoresByPlayer: Record<string, number>;
  isPt: boolean;
};

export function ForbiddenScoreboard({
  players,
  activeSpeakerId,
  scoresByPlayer,
  isPt,
}: ForbiddenScoreboardProps) {
  const { theme } = useTheme();
  const accent = getGameAccent('forbidden-word');

  return (
    <Card
      title={isPt ? 'Placar da Rodada' : 'Round Scoreboard'}
      subtitle={
        isPt
          ? 'Quem fizer mais pontos explicando sem deslizar vence!'
          : 'Whoever scores the most points explaining without slipping wins!'
      }>
      <View style={styles.scoreboardList}>
        {players.map((player) => {
          const isCurrent = player.id === activeSpeakerId;
          const score = scoresByPlayer[player.id] ?? 0;

          return (
            <View
              key={player.id}
              style={[
                styles.scoreRow,
                {
                  borderColor: isCurrent ? accent.primary : theme.semantic.border.hairline,
                  backgroundColor: isCurrent ? accent.tint : theme.semantic.bg.subtle,
                },
              ]}>
              <AvatarSprite avatarId={player.avatarId} size={36} />
              <Text
                numberOfLines={1}
                style={[
                  styles.scorePlayerName,
                  {
                    color: theme.semantic.text.primary,
                    fontFamily: theme.semantic.typography.titleFamily,
                  },
                ]}>
                {player.name}
              </Text>
              {isCurrent ? <Badge label={isPt ? 'Da Vez' : 'Up Next'} variant="warning" /> : null}
              <View
                style={[
                  styles.scorePill,
                  {
                    backgroundColor: theme.semantic.bg.surface,
                    borderColor: theme.semantic.border.hairline,
                  },
                ]}>
                <Text
                  style={[
                    styles.scoreValue,
                    {
                      color: accent.primary,
                      fontFamily: theme.semantic.typography.numberFamily,
                      fontWeight: theme.semantic.typography.numberWeight,
                    },
                  ]}>
                  {score} pts
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
