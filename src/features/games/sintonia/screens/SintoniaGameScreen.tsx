import { Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SecretPhaseHeader,
  SecretThemeScaleCard,
  SintoniaBoardSection,
  SintoniaBottomDock,
  SintoniaRulesModal,
  SintoniaSecretRevealCard,
  SintoniaThemeStatusSection,
} from '@/src/features/games/sintonia/components';
import { secretPhaseStyles as secretStyles } from '@/src/features/games/sintonia/styles/secretPhaseStyles';
import { useSintoniaGameController } from '@/src/features/games/sintonia/hooks/useSintoniaGameController';
import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { Card, GameScreenShell, GameTopBar } from '@/src/ui/atoms';
import { triggerGameFeedback } from '@/src/ui/feedback';
import { LinearGradient } from 'expo-linear-gradient';

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

  const syncingSubtitle =
    locale === 'pt'
      ? 'Aguardando sincronização da rodada em tempo real.'
      : 'Waiting for real-time round sync.';
  const unavailableSubtitle =
    locale === 'pt'
      ? 'Não foi possível carregar a rodada. Tente iniciar novamente.'
      : 'Could not load the round. Try starting again.';

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
              roundLabel={t('sintonia.roundLiveLabel')}
              players={game.round.players}
              playersCountLabel={t('sintonia.playersCountCompact', { count: game.round.players.length })}
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
              canAdvance={
                !game.isLocalDeviceReady &&
                (!game.currentSecretPlayer || game.isCurrentSecretViewed)
              }
              phaseSubtitle={t('sintonia.secretPhaseSubtitle')}
              holdHintLabel={t('sintonia.secretHoldToReveal')}
              chargingLabel={t('sintonia.secretCharging')}
              releaseHintLabel={t('sintonia.secretReleaseToHide')}
              waitingLabel={t('sintonia.secretWaitingOthers')}
              revealedLabel={t('sintonia.secretRevealedTag')}
              nextLabel={t('sintonia.secretNextPlayer')}
              readyLabel={t('sintonia.secretReadyAction')}
              onPressIn={game.handleSecretPlayerPressIn}
              onPressOut={game.handleSecretPlayerPressOut}
              onAdvance={game.advanceSecretCard}
            />
          </>
        ) : (
          <>
            <GameTopBar
              title={t('sintonia.title')}
              subtitle={game.phaseBadgeLabel}
              showStatus
              statusTone={game.topBarStatusTone}
              onPressRight={() => game.setRulesVisible(true)}
              rightSymbolName={{ ios: 'info.circle', android: 'info', web: 'info' }}
              style={styles.topBarSpacing}
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

            <SintoniaThemeStatusSection
              theme={theme}
              roundTheme={game.round.theme}
              titleFlickerStyle={game.titleFlickerStyle}
              themeShineStyle={game.themeShineStyle}
              themeGlowStyle={game.themeGlowStyle}
              voiceNoticeLabel={t('sintonia.voiceNotice')}
              hostHintLabel={t('sintonia.hostControlHint')}
              realtimeError={null}
              canAdvancePhase={game.canAdvancePhase}
              showVoiceNotice
            />

            <SintoniaBoardSection
              orderedPlayers={game.orderedPlayers}
              revealedById={game.revealedById}
              theme={theme}
              orderingGridColumns={game.orderingGridColumns}
              isCompactViewport={game.isCompactViewport}
              playersSectionLabel={game.playersSectionLabel}
              playersBadgeLabel={t('sintonia.playersBadge', { count: game.orderedPlayers.length })}
              emptyCardsLabel={
                locale === 'pt'
                  ? 'Aguardando jogadores para iniciar esta rodada.'
                  : 'Waiting for players to start this round.'
              }
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

