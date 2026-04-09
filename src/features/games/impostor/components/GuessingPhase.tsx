import { Text, View } from 'react-native';

import { impostorPhaseStyles as styles } from '@/src/features/games/impostor/styles/impostorPhaseStyles';
import { ImpostorRound } from '@/src/features/games/impostor/types';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { Button, Input } from '@/src/ui/atoms';

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
  return (
    <View style={styles.guessStage}>
      <View
        style={[
          styles.guessStageHero,
          {
            backgroundColor: withAlpha('#FFFFFF', 0.94),
            borderColor: withAlpha(theme.semantic.status.error, 0.2),
          },
        ]}>
        <Text
          style={[
            styles.guessStageLabel,
            {
              color: theme.semantic.status.error,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {copy.guessing}
        </Text>
        <Text
          style={[
            styles.guessStageTitle,
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
            styles.guessStageHint,
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
            {
              borderColor: withAlpha(theme.semantic.border.subtle, 0.92),
              backgroundColor: withAlpha('#FFFFFF', 0.94),
            },
          ]}>
          <Text style={{ color: theme.semantic.text.secondary, fontSize: 12 }}>
            {isPt ? 'Mais votados na rodada' : 'Most voted this round'}
          </Text>
          {votingTallies.slice(0, 3).map((entry) => (
            <Text key={`guess-tally-${entry.playerId}`} style={{ color: theme.semantic.text.primary }}>
              {`${entry.name}: ${entry.votes} ${isPt ? 'votos' : 'votes'}`}
            </Text>
          ))}
        </View>
      ) : null}

      {round.caughtImpostorIds.map((impostorId) => {
        const impostor = round.players.find((player) => player.id === impostorId);
        if (!impostor) {
          return null;
        }

        const canEdit = localPlayerIds.has(impostorId) && !round.impostorGuesses[impostorId];

        return (
          <View
            key={impostorId}
            style={[
              styles.guessCard,
              {
                borderColor: withAlpha(theme.semantic.status.error, 0.18),
                backgroundColor: withAlpha('#FFFFFF', 0.95),
              },
            ]}>
            <Text
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
            <Text style={[styles.guessCardHint, { color: theme.semantic.text.secondary }]}>
              {canEdit
                ? isPt
                  ? 'Digite a palavra exata dos civis para tentar roubar a rodada.'
                  : 'Type the exact civilian word to try to steal the round.'
                : isPt
                  ? 'Aguardando o chute final deste impostor.'
                  : 'Waiting for this impostor final guess.'}
            </Text>

            {round.impostorGuesses[impostorId] ? (
              <Text style={{ color: theme.semantic.text.primary }}>{round.impostorGuesses[impostorId]}</Text>
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
                  onPress={() => onSubmitGuess(impostorId)}
                  disabled={!canEdit || !guessDrafts[impostorId]?.trim()}
                  size="lg"
                  style={{ width: '100%' }}
                />
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}
