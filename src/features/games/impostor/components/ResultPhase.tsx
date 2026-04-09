import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ResultVoteMapBlock } from '@/src/features/games/impostor/components/ResultVoteMapBlock';
import { impostorPhaseStyles as styles } from '@/src/features/games/impostor/styles/impostorPhaseStyles';
import { ImpostorRound } from '@/src/features/games/impostor/types';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
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
  impostorHintWord: string;
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
  const stateColor = bannerWinnerIsImpostor ? theme.semantic.status.error : theme.semantic.status.success;

  return (
    <Card
      style={[
        styles.resultCard,
        {
          backgroundColor: withAlpha('#FFFFFF', 0.95),
          borderColor: withAlpha(theme.semantic.border.subtle, 0.92),
        },
      ]}>
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
            borderColor: withAlpha(stateColor, 0.52),
            backgroundColor: withAlpha(stateColor, 0.14),
          },
        ]}>
        <Text style={[styles.resultStateTitle, { color: stateColor }]}>
          {resultStage < 1 ? copy.suspense : bannerWinnerIsImpostor ? copy.defeatBanner : copy.victoryBanner}
        </Text>
        <Text style={[styles.resultStateSubtitle, { color: stateColor }]}>
          {resultStage < 1
            ? isPt
              ? 'Interferencia...'
              : 'Interference...'
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
                  <AvatarSprite avatarId={player.avatarId} size={52} />
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
              <Text style={[styles.resultBlockLabel, { color: theme.semantic.text.secondary }]}>
                {copy.civilWord}
              </Text>
              <Text style={[styles.resultPromptValue, { color: theme.semantic.text.primary }]}>
                {round.civilPrompt}
              </Text>
            </View>
            <View style={styles.resultPromptRow}>
              <Text style={[styles.resultBlockLabel, { color: theme.semantic.text.secondary }]}>
                {round.mode === 'words' ? copy.impostorHintWord : copy.impostorSecret}
              </Text>
              <Text style={[styles.resultPromptValue, { color: stateColor }]}>{round.impostorPrompt}</Text>
            </View>
          </View>
        </Animated.View>
      ) : null}

      {hasVotingTallies && resultStage >= votingResultBlockAt ? (
        <Animated.View entering={FadeInUp.duration(420)}>
          <ResultVoteMapBlock
            entries={voteBreakdown}
            title={copy.voteMapTitle}
            votesCountLabel={copy.votesCount}
            theme={theme}
          />
        </Animated.View>
      ) : null}

      {resultStage >= resultActionsAt ? (
        <Animated.View entering={FadeInUp.duration(420)}>
          <View style={styles.resultActions}>
            <Button label={copy.newRound} onPress={onNewRound} disabled={!canStartNewRound} size="lg" />
            <Button label={copy.back} variant="secondary" onPress={onBack} size="lg" />
          </View>
        </Animated.View>
      ) : null}
    </Card>
  );
}
