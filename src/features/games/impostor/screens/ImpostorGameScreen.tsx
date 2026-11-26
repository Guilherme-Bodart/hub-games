import { useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ImpostorCluesPhase,
  ImpostorGuessingPhase,
  ImpostorResultPhase,
  ImpostorRevealPhase,
  ImpostorRoundDecisionPhase,
  ImpostorRoundHeader,
  ImpostorRulesModal,
  ImpostorVotingPhase,
} from '@/src/features/games/impostor/components';
import { useImpostorGameController } from '@/src/features/games/impostor/hooks/useImpostorGameController';
import { styles } from '@/src/features/games/impostor/styles/impostorStyles';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { useI18n } from '@/src/i18n';
import { getGameAccent, useTheme } from '@/src/theme';
import { Button, Card, GameScreenShell } from '@/src/ui/atoms';
import { triggerGameFeedback } from '@/src/ui/feedback';

export function ImpostorGameScreen({ lobby, onExitLobby, setShellPhase }: GameRuntimeScreenProps) {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const { width: viewportWidth } = useWindowDimensions();
  const [rulesVisible, setRulesVisible] = useState(false);
  const [isCardInteracting, setIsCardInteracting] = useState(false);
  const accent = getGameAccent('impostor-neon');

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
                ? 'Aguardando configuração da rodada. O host pode iniciar novamente.'
                : 'Waiting for round setup. The host can start again.')
            }>
            <View style={styles.emptyActions}>
              {game.canControl ? (
                <Button
                  label={game.copy.newRound}
                  color={accent.primary}
                  plinthColor={accent.plinth}
                  onPress={() => {
                    triggerGameFeedback('confirm');
                    void game.initializeRound();
                  }}
                />
              ) : null}
              <Button
                label={game.copy.back}
                variant="secondary"
                onPress={() => {
                  triggerGameFeedback('warning');
                  void game.handleExitLobby();
                }}
              />
            </View>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <GameScreenShell accentColor={accent.primary} contentStyle={styles.root}>
        <ImpostorRoundHeader
          theme={theme}
          title={game.copy.title}
          roundLabel={game.phaseLabel}
          players={game.round.players}
          playersCountLabel={
            game.round.phase === 'clues'
              ? `${game.clueSubmittedCount}/${game.round.players.length} ${game.isPt ? 'pistas enviadas' : 'clues sent'}`
              : `${game.round.players.length} ${game.copy.playersCountCompact}`
          }
          onPressInfo={() => setRulesVisible(true)}
          infoLabel={game.copy.rulesTitle}
        />

        {game.error ? (
          <View
            style={[
              styles.errorStrip,
              { borderColor: accent.primary, backgroundColor: theme.semantic.badge.errorBg },
            ]}>
            <Text
              style={[
                styles.errorText,
                {
                  color: theme.semantic.badge.errorText,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {game.error}
            </Text>
          </View>
        ) : null}

        {game.round.phase === 'reveal' ? (
          <View style={{ flex: 1 }}>
            <ImpostorRevealPhase
              round={game.round}
              copy={game.copy}
              isPt={game.isPt}
              theme={theme}
              heldRevealId={game.heldRevealId}
              revealPlayerIndex={game.revealPlayerIndex}
              currentRevealPlayer={game.currentRevealPlayer}
              hasMoreRevealPlayers={game.hasMoreRevealPlayers}
              localRevealPlayers={game.localRevealPlayers}
              canControl={game.canControl}
              isRemote={game.isRemote}
              onInteractionChange={setIsCardInteracting}
              onPressRevealIn={game.startRevealHold}
              onPressRevealOut={game.stopRevealHold}
              onAdvanceRevealPlayer={game.handleAdvanceRevealPlayer}
              onGoClues={game.handleGoClues}
            />
          </View>
        ) : (
        <ScrollView
          scrollEnabled={!isCardInteracting}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            game.round.phase === 'clues' ? styles.cluesContent : null,
          ]}>

          {game.round.phase === 'clues' ? (
            <ImpostorCluesPhase
              round={game.round}
              isPt={game.isPt}
              theme={theme}
              isClueCycleComplete={game.isClueCycleComplete}
              activeTurnName={game.activeTurn?.name || ''}
              activeTurnId={game.activeTurn?.id || null}
              clueProgress={game.clueProgress}
              clueSubmittedCount={game.clueSubmittedCount}
              typingLabel={game.typingLabel}
              canSubmitClue={game.canSubmitClue}
              clueTurnLabel={
                game.round.phase === 'clues' && !game.isClueCycleComplete
                  ? `${game.clueTurnRemainingSeconds}s`
                  : ''
              }
              clueInput={game.clueInput}
              onChangeClueInput={game.setClueInput}
              onSubmitClue={game.handleSubmitClue}
              onProceedDecision={game.handleProceedToDecision}
              submitLabel={game.copy.submitClue}
              proceedLabel={game.copy.goDecision}
              isProceedDisabled={game.isRemote && !game.canControl}
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
              isPt={game.isPt}
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
        )}
      </GameScreenShell>

      <ImpostorRulesModal
        visible={rulesVisible}
        title={game.copy.rulesTitle}
        objective={game.copy.rulesObjective}
        stepOne={game.copy.rulesStepOne}
        stepTwo={game.copy.rulesStepTwo}
        stepThree={game.copy.rulesStepThree}
        onClose={() => setRulesVisible(false)}
        theme={theme}
      />
    </>
  );
}
