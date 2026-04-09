import { Pressable, Text, View } from 'react-native';

import { ImpostorRound } from '@/src/features/games/impostor/types';
import { impostorPhaseStyles as styles } from '@/src/features/games/impostor/styles/impostorPhaseStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
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
  return (
    <View style={styles.voteStage}>
      {activeVotingPlayerId ? (
        <View style={styles.activeVoterCard}>
          <Text style={[styles.activeVoterLabel, { color: theme.semantic.text.secondary }]}>{copy.turnOf}</Text>
          <Text style={[styles.activeVoterName, { color: theme.semantic.text.primary }]}>
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
                          ? theme.semantic.button.primary.bg
                          : theme.semantic.border.subtle,
                      backgroundColor: submitted
                        ? `${theme.semantic.status.success}d0`
                        : active
                          ? `${theme.semantic.button.primary.bg}2b`
                          : 'transparent',
                    },
                  ]}
                />
              );
            })}
          </View>
          <Text style={{ color: theme.semantic.text.secondary, fontSize: 12 }}>
            {`${localVotesSubmittedCount}/${localVotingPlayers.length} ${isPt ? 'votos locais' : 'local votes'}`}
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.voteBoardWrap,
          {
            borderColor: withAlpha(theme.semantic.button.primary.bg, 0.35),
            backgroundColor: withAlpha(theme.semantic.bg.elevated, 0.7),
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
                    disabled: !activeVotingPlayerId || !votingRevealDone || isVoteSelectionLocked,
                    selected,
                  }}
                  disabled={!activeVotingPlayerId || !votingRevealDone || isVoteSelectionLocked}
                  onPress={() => onToggleSuspect(player.id)}
                  style={[
                    styles.playerCard,
                    styles.votePlayerCard,
                    selected ? styles.voteSelectedCard : null,
                    {
                      borderColor: selected ? theme.semantic.button.primary.bg : theme.semantic.border.subtle,
                      borderWidth: selected ? 1.8 : 1.25,
                      backgroundColor: theme.semantic.bg.surface,
                      shadowColor: theme.semantic.shadow.base,
                      transform: [{ scale: selected ? 1.04 : 1 }],
                      opacity: activeVotingPlayerId && votingRevealDone && !isVoteSelectionLocked ? 1 : 0.45,
                    },
                  ]}>
                  <View style={styles.votePlayerRow}>
                    <AvatarSprite avatarId={player.avatarId} size={28} />
                    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                      <Text
                        style={[
                          styles.votePlayerRole,
                          {
                            color: selected ? theme.semantic.button.primary.bg : theme.semantic.text.muted,
                          },
                        ]}>
                        {selected ? (isPt ? 'Suspeito' : 'Selected') : isPt ? 'Jogador' : 'Player'}
                      </Text>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.votePlayerName, { color: theme.semantic.text.primary }]}>
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
                backgroundColor: withAlpha(theme.semantic.bg.app, 0.84),
                borderColor: theme.semantic.border.subtle,
              },
            ]}>
            <Text style={[styles.votePrivacyText, { color: theme.semantic.text.secondary }]}>{copy.votePrivacyHint}</Text>
            <Button label={copy.unlockVote} onPress={onUnlockVote} />
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
        disabled={isConfirmDisabled}
        onPress={onConfirmVote}
      />
      {allLocalVotingSubmitted ? (
        <Text style={{ color: theme.semantic.text.muted }}>
          {isPt
            ? 'Votos locais enviados. Aguardando outros jogadores...'
            : 'Local votes sent. Waiting for other players...'}
        </Text>
      ) : null}
    </View>
  );
}

