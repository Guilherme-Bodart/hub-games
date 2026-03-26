import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ImpostorCluesPhase,
  ImpostorGuessingPhase,
  ImpostorResultPhase,
  ImpostorRevealHeroCard,
  ImpostorRevealPhase,
  ImpostorRoundDecisionPhase,
  ImpostorVotingPhase,
} from '@/src/features/games/impostor/components';
import { useImpostorGameController } from '@/src/features/games/impostor/hooks/useImpostorGameController';
import { styles } from '@/src/features/games/impostor/styles/impostorStyles';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { Button, Card, GameScreenShell, GameTopBar } from '@/src/ui/atoms';
import { triggerGameFeedback } from '@/src/ui/feedback';

export function ImpostorGameScreen({ lobby, onExitLobby, setShellPhase }: GameRuntimeScreenProps) {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const { width: viewportWidth } = useWindowDimensions();

  const game = useImpostorGameController({
    lobby,
    onExitLobby,
    setShellPhase,
    locale,
    viewportWidth,
  });

  if (!game.round) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
        <View style={styles.emptyWrap}>
          <Card
            title={game.copy.title}
            subtitle={
              game.error ||
              (game.isPt
                ? 'Aguardando configuracao da rodada. O host pode iniciar novamente.'
                : 'Waiting for round setup. The host can start again.')
            }>
            {game.canControl ? (
              <Button
                label={game.copy.newRound}
                onPress={() => {
                  triggerGameFeedback('confirm');
                  void game.initializeRound();
                }}
              />
            ) : null}
            <Button
              label={game.copy.back}
              variant="ghost"
              onPress={() => {
                triggerGameFeedback('warning');
                void game.handleExitLobby();
              }}
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GameScreenShell contentStyle={styles.root}>
      <GameTopBar title={game.copy.title} subtitle={game.phaseLabel} statusTone={game.topBarStatusTone} />
      {game.error ? (
        <View
          style={[
            styles.errorStrip,
            {
              borderColor: withAlpha(theme.semantic.status.error, 0.55),
              backgroundColor: withAlpha(theme.semantic.status.error, 0.16),
            },
          ]}>
          <Text style={[styles.errorText, { color: theme.semantic.status.error }]}>{game.error}</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content}>
        {game.round.phase === 'reveal' ? (
          <ImpostorRevealPhase
            round={game.round}
            copy={game.copy}
            isPt={game.isPt}
            theme={theme}
            revealedPrompt={game.revealedPrompt}
            revealedIsImpostor={game.revealedIsImpostor}
            heldRevealId={game.heldRevealId}
            localRevealPlayers={game.localRevealPlayers}
            playerCardWidth={game.playerCardWidth}
            revealFogStyle={game.revealFogStyle}
            revealPromptStyle={game.revealPromptStyle}
            impostorPromptPulseStyle={game.impostorPromptPulseStyle}
            canControl={game.canControl}
            isRemote={game.isRemote}
            onPressRevealIn={game.startRevealHold}
            onPressRevealOut={game.stopRevealHold}
            onGoClues={game.handleGoClues}
          />
        ) : null}

        {game.round.phase === 'reveal' && game.revealedPlayer && game.revealedPrompt ? (
          <ImpostorRevealHeroCard
            revealedPlayer={game.revealedPlayer}
            revealedPrompt={game.revealedPrompt}
            revealedIsImpostor={game.revealedIsImpostor}
            copy={game.copy}
            theme={theme}
          />
        ) : null}

        {game.round.phase === 'clues' ? (
          <ImpostorCluesPhase
            round={game.round}
            copy={game.copy}
            isPt={game.isPt}
            theme={theme}
            isClueCycleComplete={game.isClueCycleComplete}
            activeTurnName={game.activeTurn?.name || ''}
            activeTurnId={game.activeTurn?.id || null}
            clueProgress={game.clueProgress}
            clueSubmittedCount={game.clueSubmittedCount}
            typingLabel={game.typingLabel}
            canSubmitClue={game.canSubmitClue}
            clueInput={game.clueInput}
            isRemote={game.isRemote}
            canControl={game.canControl}
            onChangeClueInput={game.setClueInput}
            onProceedDecision={game.handleProceedToDecision}
            onSubmitClue={game.handleSubmitClue}
          />
        ) : null}

        {game.round.phase === 'voting' ? (
          <ImpostorVotingPhase
            round={game.round}
            copy={game.copy}
            isPt={game.isPt}
            theme={theme}
            activeVotingPlayerId={game.activeVotingPlayerId}
            localVotingPlayers={game.localVotingPlayers}
            localVotesSubmittedCount={game.localVotesSubmittedCount}
            visibleVotingCount={game.visibleVotingCount}
            activeVotingSelection={game.activeVotingSelection}
            isVoteSelectionLocked={game.isVoteSelectionLocked}
            votingRevealDone={game.votingRevealDone}
            voteCellWidth={game.voteCellWidth}
            allLocalVotingSubmitted={game.allLocalVotingSubmitted}
            onToggleSuspect={game.handleToggleVotingSuspect}
            onUnlockVote={game.handleUnlockVoteSelection}
            onConfirmVote={game.handleConfirmVoting}
            isConfirmDisabled={game.isConfirmVoteDisabled}
          />
        ) : null}

        {game.round.phase === 'roundDecision' ? (
          <ImpostorRoundDecisionPhase
            round={game.round}
            localPlayerIds={game.localPlayerIds}
            theme={theme}
            copy={game.copy}
            onVote={game.handleRoundDecisionVote}
          />
        ) : null}

        {game.round.phase === 'guessing' ? (
          <ImpostorGuessingPhase
            round={game.round}
            localPlayerIds={game.localPlayerIds}
            hasVotingTallies={game.hasVotingTallies}
            votingTallies={game.votingTallies}
            guessDrafts={game.guessDrafts}
            theme={theme}
            copy={game.copy}
            isPt={game.isPt}
            onGuessDraftChange={game.onGuessDraftChange}
            onSubmitGuess={game.handleSubmitImpostorGuess}
          />
        ) : null}

        {game.round.phase === 'result' ? (
          <ImpostorResultPhase
            round={game.round}
            copy={game.copy}
            isPt={game.isPt}
            theme={theme}
            resultStage={game.resultStage}
            resultActionsAt={game.resultActionsAt}
            revealResultBlockAt={game.revealResultBlockAt}
            votingResultBlockAt={game.votingResultBlockAt}
            bannerWinnerIsImpostor={game.bannerWinnerIsImpostor}
            resultShouldShowQuestionBlock={game.resultShouldShowQuestionBlock}
            hasVotingTallies={game.hasVotingTallies}
            voteBreakdown={game.voteBreakdown}
            impostorPlayers={game.impostorPlayers}
            resultFlickerStyle={game.resultFlickerStyle}
            onSkipSuspense={game.fastForwardResult}
            onNewRound={() => {
              triggerGameFeedback('confirm');
              void game.initializeRound();
            }}
            onBack={() => {
              triggerGameFeedback('warning');
              void game.handleExitLobby();
            }}
            canStartNewRound={!game.isRemote || game.canControl}
          />
        ) : null}
      </ScrollView>
    </GameScreenShell>
  );
}

