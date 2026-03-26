import { Pressable, Text, View } from 'react-native';

import { ImpostorRound } from '@/src/features/games/impostor/types';
import { styles } from '@/src/features/games/impostor/styles/impostorStyles';
import { ThemeTokens } from '@/src/theme/types';
import { Card } from '@/src/ui/atoms';

type RoundDecisionVote = 'vote-suspect' | 'continue-clues';

type RoundDecisionPhaseCopy = {
  roundDecision: string;
  roundDecisionHint: string;
  goSuspects: string;
  continueClues: string;
};

type ImpostorRoundDecisionPhaseProps = {
  round: ImpostorRound;
  localPlayerIds: Set<string>;
  theme: ThemeTokens;
  copy: RoundDecisionPhaseCopy;
  onVote: (playerId: string, vote: RoundDecisionVote) => void;
};

export function ImpostorRoundDecisionPhase({
  round,
  localPlayerIds,
  theme,
  copy,
  onVote,
}: ImpostorRoundDecisionPhaseProps) {
  return (
    <Card title={copy.roundDecision} subtitle={copy.roundDecisionHint}>
      <View style={{ gap: 8 }}>
        {round.players
          .filter((player) => localPlayerIds.has(player.id))
          .map((player) => {
            const currentVote = round.decisionVotes[player.id];

            return (
              <View
                key={`decision-${player.id}`}
                style={[
                  styles.decisionRow,
                  {
                    borderColor: theme.semantic.border.subtle,
                    backgroundColor: theme.semantic.bg.surface,
                  },
                ]}>
                <Text style={{ color: theme.semantic.text.primary }}>{player.name}</Text>
                <View style={styles.decisionButtons}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: currentVote === 'vote-suspect' }}
                    accessibilityLabel={`${player.name}. ${copy.goSuspects}`}
                    onPress={() => onVote(player.id, 'vote-suspect')}
                    style={[
                      styles.decisionButton,
                      {
                        borderColor:
                          currentVote === 'vote-suspect'
                            ? theme.semantic.button.accent.bg
                            : theme.semantic.border.subtle,
                        backgroundColor:
                          currentVote === 'vote-suspect'
                            ? theme.semantic.button.accent.bg
                            : theme.semantic.bg.elevated,
                      },
                    ]}>
                    <Text
                      style={{
                        color:
                          currentVote === 'vote-suspect'
                            ? theme.semantic.button.accent.text
                            : theme.semantic.text.secondary,
                      }}>
                      {copy.goSuspects}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: currentVote === 'continue-clues' }}
                    accessibilityLabel={`${player.name}. ${copy.continueClues}`}
                    onPress={() => onVote(player.id, 'continue-clues')}
                    style={[
                      styles.decisionButton,
                      {
                        borderColor:
                          currentVote === 'continue-clues'
                            ? theme.semantic.border.accent
                            : theme.semantic.border.subtle,
                        backgroundColor:
                          currentVote === 'continue-clues'
                            ? theme.semantic.bg.elevated
                            : theme.semantic.bg.surface,
                      },
                    ]}>
                    <Text
                      style={{
                        color:
                          currentVote === 'continue-clues'
                            ? theme.semantic.text.primary
                            : theme.semantic.text.secondary,
                      }}>
                      {copy.continueClues}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
      </View>
    </Card>
  );
}
