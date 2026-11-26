import { Text, View } from 'react-native';

import { impostorPhaseStyles as styles } from '@/src/features/games/impostor/styles/impostorPhaseStyles';
import { ImpostorRound } from '@/src/features/games/impostor/types';
import { ELEVATION_STYLES, getGameAccent } from '@/src/theme';
import { ThemeTokens } from '@/src/theme/types';
import { AvatarSprite, Button, Input } from '@/src/ui/atoms';

type VotingTally = {
  playerId: string;
  name: string;
  votes: number;
};

type GuessingPhaseCopy = {
  guessing: string;
  guessingStageTitle: string;
  guessingStageHint: string;
  guessInput: string;
  submitGuess: string;
};

type ImpostorGuessingPhaseProps = {
  round: ImpostorRound;
  localPlayerIds: Set<string>;
  hasVotingTallies: boolean;
  votingTallies: VotingTally[];
  guessDrafts: Record<string, string>;
  theme: ThemeTokens;
  copy: GuessingPhaseCopy;
  isPt: boolean;
  onGuessDraftChange: (impostorId: string, value: string) => void;
  onSubmitGuess: (impostorId: string) => void;
};

export function ImpostorGuessingPhase({
  round,
  localPlayerIds,
  hasVotingTallies,
  votingTallies,
  guessDrafts,
  theme,
  copy,
  isPt,
  onGuessDraftChange,
  onSubmitGuess,
}: ImpostorGuessingPhaseProps) {
  const accent = getGameAccent('impostor-neon');

  return (
    <View style={styles.guessStage}>
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
            {copy.guessing}
          </Text>
        </View>
        <Text
          style={[
            styles.stageTitle,
            {
              color: theme.semantic.text.primary,
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {copy.guessingStageTitle}
        </Text>
        <Text
          style={[
            styles.stageHint,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {copy.guessingStageHint}
        </Text>
      </View>

      {hasVotingTallies ? (
        <View
          style={[
            styles.voteSummary,
            ELEVATION_STYLES.card,
            {
              borderColor: theme.semantic.border.hairline,
              backgroundColor: theme.semantic.bg.surface,
            },
          ]}>
          <Text
            style={[
              styles.voteSummaryTitle,
              {
                color: theme.semantic.text.muted,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {isPt ? 'Mais votados na rodada' : 'Most voted this round'}
          </Text>
          {votingTallies.slice(0, 3).map((entry) => (
            <View key={`guess-tally-${entry.playerId}`} style={styles.voteSummaryRow}>
              <Text
                style={[
                  styles.voteSummaryName,
                  {
                    color: theme.semantic.text.primary,
                    fontFamily: theme.semantic.typography.titleFamily,
                    fontWeight: theme.semantic.typography.titleWeight,
                  },
                ]}>
                {entry.name}
              </Text>
              <Text
                style={[
                  styles.voteSummaryCount,
                  {
                    color: accent.primary,
                    fontFamily: theme.semantic.typography.numberFamily,
                    fontWeight: theme.semantic.typography.numberWeight,
                  },
                ]}>
                {`${entry.votes} ${isPt ? 'votos' : 'votes'}`}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {round.caughtImpostorIds.map((impostorId) => {
        const impostor = round.players.find((player) => player.id === impostorId);
        if (!impostor) {
          return null;
        }

        const canEdit = localPlayerIds.has(impostorId) && !round.impostorGuesses[impostorId];
        const submittedGuess = round.impostorGuesses[impostorId];

        return (
          <View
            key={impostorId}
            style={[
              styles.guessCard,
              ELEVATION_STYLES.card,
              {
                borderColor: accent.primary,
                backgroundColor: theme.semantic.bg.surface,
              },
            ]}>
            <View style={styles.guessCardHeader}>
              <AvatarSprite avatarId={impostor.avatarId} size={32} />
              <Text
                numberOfLines={1}
                style={[
                  styles.guessCardTitle,
                  {
                    color: theme.semantic.text.primary,
                    fontFamily: theme.semantic.typography.titleFamily,
                    fontWeight: theme.semantic.typography.titleWeight,
                  },
                ]}>
                {impostor.name}
              </Text>
            </View>
            <Text
              style={[
                styles.guessCardHint,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {canEdit
                ? isPt
                  ? 'Digite a palavra exata dos civis para tentar roubar a rodada.'
                  : 'Type the exact civilian word to try to steal the round.'
                : isPt
                  ? 'Aguardando o chute final deste impostor.'
                  : 'Waiting for this impostor final guess.'}
            </Text>

            {submittedGuess ? (
              <View
                style={[
                  styles.guessSubmittedBox,
                  {
                    backgroundColor: theme.semantic.bg.subtle,
                    borderColor: theme.semantic.border.hairline,
                  },
                ]}>
                <Text
                  style={[
                    styles.guessSubmittedText,
                    {
                      color: theme.semantic.text.primary,
                      fontFamily: theme.semantic.typography.titleFamily,
                      fontWeight: theme.semantic.typography.titleWeight,
                    },
                  ]}>
                  {submittedGuess}
                </Text>
              </View>
            ) : (
              <>
                <Input
                  value={guessDrafts[impostorId] || ''}
                  onChangeText={(value) => onGuessDraftChange(impostorId, value)}
                  placeholder={copy.guessInput}
                  disabled={!canEdit}
                  style={styles.input}
                />
                <Button
                  label={copy.submitGuess}
                  color={accent.primary}
                  plinthColor={accent.plinth}
                  onPress={() => onSubmitGuess(impostorId)}
                  disabled={!canEdit || !guessDrafts[impostorId]?.trim()}
                  size="lg"
                  style={styles.fullWidthButton}
                />
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}
