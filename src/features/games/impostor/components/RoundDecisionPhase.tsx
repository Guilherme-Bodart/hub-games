import { Pressable, Text, View } from 'react-native';

import { impostorPhaseStyles as styles } from '@/src/features/games/impostor/styles/impostorPhaseStyles';
import { ImpostorRound } from '@/src/features/games/impostor/types';
import { ELEVATION_STYLES, getGameAccent } from '@/src/theme';
import { ThemeTokens } from '@/src/theme/types';
import { AvatarSprite } from '@/src/ui/atoms';

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
  const accent = getGameAccent('impostor-neon');

  return (
    <View style={styles.decisionStage}>
      <View
        style={[
          styles.stageHero,
          ELEVATION_STYLES.card,
          {
            backgroundColor: theme.semantic.bg.surface,
            borderColor: theme.semantic.border.hairline,
          },
        ]}>
        <View
          style={[
            styles.stagePill,
            { backgroundColor: accent.tint, borderColor: accent.primary },
          ]}>
          <Text
            style={[
              styles.stagePillText,
              {
                color: accent.plinth,
                fontFamily: theme.semantic.typography.numberFamily,
                fontWeight: theme.semantic.typography.numberWeight,
              },
            ]}>
            {copy.roundDecision}
          </Text>
        </View>
        <Text
          style={[
            styles.stageHint,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {copy.roundDecisionHint}
        </Text>
      </View>

      <View style={styles.decisionList}>
        {round.players
          .filter((player) => localPlayerIds.has(player.id))
          .map((player) => {
            const currentVote = round.decisionVotes[player.id];
            const isContinue = currentVote === 'continue-clues';
            const isVoteSuspect = currentVote === 'vote-suspect';

            return (
              <View
                key={`decision-${player.id}`}
                style={[
                  styles.decisionRow,
                  ELEVATION_STYLES.card,
                  {
                    borderColor: theme.semantic.border.hairline,
                    backgroundColor: theme.semantic.bg.surface,
                  },
                ]}>
                <View style={styles.decisionPlayerHeader}>
                  <AvatarSprite avatarId={player.avatarId} size={32} />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.decisionPlayerName,
                      {
                        color: theme.semantic.text.primary,
                        fontFamily: theme.semantic.typography.titleFamily,
                        fontWeight: theme.semantic.typography.titleWeight,
                      },
                    ]}>
                    {player.name}
                  </Text>
                </View>

                <View style={styles.decisionButtons}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isContinue }}
                    accessibilityLabel={`${player.name}. ${copy.continueClues}`}
                    onPress={() => onVote(player.id, 'continue-clues')}
                    style={[
                      styles.decisionButton,
                      {
                        borderColor: isContinue
                          ? theme.semantic.status.info
                          : theme.semantic.border.hairline,
                        backgroundColor: isContinue
                          ? theme.semantic.status.info
                          : theme.semantic.bg.subtle,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.decisionButtonTitle,
                        {
                          color: isContinue ? '#FFFFFF' : theme.semantic.text.primary,
                          fontFamily: theme.semantic.typography.titleFamily,
                          fontWeight: theme.semantic.typography.titleWeight,
                        },
                      ]}>
                      {copy.continueClues}
                    </Text>
                    <Text
                      style={[
                        styles.decisionButtonHint,
                        {
                          color: isContinue ? '#FFFFFF' : theme.semantic.text.secondary,
                          fontFamily: theme.semantic.typography.bodyFamily,
                          fontWeight: theme.semantic.typography.bodyWeight,
                        },
                      ]}>
                      {isPt ? 'Continuar investigando' : 'Keep investigating'}
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isVoteSuspect }}
                    accessibilityLabel={`${player.name}. ${copy.goSuspects}`}
                    onPress={() => onVote(player.id, 'vote-suspect')}
                    style={[
                      styles.decisionButton,
                      {
                        borderColor: isVoteSuspect
                          ? accent.primary
                          : theme.semantic.border.hairline,
                        backgroundColor: isVoteSuspect
                          ? accent.primary
                          : theme.semantic.bg.subtle,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.decisionButtonTitle,
                        {
                          color: isVoteSuspect ? accent.textOnPrimary : theme.semantic.text.primary,
                          fontFamily: theme.semantic.typography.titleFamily,
                          fontWeight: theme.semantic.typography.titleWeight,
                        },
                      ]}>
                      {copy.goSuspects}
                    </Text>
                    <Text
                      style={[
                        styles.decisionButtonHint,
                        {
                          color: isVoteSuspect ? accent.textOnPrimary : theme.semantic.text.secondary,
                          fontFamily: theme.semantic.typography.bodyFamily,
                          fontWeight: theme.semantic.typography.bodyWeight,
                        },
                      ]}>
                      {isPt ? 'Avançar para a votação' : 'Move to voting'}
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
