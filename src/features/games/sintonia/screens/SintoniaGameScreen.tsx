import { Ionicons } from '@expo/vector-icons';
import { Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SecretPhaseHeader,
  SecretThemeScaleCard,
  SintoniaBoardSection,
  SintoniaBottomDock,
  SintoniaResultSummaryBanner,
  SintoniaRulesModal,
  SintoniaSecretRevealCard,
} from '@/src/features/games/sintonia/components';
import { useSintoniaGameController } from '@/src/features/games/sintonia/hooks/useSintoniaGameController';
import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { useI18n } from '@/src/i18n';
import { getGameAccent, useTheme } from '@/src/theme';
import { Card, GameScreenShell } from '@/src/ui/atoms';
import { triggerGameFeedback } from '@/src/ui/feedback';

export function SintoniaGameScreen({ lobby, onExitLobby, setShellPhase }: GameRuntimeScreenProps) {
  const { theme } = useTheme();
  const accent = getGameAccent('sintonia');
  const { locale, t } = useI18n();
  const { width: viewportWidth } = useWindowDimensions();

  const game = useSintoniaGameController({
    lobby,
    setShellPhase,
    locale,
    viewportWidth,
    t,
  });

  if (game.isRemoteRealtime && !game.round) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
        <View style={styles.emptyWrap}>
          <Card title={t('sintonia.title')} subtitle={game.realtimeError || t('sintonia.syncingSubtitle')} />
        </View>
      </SafeAreaView>
    );
  }

  if (!game.isRemoteRealtime && (!game.round || game.roundError)) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
        <View style={styles.emptyWrap}>
          <Card title={t('sintonia.title')} subtitle={t('sintonia.unavailableSubtitle')} />
        </View>
      </SafeAreaView>
    );
  }

  if (!game.round) {
    return null;
  }

  const isSecretPhase = game.phase === 'secrets';
  const isFinishedPhase = game.phase === 'finished';
  const headerStatusLabel = isSecretPhase
    ? t('sintonia.secretReadyProgress', {
        ready: game.secretReadyPlayersCount,
        total: game.secretTotalPlayersCount,
      })
    : game.phase === 'revealing'
      ? t('sintonia.revealingProgress', {
          current: game.revealedCount,
          total: game.orderedPlayers.length,
        })
      : t('sintonia.playersCountCompact', { count: game.orderedPlayers.length });

  const correctCount = game.orderedPlayers.filter(
    (player) => game.revealedById[player.id] === 'correct'
  ).length;

  const handleExitLobby = () => {
    triggerGameFeedback('warning');
    onExitLobby();
  };

  return (
    <>
      <GameScreenShell
        accentColor={accent.primary}
        showBackdrop
        footerInset={isSecretPhase ? 24 : 176}
        footer={
          !isSecretPhase ? (
            <SintoniaBottomDock
              theme={theme}
              helperText={game.dockHelperText}
              primaryAction={game.primaryAction}
              backLabel={t('sintonia.backLobby')}
              onBack={handleExitLobby}
            />
          ) : undefined
        }>
        <SecretPhaseHeader
          theme={theme}
          title={t('sintonia.title')}
          roundLabel={game.phaseHeaderLabel}
          players={game.round.players}
          readyStatusLabel={headerStatusLabel}
          onPressInfo={() => game.setRulesVisible(true)}
          infoLabel={t('sintonia.rulesTitle')}
          onPressBack={handleExitLobby}
          backLabel={t('sintonia.backLobby')}
          statusTone={game.topBarStatusTone}
        />

        {game.realtimeError ? (
          <View
            style={[
              styles.errorStrip,
              {
                borderColor: theme.semantic.status.error,
                backgroundColor: theme.semantic.badge.errorBg,
              },
            ]}>
            <Text style={[styles.errorText, { color: theme.semantic.badge.errorText }]}>
              {game.realtimeError}
            </Text>
          </View>
        ) : null}

        <SecretThemeScaleCard
          theme={theme}
          scaleTitle={t('sintonia.themeScaleTitle')}
          scaleStartLabel={game.round.themeScaleLow}
          scaleEndLabel={game.round.themeScaleHigh}
          roundTheme={game.round.theme}
        />

        {isSecretPhase ? (
          <SintoniaSecretRevealCard
            theme={theme}
            player={game.currentSecretPlayer}
            isRevealed={game.isCurrentSecretRevealed}
            isLocalReady={game.isLocalDeviceReady}
            isWaitingOthers={game.isSecretWaitingOthers}
            hasMoreLocalPlayers={game.hasMoreLocalSecretPlayers}
            canAdvance={!game.isLocalDeviceReady && (!game.currentSecretPlayer || game.isCurrentSecretViewed)}
            phaseSubtitle={t('sintonia.secretPhaseSubtitle')}
            holdHintLabel={t('sintonia.secretHoldToReveal')}
            chargingLabel={t('sintonia.secretCharging')}
            releaseHintLabel={t('sintonia.secretReleaseToHide')}
            waitingLabel={t('sintonia.secretWaitingOthers')}
            revealedLabel={t('sintonia.secretRevealedTag')}
            nextLabel={t('sintonia.secretNextPlayer')}
            readyLabel={t('sintonia.secretReadyAction')}
            lockedActionLabel={t('sintonia.secretHoldCardAction')}
            onPressIn={game.handleSecretPlayerPressIn}
            onPressOut={game.handleSecretPlayerPressOut}
            onAdvance={game.advanceSecretCard}
          />
        ) : (
          <>
            {isFinishedPhase ? (
              <SintoniaResultSummaryBanner
                roundResult={game.roundResult}
                title={game.phaseBadgeLabel}
                subtitle={t('sintonia.roundFinishedPrompt')}
                correctCount={correctCount}
                totalCount={game.orderedPlayers.length}
              />
            ) : (
              <View
                style={[
                  styles.voiceNotice,
                  {
                    borderColor: theme.semantic.border.hairline,
                    backgroundColor: accent.tint,
                  },
                ]}>
                <Ionicons name="mic-outline" size={16} color={accent.primary} />
                <Text
                  style={[
                    styles.voiceNoticeText,
                    {
                      color: theme.semantic.text.primary,
                      fontFamily: theme.semantic.typography.bodyFamily,
                      fontWeight: theme.semantic.typography.bodyWeight,
                    },
                  ]}>
                  {t('sintonia.voiceNotice')}
                </Text>
              </View>
            )}

            {!game.canAdvancePhase ? (
              <View
                style={[
                  styles.hostHintStrip,
                  {
                    borderColor: theme.semantic.border.hairline,
                    backgroundColor: theme.semantic.badge.warningBg,
                  },
                ]}>
                <Text
                  style={[
                    styles.hostHintText,
                    {
                      color: theme.semantic.badge.warningText,
                      fontFamily: theme.semantic.typography.bodyFamily,
                      fontWeight: theme.semantic.typography.bodyWeight,
                    },
                  ]}>
                  {t('sintonia.hostControlHint')}
                </Text>
              </View>
            ) : null}

            <SintoniaBoardSection
              orderedPlayers={game.orderedPlayers}
              revealedById={game.revealedById}
              theme={theme}
              orderingGridColumns={game.orderingGridColumns}
              isCompactViewport={game.isCompactViewport}
              playersSectionLabel={game.playersSectionLabel}
              playersBadgeLabel={t('sintonia.playersBadge', { count: game.orderedPlayers.length })}
              emptyCardsLabel={t('sintonia.emptyRoundWaiting')}
              hiddenNumberLabel={t('sintonia.hiddenNumber')}
              isDragEnabled={game.phase === 'ordering'}
              onOrderingCardMeasure={game.handleOrderingCardMeasure}
              onDropPlayer={game.onDropPlayer}
            />
          </>
        )}
      </GameScreenShell>

      <SintoniaRulesModal
        visible={game.rulesVisible}
        title={t('sintonia.rulesTitle')}
        objective={t('sintonia.rulesObjective')}
        stepOne={t('sintonia.rulesStepOne')}
        stepTwo={t('sintonia.rulesStepTwo')}
        stepThree={t('sintonia.rulesStepThree')}
        onClose={() => game.setRulesVisible(false)}
        theme={theme}
      />
    </>
  );
}
