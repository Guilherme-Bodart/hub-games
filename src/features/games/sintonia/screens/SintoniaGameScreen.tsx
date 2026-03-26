import { Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SintoniaBoardSection,
  SintoniaBottomDock,
  SintoniaRulesModal,
  SintoniaSecretHeroOverlay,
  SintoniaThemeStatusSection,
} from '@/src/features/games/sintonia/components';
import { useSintoniaGameController } from '@/src/features/games/sintonia/hooks/useSintoniaGameController';
import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { Button, Card, GameScreenShell, GameTopBar } from '@/src/ui/atoms';
import { triggerGameFeedback } from '@/src/ui/feedback';

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
      ? 'Aguardando sincronizacao da rodada em tempo real.'
      : 'Waiting for real-time round sync.';
  const unavailableSubtitle =
    locale === 'pt'
      ? 'Nao foi possivel carregar a rodada. Tente iniciar novamente.'
      : 'Could not load the round. Try starting again.';
  const retryLabel = locale === 'pt' ? 'Tentar novamente' : 'Try again';

  if (game.isRemoteRealtime && !game.round && !game.roundError) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
        <View style={styles.emptyWrap}>
          <Card title={t('sintonia.title')} subtitle={syncingSubtitle}>
            <Button
              label={t('sintonia.backLobby')}
              variant="ghost"
              onPress={() => {
                triggerGameFeedback('warning');
                onExitLobby();
              }}
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  if (!game.round || game.roundError) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
        <View style={styles.emptyWrap}>
          <Card title={t('sintonia.title')} subtitle={unavailableSubtitle}>
            {game.canControlCriticalActions ? (
              <Button
                label={retryLabel}
                onPress={() => {
                  triggerGameFeedback('confirm');
                  void game.startNewRound();
                }}
              />
            ) : null}
            <Button
              label={t('sintonia.backLobby')}
              variant="ghost"
              onPress={() => {
                triggerGameFeedback('warning');
                onExitLobby();
              }}
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <GameScreenShell
        footerInset={176}
        footer={
          <SintoniaBottomDock
            theme={theme}
            helperText={game.dockHelperText}
            primaryAction={game.primaryAction}
            backLabel={t('sintonia.backLobby')}
            onBack={() => { triggerGameFeedback('warning'); onExitLobby(); }}
          />
        }>
        <GameTopBar
          title={t('sintonia.title')}
          subtitle={game.phaseBadgeLabel}
          statusTone={game.topBarStatusTone}
          onPressRight={() => game.setRulesVisible(true)}
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

        {game.phase === 'secrets' && game.activeSecretPlayer ? (
          <SintoniaSecretHeroOverlay
            activeSecretPlayer={game.activeSecretPlayer}
            releaseHintLabel={locale === 'pt' ? 'Solte para ocultar' : 'Release to hide'}
            theme={theme}
          />
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
        />

        <SintoniaBoardSection
          orderedPlayers={game.orderedPlayers}
          phase={game.phase}
          activeSecretPlayerId={game.activeSecretPlayerId}
          revealedById={game.revealedById}
          theme={theme}
          secretGridColumns={game.secretGridColumns}
          orderingGridColumns={game.orderingGridColumns}
          isCompactViewport={game.isCompactViewport}
          playersSectionLabel={game.playersSectionLabel}
          playersBadgeLabel={t('sintonia.playersBadge', { count: game.orderedPlayers.length })}
          emptyCardsLabel={
            locale === 'pt'
              ? 'Aguardando jogadores para iniciar esta rodada.'
              : 'Waiting for players to start this round.'
          }
          holdHintLabel={locale === 'pt' ? 'Segure para revelar' : 'Hold to reveal'}
          hiddenNumberLabel={t('sintonia.hiddenNumber')}
          onSecretPressIn={game.handleSecretPlayerPressIn}
          onSecretPressOut={game.handleSecretPlayerPressOut}
          onOrderingCardMeasure={game.handleOrderingCardMeasure}
          onDropPlayer={game.onDropPlayer}
        />
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

