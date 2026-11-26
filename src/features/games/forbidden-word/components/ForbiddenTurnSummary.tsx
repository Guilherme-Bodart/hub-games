import { Text, View } from 'react-native';

import { ForbiddenPlayer } from '@/src/features/games/forbidden-word/hooks/useForbiddenWordGame';
import { forbiddenWordStyles as styles } from '@/src/features/games/forbidden-word/styles/forbiddenWordStyles';
import { ELEVATION_STYLES, getGameAccent, useTheme } from '@/src/theme';
import { AvatarSprite, Badge } from '@/src/ui/atoms';

type ForbiddenTurnSummaryProps = {
  speaker: ForbiddenPlayer;
  turnHits: number;
  turnBuzzes: number;
  isPt: boolean;
};

export function ForbiddenTurnSummary({
  speaker,
  turnHits,
  turnBuzzes,
  isPt,
}: ForbiddenTurnSummaryProps) {
  const { theme } = useTheme();
  const accent = getGameAccent('forbidden-word');

  return (
    <View
      style={[
        styles.summaryCard,
        ELEVATION_STYLES.card,
        {
          backgroundColor: theme.semantic.bg.surface,
          borderColor: accent.primary,
        },
      ]}>
      <Badge label={isPt ? 'Tempo Esgotado' : "Time's Up"} variant="warning" />
      <AvatarSprite avatarId={speaker.avatarId} size={56} />
      <Text
        style={[
          styles.summaryTitle,
          {
            color: theme.semantic.text.primary,
            fontFamily: theme.semantic.typography.titleFamily,
            fontWeight: theme.semantic.typography.titleWeight,
          },
        ]}>
        {isPt ? `Fim do turno de ${speaker.name}!` : `${speaker.name}'s turn ended!`}
      </Text>

      <View style={styles.summaryStatsRow}>
        <View
          style={[
            styles.summaryStatTile,
            { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
          ]}>
          <Text
            style={[
              styles.summaryStatValue,
              {
                color: theme.semantic.status.success,
                fontFamily: theme.semantic.typography.numberFamily,
                fontWeight: theme.semantic.typography.numberWeight,
              },
            ]}>
            +{turnHits}
          </Text>
          <Text
            style={[
              styles.summaryStatLabel,
              {
                color: theme.semantic.status.success,
                fontFamily: theme.semantic.typography.titleFamily,
              },
            ]}>
            {isPt ? 'Acertos' : 'Hits'}
          </Text>
        </View>

        <View
          style={[
            styles.summaryStatTile,
            { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' },
          ]}>
          <Text
            style={[
              styles.summaryStatValue,
              {
                color: theme.semantic.status.error,
                fontFamily: theme.semantic.typography.numberFamily,
                fontWeight: theme.semantic.typography.numberWeight,
              },
            ]}>
            {turnBuzzes}
          </Text>
          <Text
            style={[
              styles.summaryStatLabel,
              {
                color: theme.semantic.status.error,
                fontFamily: theme.semantic.typography.titleFamily,
              },
            ]}>
            {isPt ? 'Buzinas' : 'Buzzes'}
          </Text>
        </View>
      </View>
    </View>
  );
}
