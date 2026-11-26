import { Pressable, Text, View } from 'react-native';

import { impostorPhaseStyles as styles } from '@/src/features/games/impostor/styles/impostorPhaseStyles';
import { ImpostorRound } from '@/src/features/games/impostor/types';
import { ELEVATION_STYLES, getGameAccent } from '@/src/theme';
import { ThemeTokens } from '@/src/theme/types';
import { AvatarSprite, Button } from '@/src/ui/atoms';

type VotingPhaseProps = {
  round: ImpostorRound;
  copy: Record<string, string>;
  isPt: boolean;
  theme: ThemeTokens;
  activeVotingPlayerId: string | null;
  localVotingPlayers: ImpostorRound['players'];
  localVotesSubmittedCount: number;
  activeVotingSelection: string[];
  isVoteSelectionLocked: boolean;
  votingRevealDone: boolean;
  voteCellWidth: any;
  allLocalVotingSubmitted: boolean;
  onToggleSuspect: (playerId: string) => void;
  onUnlockVote: () => void;
  onConfirmVote: () => void;
  isConfirmDisabled: boolean;
};

export function ImpostorVotingPhase({
  round,
  copy,
  isPt,
  theme,
  activeVotingPlayerId,
  localVotingPlayers,
  localVotesSubmittedCount,
  activeVotingSelection,
  isVoteSelectionLocked,
  votingRevealDone,
  voteCellWidth,
  allLocalVotingSubmitted,
  onToggleSuspect,
  onUnlockVote,
  onConfirmVote,
  isConfirmDisabled,
}: VotingPhaseProps) {
  const accent = getGameAccent('impostor-neon');
  const isBoardInteractive = Boolean(activeVotingPlayerId && votingRevealDone && !isVoteSelectionLocked);

  return (
    <View style={styles.voteStage}>
      {activeVotingPlayerId ? (
        <View
          style={[
            styles.activeVoterCard,
            ELEVATION_STYLES.card,
            {
              backgroundColor: theme.semantic.bg.surface,
              borderColor: theme.semantic.border.hairline,
            },
          ]}>
          <Text
            style={[
              styles.activeVoterLabel,
              {
                color: accent.primary,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {copy.turnOf}
          </Text>
          <Text
            style={[
              styles.activeVoterName,
              {
                color: theme.semantic.text.primary,
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
              },
            ]}>
            {round.players.find((player) => player.id === activeVotingPlayerId)?.name || '-'}
          </Text>
          <View style={styles.voteProgressDots}>
            {localVotingPlayers.map((player) => {
              const submitted = round.votingSubmittedPlayerIds.includes(player.id);
              const active = activeVotingPlayerId === player.id;
              return (
                <View
                  key={`vote-progress-${player.id}`}
                  style={[
                    styles.voteProgressDot,
                    {
                      borderColor: submitted
                        ? theme.semantic.status.success
                        : active
                          ? accent.primary
                          : theme.semantic.border.strong,
                      backgroundColor: submitted
                        ? theme.semantic.status.success
                        : active
                          ? accent.tint
                          : theme.semantic.bg.subtle,
                    },
                  ]}
                />
              );
            })}
          </View>
          <Text
            style={[
              styles.activeVoterMeta,
              {
                color: theme.semantic.text.secondary,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {`${localVotesSubmittedCount}/${localVotingPlayers.length} ${isPt ? 'votos locais' : 'local votes'}`}
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.voteBoardWrap,
          {
            borderColor: theme.semantic.border.hairline,
            backgroundColor: theme.semantic.bg.subtle,
          },
        ]}>
        <View style={styles.voteGrid}>
          {round.players.map((player) => {
            const selected = activeVotingSelection.includes(player.id);
            return (
              <View key={player.id} style={[styles.votePlayerCell, { width: voteCellWidth as any }]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${isPt ? 'Selecionar suspeito' : 'Select suspect'}: ${player.name}`}
                  accessibilityState={{
                    disabled: !isBoardInteractive,
                    selected,
                  }}
                  disabled={!isBoardInteractive}
                  onPress={() => onToggleSuspect(player.id)}
                  style={[
                    styles.votePlayerCard,
                    selected ? ELEVATION_STYLES.floating : ELEVATION_STYLES.card,
                    {
                      borderColor: selected ? accent.primary : theme.semantic.border.hairline,
                      backgroundColor: selected ? accent.tint : theme.semantic.bg.surface,
                      opacity: isBoardInteractive ? 1 : 0.45,
                    },
                  ]}>
                  <View style={styles.votePlayerRow}>
                    <AvatarSprite avatarId={player.avatarId} size={30} />
                    <View style={styles.votePlayerMeta}>
                      <Text
                        style={[
                          styles.votePlayerRole,
                          {
                            color: selected ? accent.primary : theme.semantic.text.muted,
                            fontFamily: theme.semantic.typography.bodyFamily,
                            fontWeight: theme.semantic.typography.bodyWeight,
                          },
                        ]}>
                        {selected ? (isPt ? 'Suspeito' : 'Suspect') : isPt ? 'Jogador' : 'Player'}
                      </Text>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[
                          styles.votePlayerName,
                          {
                            color: theme.semantic.text.primary,
                            fontFamily: theme.semantic.typography.titleFamily,
                            fontWeight: theme.semantic.typography.titleWeight,
                          },
                        ]}>
                        {player.name}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>

        {isVoteSelectionLocked ? (
          <View
            style={[
              styles.votePrivacyOverlay,
              {
                backgroundColor: theme.semantic.bg.surface,
                borderColor: theme.semantic.border.hairline,
              },
            ]}>
            <Text
              style={[
                styles.votePrivacyText,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {copy.votePrivacyHint}
            </Text>
            <Button
              label={copy.unlockVote}
              color={accent.primary}
              plinthColor={accent.plinth}
              onPress={onUnlockVote}
              size="lg"
            />
          </View>
        ) : null}
      </View>

      <Button
        label={
          activeVotingPlayerId
            ? isPt
              ? 'Confirmar voto'
              : 'Confirm vote'
            : isPt
              ? 'Aguardando votos locais'
              : 'Waiting for local votes'
        }
        color={accent.primary}
        plinthColor={accent.plinth}
        disabled={isConfirmDisabled}
        onPress={onConfirmVote}
        size="lg"
        style={styles.fullWidthButton}
      />

      {allLocalVotingSubmitted ? (
        <Text
          style={[
            styles.voteWaitingText,
            {
              color: theme.semantic.text.muted,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {isPt
            ? 'Votos locais enviados. Aguardando os outros aparelhos...'
            : 'Local votes sent. Waiting for the other devices...'}
        </Text>
      ) : null}
    </View>
  );
}
