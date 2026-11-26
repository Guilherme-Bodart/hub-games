import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import {
  CandidateSubmission,
  FlagPlayer,
} from '@/src/features/games/red-green-flag/hooks/useRedGreenFlagGame';
import { redGreenFlagStyles as styles } from '@/src/features/games/red-green-flag/styles/redGreenFlagStyles';
import { ELEVATION_STYLES, getGameAccent, useTheme } from '@/src/theme';
import { AvatarSprite, Badge, Card } from '@/src/ui/atoms';

type FlagResultCardProps = {
  singlePlayer: FlagPlayer;
  winningSubmission: CandidateSubmission;
  isPt: boolean;
};

export function FlagResultCard({
  singlePlayer,
  winningSubmission,
  isPt,
}: FlagResultCardProps) {
  const { theme } = useTheme();
  const accent = getGameAccent('red-green-flag');
  const greenColor = accent.primary;
  const greenTint = accent.tint;
  const redColor = accent.secondary ?? '#F43F5E';
  const redTint = accent.secondaryTint ?? '#FFF1F2';

  return (
    <Card
      title={isPt ? 'Deu Match!' : "It's a Match!"}
      subtitle={
        isPt
          ? `${singlePlayer.name} escolheu o pretendente criado por ${winningSubmission.cupidName}!`
          : `${singlePlayer.name} picked the candidate created by ${winningSubmission.cupidName}!`
      }>
      <View
        style={[
          styles.resultHeroCard,
          ELEVATION_STYLES.hero,
          {
            backgroundColor: theme.semantic.bg.surface,
            borderColor: greenColor,
          },
        ]}>
        <Badge label={isPt ? 'MATCH OFICIAL' : 'OFFICIAL MATCH'} variant="success" />

        <View style={styles.matchAvatarsRow}>
          <AvatarSprite avatarId={singlePlayer.avatarId} size={58} />
          <View
            style={[
              styles.matchHeartBadge,
              { backgroundColor: redTint, borderColor: redColor },
            ]}>
            <SymbolView
              name={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }}
              size={18}
              tintColor={redColor}
            />
          </View>
          <AvatarSprite avatarId={winningSubmission.cupidAvatarId} size={58} />
        </View>

        <Text
          style={[
            styles.winnerCupidName,
            {
              color: theme.semantic.text.primary,
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {isPt
            ? `Cupido Vencedor: ${winningSubmission.cupidName}`
            : `Winning Cupid: ${winningSubmission.cupidName}`}
        </Text>

        <View style={styles.resultFlagsWrap}>
          <View
            style={[
              styles.pitchFlagBox,
              { backgroundColor: greenTint, borderColor: '#A7F3D0' },
            ]}>
            <Badge label="GREEN FLAG" variant="success" />
            <Text style={[styles.pitchFlagText, { color: theme.semantic.text.primary }]}>
              {winningSubmission.greenFlag}
            </Text>
          </View>

          <View
            style={[
              styles.pitchFlagBox,
              { backgroundColor: redTint, borderColor: '#FECDD3' },
            ]}>
            <Badge label="RED FLAG" variant="error" />
            <Text style={[styles.pitchFlagText, { color: theme.semantic.text.primary }]}>
              {winningSubmission.redFlag}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}
