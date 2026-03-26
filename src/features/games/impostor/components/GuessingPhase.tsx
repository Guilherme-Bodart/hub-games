import { Text, View } from 'react-native';

import { ImpostorRound } from '@/src/features/games/impostor/types';
import { styles } from '@/src/features/games/impostor/styles/impostorStyles';
import { ThemeTokens } from '@/src/theme/types';
import { Button, Card, Input } from '@/src/ui/atoms';

type VotingTally = {
  playerId: string;
  name: string;
  votes: number;
};

type GuessingPhaseCopy = {
  guessing: string;
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
    <Card title={copy.guessing} subtitle={isPt ? 'Impostores pegos fazem o chute final.' : 'Caught impostors make final guess.'}>
      {hasVotingTallies ? (
        <View
          style={[
            styles.voteSummary,
            {
              borderColor: theme.semantic.border.subtle,
              backgroundColor: theme.semantic.bg.surface,
            },
          ]}>
          <Text style={{ color: theme.semantic.text.secondary, fontSize: 12 }}>
            {isPt ? 'Resultado da votacao' : 'Voting result'}
          </Text>
          {votingTallies.map((entry) => (
            <Text key={`guess-tally-${entry.playerId}`} style={{ color: theme.semantic.text.primary }}>
              {`${entry.name}: ${entry.votes}`}
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
          <View key={impostorId} style={{ gap: 6 }}>
            <Text style={{ color: theme.semantic.text.primary }}>{impostor.name}</Text>
            {round.impostorGuesses[impostorId] ? (
              <Text style={{ color: theme.semantic.text.secondary }}>{round.impostorGuesses[impostorId]}</Text>
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
                />
              </>
            )}
          </View>
        );
      })}
    </Card>
  );
}
