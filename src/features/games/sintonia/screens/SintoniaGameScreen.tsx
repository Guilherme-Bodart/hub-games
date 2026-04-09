import { LinearGradient } from 'expo-linear-gradient';
import { Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SecretPhaseHeader,
  SecretThemeScaleCard,
  SintoniaBoardSection,
  SintoniaBottomDock,
  SintoniaRulesModal,
  SintoniaSecretRevealCard,
} from '@/src/features/games/sintonia/components';
import { useSintoniaGameController } from '@/src/features/games/sintonia/hooks/useSintoniaGameController';
import { secretPhaseStyles as secretStyles } from '@/src/features/games/sintonia/styles/secretPhaseStyles';
import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { triggerGameFeedback } from '@/src/ui/feedback';
import { Card, GameScreenShell } from '@/src/ui/atoms';

export function SintoniaGameScreen({ lobby, onExitLobby, setShellPhase }: GameRuntimeScreenProps) {
  const { theme } = useTheme();
  const { locale, t } = useI18n();
  const { width: viewportWidth } = useWindowDimensions();

  const game = useSintoniaGameController({
    lobby,
    setShellPhase,
    locale,
    viewportWidth,
    t,
  });

  const syncingSubtitle = t('sintonia.syncingSubtitle');
  const unavailableSubtitle = t('sintonia.unavailableSubtitle');

  if (game.isRemoteRealtime && !game.round) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
        <View style={styles.emptyWrap}>
          <Card title={t('sintonia.title')} subtitle={game.realtimeError || syncingSubtitle} />
        </View>
      </SafeAreaView>
    );
  }

  if (!game.isRemoteRealtime && (!game.round || game.roundError)) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
        <View style={styles.emptyWrap}>
          <Card title={t('sintonia.title')} subtitle={unavailableSubtitle} />
        </View>
      </SafeAreaView>
    );
  }

  if (!game.round) {
    return null;
  }

  const isSecretPhase = game.phase === 'secrets';
  const headerStatusLabel =
    game.phase === 'revealing'
      ? t('sintonia.revealingProgress', {
          current: game.revealedCount,
          total: game.orderedPlayers.length,
        })
      : t('sintonia.playersBadge', { count: game.orderedPlayers.length });

  return (
    <>
      <GameScreenShell
        showBackdrop={!isSecretPhase}
        style={isSecretPhase ? { backgroundColor: theme.semantic.bg.app } : undefined}
        contentStyle={isSecretPhase ? { paddingTop: 18, paddingBottom: 20 } : undefined}
        footerInset={isSecretPhase ? 24 : 176}
        footer={
          !isSecretPhase ? (
            <SintoniaBottomDock
              theme={theme}
              helperText={game.dockHelperText}
              primaryAction={game.primaryAction}
              backLabel={t('sintonia.backLobby')}
              onBack={() => {
                triggerGameFeedback('warning');
                onExitLobby();
              }}
            />
          ) : undefined
        }>
        {isSecretPhase ? (
          <>
            <View pointerEvents="none" style={secretStyles.screenBackdrop}>
              <LinearGradient
                colors={['#FFFFFF', '#F8FBFF', '#F5F8FF']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={secretStyles.screenBackdrop}
              />
            </View>

            <SecretPhaseHeader
              theme={theme}
              title={t('sintonia.title')}
              roundLabel={game.phaseHeaderLabel}
              players={game.round.players}
              readyStatusLabel={t('sintonia.secretReadyProgress', {
                ready: game.secretReadyPlayersCount,
                total: game.secretTotalPlayersCount,
              })}
              onPressInfo={() => game.setRulesVisible(true)}
              infoLabel={t('sintonia.rulesTitle')}
            />

            <SecretThemeScaleCard
              theme={theme}
              scaleTitle={t('sintonia.themeScaleTitle')}
              scaleStartLabel={game.round.themeScaleLow}
              scaleEndLabel={game.round.themeScaleHigh}
              roundTheme={game.round.theme}
            />

            {game.realtimeError ? (
              <View
                style={[
                  styles.errorStrip,
                  {
                    borderColor: withAlpha(theme.semantic.status.error, 0.55),
                    backgroundColor: withAlpha(theme.semantic.status.error, 0.16),
                  },
                ]}>
                <Text style={[styles.errorText, { color: theme.semantic.status.error }]}>{game.realtimeError}</Text>
              </View>
            ) : null}

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
          </>
        ) : (
          <>
            <SecretPhaseHeader
              theme={theme}
              title={t('sintonia.title')}
              roundLabel={game.phaseHeaderLabel}
              players={game.round.players}
              readyStatusLabel={headerStatusLabel}
              onPressInfo={() => game.setRulesVisible(true)}
              infoLabel={t('sintonia.rulesTitle')}
            />

            {game.realtimeError ? (
              <View
                style={[
                  styles.errorStrip,
                  {
                    borderColor: withAlpha(theme.semantic.status.error, 0.55),
                    backgroundColor: withAlpha(theme.semantic.status.error, 0.16),
                  },
                ]}>
                <Text style={[styles.errorText, { color: theme.semantic.status.error }]}>{game.realtimeError}</Text>
              </View>
            ) : null}

            <SecretThemeScaleCard
              theme={theme}
              scaleTitle={t('sintonia.themeScaleTitle')}
              scaleStartLabel={game.round.themeScaleLow}
              scaleEndLabel={game.round.themeScaleHigh}
              roundTheme={game.round.theme}
            />

            <View
              style={[
                styles.voiceNotice,
                {
                  borderColor: theme.semantic.border.subtle,
                  backgroundColor: withAlpha(theme.semantic.bg.surface, 0.7),
                },
              ]}>
              <Text
                style={[
                  styles.voiceNoticeText,
                  {
                    color: theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {t('sintonia.voiceNotice')}
              </Text>
            </View>

            {!game.canAdvancePhase ? (
              <Text
                style={[
                  styles.hostHintText,
                  {
                    color: theme.semantic.status.warning,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {t('sintonia.hostControlHint')}
              </Text>
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
