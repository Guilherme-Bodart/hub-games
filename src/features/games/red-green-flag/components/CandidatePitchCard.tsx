import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { CandidateSubmission } from '@/src/features/games/red-green-flag/hooks/useRedGreenFlagGame';
import { redGreenFlagStyles as styles } from '@/src/features/games/red-green-flag/styles/redGreenFlagStyles';
import { ELEVATION_STYLES, getGameAccent, useTheme } from '@/src/theme';
import { Badge, Card } from '@/src/ui/atoms';

type CandidatePitchCardProps = {
  submissions: CandidateSubmission[];
  singleName: string;
  winningCupidId: string | null;
  isPt: boolean;
  onSelectWinner: (cupidId: string) => void;
};

export function CandidatePitchCard({
  submissions,
  singleName,
  winningCupidId,
  isPt,
  onSelectWinner,
}: CandidatePitchCardProps) {
  const { theme } = useTheme();
  const accent = getGameAccent('red-green-flag');
  const greenColor = accent.primary;
  const greenTint = accent.tint;
  const redTint = accent.secondaryTint ?? '#FFF1F2';

  return (
    <Card
      title={isPt ? 'Pretendentes na Pista' : 'Candidates on the Floor'}
      subtitle={
        isPt
          ? `Cada Cupido defende seu combo em voz alta! Depois, ${singleName} toca no escolhido:`
          : `Each Cupid defends their combo out loud! Then ${singleName} taps the winner:`
      }>
      <View style={styles.cardsColumn}>
        {submissions.map((item, idx) => {
          const isSelected = winningCupidId === item.cupidId;
          return (
            <Pressable
              key={item.cupidId}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelectWinner(item.cupidId)}
              style={[
                styles.pitchCard,
                isSelected ? ELEVATION_STYLES.card : ELEVATION_STYLES.flat,
                {
                  backgroundColor: theme.semantic.bg.surface,
                  borderColor: isSelected ? greenColor : theme.semantic.border.hairline,
                },
              ]}>
              <View style={styles.pitchCardHeader}>
                <Text
                  style={[
                    styles.pitchTitle,
                    {
                      color: isSelected ? greenColor : theme.semantic.text.secondary,
                      fontFamily: theme.semantic.typography.titleFamily,
                    },
                  ]}>
                  {isPt ? `Pretendente #${idx + 1}` : `Candidate #${idx + 1}`}
                </Text>
                <View
                  style={[
                    styles.selectIndicator,
                    {
                      backgroundColor: isSelected ? greenColor : theme.semantic.bg.subtle,
                      borderColor: isSelected ? greenColor : theme.semantic.border.hairline,
                    },
                  ]}>
                  {isSelected ? (
                    <SymbolView
                      name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                      size={12}
                      tintColor="#FFFFFF"
                    />
                  ) : null}
                </View>
              </View>

              <View
                style={[
                  styles.pitchFlagBox,
                  { backgroundColor: greenTint, borderColor: '#A7F3D0' },
                ]}>
                <Badge label="GREEN FLAG" variant="success" />
                <Text style={[styles.pitchFlagText, { color: theme.semantic.text.primary }]}>
                  {item.greenFlag}
                </Text>
              </View>

              <View
                style={[
                  styles.pitchFlagBox,
                  { backgroundColor: redTint, borderColor: '#FECDD3' },
                ]}>
                <Badge label="RED FLAG" variant="error" />
                <Text style={[styles.pitchFlagText, { color: theme.semantic.text.primary }]}>
                  {item.redFlag}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
