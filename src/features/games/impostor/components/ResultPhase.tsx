import { Text, Pressable, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ImpostorRound } from '@/src/features/games/impostor/types';
import { styles } from '@/src/features/games/impostor/styles/impostorStyles';
import { ThemeTokens } from '@/src/theme/types';
import { AvatarSprite, Button, Card } from '@/src/ui/atoms';

type ImpostorResultCopy = {
  result: string;
  skipSuspense: string;
  suspense: string;
  defeatBanner: string;
  victoryBanner: string;
  winnerI: string;
  winnerC: string;
  impostorRevealSingle: string;
  impostorRevealMulti: string;
  revealBlockTitle: string;
  civilWord: string;
  impostorSecret: string;
  voteMapTitle: string;
  votesCount: string;
  newRound: string;
  back: string;
};

type VoteBreakdownEntry = {
  suspect: {
    id: string;
    name: string;
    avatarId: number;
  };
  voteCount: number;
  voters: Array<{
    id: string;
    avatarId: number;
  }>;
};

type ImpostorResultPhaseProps = {
  round: ImpostorRound;
  copy: ImpostorResultCopy;
  isPt: boolean;
  theme: ThemeTokens;
  resultStage: number;
  resultActionsAt: number;
  revealResultBlockAt: number;
  votingResultBlockAt: number;
  bannerWinnerIsImpostor: boolean;
  resultShouldShowQuestionBlock: boolean;
  hasVotingTallies: boolean;
  voteBreakdown: VoteBreakdownEntry[];
  impostorPlayers: ImpostorRound['players'];
  resultFlickerStyle: any;
  onSkipSuspense: () => void;
  onNewRound: () => void;
  onBack: () => void;
  canStartNewRound: boolean;
};

export function ImpostorResultPhase({
  round,
  copy,
  isPt,
  theme,
  resultStage,
  resultActionsAt,
  revealResultBlockAt,
  votingResultBlockAt,
  bannerWinnerIsImpostor,
  resultShouldShowQuestionBlock,
  hasVotingTallies,
  voteBreakdown,
  impostorPlayers,
  resultFlickerStyle,
  onSkipSuspense,
  onNewRound,
  onBack,
  canStartNewRound,
}: ImpostorResultPhaseProps) {
  return (
    <Card title={copy.result} style={styles.resultCard}>
      {resultStage < resultActionsAt ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.skipSuspense}
          onPress={onSkipSuspense}
          style={[
            styles.skipButton,
            {
              borderColor: theme.semantic.border.subtle,
              backgroundColor: theme.semantic.bg.elevated,
            },
          ]}>
          <Text style={{ color: theme.semantic.text.secondary, fontSize: 12 }}>{copy.skipSuspense}</Text>
        </Pressable>
      ) : null}

      <Animated.View
        style={[
          styles.resultStateBanner,
          resultFlickerStyle,
          {
            borderColor: bannerWinnerIsImpostor ? theme.semantic.status.error : theme.semantic.status.success,
            backgroundColor: bannerWinnerIsImpostor
              ? `${theme.semantic.status.error}26`
              : `${theme.semantic.status.success}26`,
          },
        ]}>
        <Text
          style={[
            styles.resultStateTitle,
            {
              color: bannerWinnerIsImpostor ? theme.semantic.status.error : theme.semantic.status.success,
            },
          ]}>
          {resultStage < 1 ? copy.suspense : bannerWinnerIsImpostor ? copy.defeatBanner : copy.victoryBanner}
        </Text>
        <Text
          style={[
            styles.resultStateSubtitle,
            {
              color: bannerWinnerIsImpostor ? theme.semantic.status.error : theme.semantic.status.success,
            },
          ]}>
          {resultStage < 1
            ? isPt
              ? 'interferencia...'
              : 'interference...'
            : bannerWinnerIsImpostor
              ? copy.winnerI
              : copy.winnerC}
        </Text>
      </Animated.View>

      {resultStage >= 2 ? (
        <Animated.View entering={FadeInUp.duration(420)}>
          <View
            style={[
              styles.resultBlock,
              {
                borderColor: theme.semantic.border.subtle,
                backgroundColor: theme.semantic.bg.surface,
              },
            ]}>
            <Text style={[styles.resultBlockLabel, { color: theme.semantic.text.secondary }]}>
              {impostorPlayers.length > 1 ? copy.impostorRevealMulti : copy.impostorRevealSingle}
            </Text>
            <View style={styles.resultImpostorRow}>
              {impostorPlayers.map((player) => (
                <View key={`result-impostor-${player.id}`} style={styles.resultImpostorCard}>
                  <AvatarSprite avatarId={player.avatarId} size={48} />
                  <Text style={[styles.resultImpostorName, { color: theme.semantic.text.primary }]}>
                    {player.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      ) : null}

      {resultShouldShowQuestionBlock && resultStage >= revealResultBlockAt ? (
        <Animated.View entering={FadeInUp.duration(420)}>
          <View
            style={[
              styles.resultBlock,
              {
                borderColor: theme.semantic.border.subtle,
                backgroundColor: theme.semantic.bg.surface,
              },
            ]}>
            <Text style={[styles.resultBlockTitle, { color: theme.semantic.text.primary }]}>
              {copy.revealBlockTitle}
            </Text>
            <View style={styles.resultPromptRow}>
              <Text style={[styles.resultBlockLabel, { color: theme.semantic.text.secondary }]}>{copy.civilWord}</Text>
              <Text style={[styles.resultPromptValue, { color: theme.semantic.text.primary }]}>{round.civilPrompt}</Text>
            </View>
            <View style={styles.resultPromptRow}>
              <Text style={[styles.resultBlockLabel, { color: theme.semantic.text.secondary }]}>
                {copy.impostorSecret}
              </Text>
              <Text
                style={[
                  styles.resultPromptValue,
                  {
                    color: bannerWinnerIsImpostor ? theme.semantic.status.error : theme.semantic.text.primary,
                  },
                ]}>
                {round.impostorPrompt}
              </Text>
            </View>
          </View>
        </Animated.View>
      ) : null}

      {hasVotingTallies && resultStage >= votingResultBlockAt ? (
        <Animated.View entering={FadeInUp.duration(420)}>
          <View
            style={[
              styles.resultBlock,
              {
                borderColor: theme.semantic.border.subtle,
                backgroundColor: theme.semantic.bg.surface,
              },
            ]}>
            <Text style={[styles.resultBlockTitle, { color: theme.semantic.text.primary }]}>{copy.voteMapTitle}</Text>
            {voteBreakdown.map((entry) => (
              <View
                key={`vote-map-${entry.suspect.id}`}
                style={[styles.voteMapRow, { borderColor: theme.semantic.border.subtle }]}>
                <View style={styles.voteMapTarget}>
                  <AvatarSprite avatarId={entry.suspect.avatarId} size={28} />
                  <Text style={{ color: theme.semantic.text.primary, fontSize: 13 }}>{entry.suspect.name}</Text>
                </View>
                <View style={styles.voteMapVoters}>
                  {entry.voters.length ? (
                    entry.voters.map((voter) => (
                      <AvatarSprite
                        key={`vote-voter-${entry.suspect.id}-${voter.id}`}
                        avatarId={voter.avatarId}
                        size={18}
                      />
                    ))
                  ) : (
                    <Text style={{ color: theme.semantic.text.muted, fontSize: 12 }}>-</Text>
                  )}
                </View>
                <Text style={{ color: theme.semantic.text.secondary, fontSize: 12 }}>
                  {`${entry.voteCount} ${copy.votesCount}`}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      ) : null}

      {resultStage >= resultActionsAt ? (
        <Animated.View entering={FadeInUp.duration(420)}>
          <View style={styles.resultActions}>
            <Button label={copy.newRound} onPress={onNewRound} disabled={!canStartNewRound} />
            <Button label={copy.back} variant="ghost" onPress={onBack} />
          </View>
        </Animated.View>
      ) : null}
    </Card>
  );
}
