import { Pressable, Text, View } from 'react-native';

import { ImpostorRound } from '@/src/features/games/impostor/types';
import { impostorPhaseStyles as styles } from '@/src/features/games/impostor/styles/impostorPhaseStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';

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
  isPt: boolean;
  theme: ThemeTokens;
  copy: RoundDecisionPhaseCopy;
  onVote: (playerId: string, vote: RoundDecisionVote) => void;
};

export function ImpostorRoundDecisionPhase({
  round,
  localPlayerIds,
  isPt,
  theme,
  copy,
  onVote,
}: ImpostorRoundDecisionPhaseProps) {
  return (
    <View style={styles.decisionStage}>
      <View style={{ gap: 10 }}>
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
                    borderColor: withAlpha(theme.semantic.border.subtle, 0.94),
                    backgroundColor: withAlpha('#FFFFFF', 0.94),
                  },
                ]}>
                <Text
                  style={{
                    color: theme.semantic.text.primary,
                    fontFamily: theme.semantic.typography.titleFamily,
                    fontWeight: theme.semantic.typography.titleWeight,
                    fontSize: 18,
                  }}>
                  {player.name}
                </Text>
                <View style={styles.decisionButtons}>
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
                            ? theme.semantic.status.info
                            : withAlpha(theme.semantic.border.subtle, 0.92),
                        backgroundColor:
                          currentVote === 'continue-clues'
                            ? withAlpha(theme.semantic.status.info, 0.94)
                            : withAlpha(theme.semantic.bg.elevated, 0.9),
                      },
                    ]}>
                    <Text
                      style={{
                        color:
                          currentVote === 'continue-clues'
                            ? '#FFFFFF'
                            : theme.semantic.text.secondary,
                        fontFamily: theme.semantic.typography.titleFamily,
                        fontWeight: theme.semantic.typography.titleWeight,
                        textTransform: 'uppercase',
                        letterSpacing: 0.7,
                      }}>
                      {copy.continueClues}
                    </Text>
                    <Text
                      style={[
                        styles.decisionButtonHint,
                        {
                          color:
                            currentVote === 'continue-clues'
                              ? withAlpha('#FFFFFF', 0.82)
                              : theme.semantic.text.muted,
                        },
                      ]}>
                      {isPt ? 'Voltar para mais uma rodada curta' : 'Go back for one more short round'}
                    </Text>
                  </Pressable>
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
                            ? theme.semantic.status.error
                            : withAlpha(theme.semantic.border.subtle, 0.92),
                        backgroundColor:
                          currentVote === 'vote-suspect'
                            ? withAlpha(theme.semantic.status.error, 0.94)
                            : withAlpha(theme.semantic.bg.surface, 0.94),
                      },
                    ]}>
                    <Text
                      style={{
                        color:
                          currentVote === 'vote-suspect'
                            ? '#FFFFFF'
                            : theme.semantic.text.secondary,
                        fontFamily: theme.semantic.typography.titleFamily,
                        fontWeight: theme.semantic.typography.titleWeight,
                        textTransform: 'uppercase',
                        letterSpacing: 0.7,
                      }}>
                      {copy.goSuspects}
                    </Text>
                    <Text
                      style={[
                        styles.decisionButtonHint,
                        {
                          color:
                            currentVote === 'vote-suspect'
                              ? withAlpha('#FFFFFF', 0.82)
                              : theme.semantic.text.muted,
                        },
                      ]}>
                      {isPt ? 'Avancar para a fase de suspeitos' : 'Advance to suspect voting'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
      </View>
    </View>
  );
}
