import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ResultVoteMapBlock } from '@/src/features/games/impostor/components/ResultVoteMapBlock';
import { impostorPhaseStyles as styles } from '@/src/features/games/impostor/styles/impostorPhaseStyles';
import { ImpostorRound } from '@/src/features/games/impostor/types';
import { getGameAccent } from '@/src/theme';
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
  impostorHintWord: string;
  voteMapTitle: string;
  votesCount: string;
  newRound: string;
  back: string;
};

type VoteBreakdownEntry = {
  suspect: { id: string; name: string; avatarId: number };
  voteCount: number;
  voters: Array<{ id: string; avatarId: number }>;
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
  const accent = getGameAccent('impostor-neon');
  const bannerBg = bannerWinnerIsImpostor ? accent.tint : theme.semantic.badge.successBg;
  const bannerBorder = bannerWinnerIsImpostor ? accent.primary : theme.semantic.status.success;
  const bannerText = bannerWinnerIsImpostor ? accent.plinth : theme.semantic.badge.successText;
  const titleFont = {
    fontFamily: theme.semantic.typography.titleFamily,
    fontWeight: theme.semantic.typography.titleWeight,
  };
  const bodyFont = {
    fontFamily: theme.semantic.typography.bodyFamily,
    fontWeight: theme.semantic.typography.bodyWeight,
  };
  const insetBlockStyle = [
    styles.resultBlock,
    {
      borderColor: theme.semantic.border.hairline,
      backgroundColor: theme.semantic.bg.subtle,
    },
  ];

  return (
    <Card style={styles.resultCard}>
      {resultStage < resultActionsAt ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.skipSuspense}
          onPress={onSkipSuspense}
          style={[
            styles.skipButton,
            {
              borderColor: theme.semantic.border.hairline,
              backgroundColor: theme.semantic.bg.subtle,
            },
          ]}>
          <Text style={[styles.skipButtonText, bodyFont, { color: theme.semantic.text.secondary }]}>
            {copy.skipSuspense}
          </Text>
        </Pressable>
      ) : null}

      <Animated.View
        style={[
          styles.resultStateBanner,
          resultFlickerStyle,
          { borderColor: bannerBorder, backgroundColor: bannerBg },
        ]}>
        <Text style={[styles.resultStateTitle, titleFont, { color: bannerText }]}>
          {resultStage < 1 ? copy.suspense : bannerWinnerIsImpostor ? copy.defeatBanner : copy.victoryBanner}
        </Text>
        <Text style={[styles.resultStateSubtitle, bodyFont, { color: bannerText }]}>
          {resultStage < 1
            ? isPt
              ? 'Interferência...'
              : 'Interference...'
            : bannerWinnerIsImpostor
              ? copy.winnerI
              : copy.winnerC}
        </Text>
      </Animated.View>

      {resultStage >= 2 ? (
        <Animated.View entering={FadeInUp.duration(420)}>
          <View style={insetBlockStyle}>
            <Text style={[styles.resultBlockLabel, bodyFont, { color: theme.semantic.text.secondary }]}>
              {impostorPlayers.length > 1 ? copy.impostorRevealMulti : copy.impostorRevealSingle}
            </Text>
            <View style={styles.resultImpostorRow}>
              {impostorPlayers.map((player) => (
                <View key={`result-impostor-${player.id}`} style={styles.resultImpostorCard}>
                  <AvatarSprite avatarId={player.avatarId} size={52} />
                  <Text style={[styles.resultImpostorName, titleFont, { color: theme.semantic.text.primary }]}>
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
          <View style={insetBlockStyle}>
            <Text style={[styles.resultBlockTitle, titleFont, { color: theme.semantic.text.primary }]}>
              {copy.revealBlockTitle}
            </Text>
            <View style={styles.resultPromptRow}>
              <Text style={[styles.resultBlockLabel, bodyFont, { color: theme.semantic.text.secondary }]}>
                {copy.civilWord}
              </Text>
              <Text style={[styles.resultPromptValue, titleFont, { color: theme.semantic.text.primary }]}>
                {round.civilPrompt}
              </Text>
            </View>
            <View style={styles.resultPromptRow}>
              <Text style={[styles.resultBlockLabel, bodyFont, { color: theme.semantic.text.secondary }]}>
                {round.mode === 'words' ? copy.impostorHintWord : copy.impostorSecret}
              </Text>
              <Text style={[styles.resultPromptValue, titleFont, { color: accent.primary }]}>
                {round.impostorPrompt}
              </Text>
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
            <Button
              label={copy.newRound}
              color={accent.primary}
              plinthColor={accent.plinth}
              onPress={onNewRound}
              disabled={!canStartNewRound}
              size="lg"
            />
            <Button label={copy.back} variant="secondary" onPress={onBack} size="lg" />
          </View>
        </Animated.View>
      ) : null}
    </Card>
  );
}
