import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LOBBY_SETTINGS_KEYS } from '@/src/features/lobby';
import {
  LobbyAddPlayerModal,
  LobbyHeaderPanel,
  LobbyLeaveConfirmModal,
  LobbyPlayersSection,
  LobbySettingsModal,
  LobbyStartDock,
} from '@/src/features/lobby/components';
import { useLobbyScreen } from '@/src/features/lobby/hooks/useLobbyScreen';
import { styles } from '@/src/features/lobby/styles/lobbyStyles';
import { useI18n } from '@/src/i18n';
import { resolveThemeSystemGradient, useTheme } from '@/src/theme';
import { Button, Card } from '@/src/ui/atoms';

export default function LobbyScreen() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const backgroundGradient = resolveThemeSystemGradient(theme.name);

  const {
    lobby,
    gameAccent,
    sessionRestoreStatus,
    settingsVisible,
    setSettingsVisible,
    leaveModalVisible,
    dismissLeaveLobby,
    confirmLeaveLobby,
    addModalVisible,
    addPlayerName,
    addPlayerError,
    closeAddPlayerModal,
    onAddPlayerNameChange,
    confirmAddPlayer,
    onBackToCatalog,
    headerPanelProps,
    playersSectionProps,
    settingsModalProps,
    startDockProps,
    realtimeError,
    reduceMotion,
  } = useLobbyScreen();

  if (!lobby) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
        <LinearGradient
          pointerEvents="none"
          colors={backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingWrap}>
          <Card style={styles.loadingCard}>
            {sessionRestoreStatus === 'restoring' ? (
              <ActivityIndicator size="small" color={theme.semantic.button.primary.bg} />
            ) : null}
            <Text
              style={[
                styles.loadingTitle,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {t('tabs.lobby')}
            </Text>
            <Text
              style={[
                styles.loadingSubtitle,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {sessionRestoreStatus === 'restoring'
                ? t('connection.reconnecting')
                : t('catalog.subtitle')}
            </Text>
            {sessionRestoreStatus === 'restoring' ? null : (
              <Button
                label={t('tabs.catalog')}
                onPress={onBackToCatalog}
                variant="secondary"
                style={styles.loadingButton}
              />
            )}
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
      <LinearGradient
        pointerEvents="none"
        colors={backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <LobbyHeaderPanel
          lobbyTitle={headerPanelProps.lobbyTitle}
          gameAccent={gameAccent}
          backLabel={headerPanelProps.panelCopy.backLabel}
          onPressBack={headerPanelProps.onPressBack}
          settingsLabel={headerPanelProps.panelCopy.settingsTitle}
          onOpenSettings={headerPanelProps.onOpenSettings}
          isRemoteLobby={headerPanelProps.isRemoteLobby}
          allowLocalPlayers={headerPanelProps.allowLocalPlayers}
          onlineOnlyBadgeLabel={headerPanelProps.panelCopy.onlineOnlyBadge}
          roomCode={headerPanelProps.roomCode}
          roomCodeLabel={headerPanelProps.roomCodeLabel}
          isRoomCodeHidden={headerPanelProps.isRoomCodeHidden}
          onCopyRoomCode={headerPanelProps.onCopyCode}
          onToggleRoomCodeHidden={headerPanelProps.onToggleRoomCodeVisibility}
          copied={headerPanelProps.copied}
          copyCodeLabel={headerPanelProps.copyCodeA11yLabel}
          showRoomCodeLabel={headerPanelProps.showCodeA11yLabel}
          hideRoomCodeLabel={headerPanelProps.hideCodeA11yLabel}
          codeCopiedLabel={headerPanelProps.copiedLabel}
          readyCount={headerPanelProps.readyCount}
          totalPlayers={headerPanelProps.totalPlayers}
          readyLabel={headerPanelProps.readyLabel}
          isImpostorLobby={headerPanelProps.isImpostorLobby}
          impostorLobbyBadgeLabel={headerPanelProps.impostorLobbyBadgeLabel}
          impostorContentModeLabel={headerPanelProps.impostorContentModeLabel}
          clueTimerBadgeLabel={headerPanelProps.clueTimerBadgeLabel}
        />

        <LobbyPlayersSection
          visiblePlayers={playersSectionProps.visiblePlayers}
          gameAccent={gameAccent}
          panelCopy={playersSectionProps.panelCopy}
          reduceMotion={reduceMotion}
          playerColumns={playersSectionProps.playerColumns}
          playerGap={playersSectionProps.playerGap}
          showAddCard={playersSectionProps.showAddCard}
          playersEmptyHint={playersSectionProps.playersEmptyHint}
          isRemoteLobby={headerPanelProps.isRemoteLobby}
          realtimeError={realtimeError}
          onToggleReady={playersSectionProps.onToggleReady}
          onRemove={playersSectionProps.onRemovePlayer}
          onRequestAddPlayer={playersSectionProps.onOpenAddPlayerModal}
        />
      </ScrollView>

      <LobbySettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        panelCopy={settingsModalProps.panelCopy}
        gameAccent={gameAccent}
        isSettingsEditable={settingsModalProps.isSettingsEditable}
        supportsOnlineSync={settingsModalProps.supportsOnlineSync}
        allowLocalPlayers={settingsModalProps.allowLocalPlayers}
        hasAnyMultiPlayerDevice={settingsModalProps.hasAnyMultiPlayerDevice}
        onSetAllowLocalPlayers={(allow) =>
          settingsModalProps.onUpdateSettings({
            [LOBBY_SETTINGS_KEYS.allowLocalPlayers]: allow,
          })
        }
        actionAuthorityMode={settingsModalProps.actionAuthorityMode}
        onSetActionAuthorityMode={(mode) =>
          settingsModalProps.onUpdateSettings({
            [LOBBY_SETTINGS_KEYS.actionAuthorityMode]: mode,
          })
        }
        isImpostorLobby={settingsModalProps.isImpostorLobby}
        impostorContentMode={settingsModalProps.impostorContentMode}
        onSetImpostorContentMode={(mode) =>
          settingsModalProps.onUpdateSettings({
            [LOBBY_SETTINGS_KEYS.impostorContentMode]: mode,
          })
        }
        impostorTargetPlayers={settingsModalProps.impostorTargetPlayers}
        minimumPlayers={settingsModalProps.minimumPlayers}
        maximumPlayers={settingsModalProps.maximumPlayers}
        onSetImpostorTargetPlayers={(value) =>
          settingsModalProps.onUpdateSettings({
            [LOBBY_SETTINGS_KEYS.impostorTargetPlayers]: value,
          })
        }
        impostorCount={settingsModalProps.impostorCount as 1 | 2}
        impostorClueTurnSeconds={settingsModalProps.impostorClueTurnSeconds}
        totalPlayers={settingsModalProps.totalPlayers}
        onSetImpostorCount={(value) =>
          settingsModalProps.onUpdateSettings({
            [LOBBY_SETTINGS_KEYS.impostorCount]: value,
          })
        }
        onSetImpostorClueTurnSeconds={(value) =>
          settingsModalProps.onUpdateSettings({
            [LOBBY_SETTINGS_KEYS.impostorClueTurnSeconds]: value,
          })
        }
      />

      <LobbyLeaveConfirmModal
        visible={leaveModalVisible}
        onClose={dismissLeaveLobby}
        onConfirmLeave={confirmLeaveLobby}
      />

      <LobbyAddPlayerModal
        visible={addModalVisible}
        name={addPlayerName}
        error={addPlayerError}
        gameAccent={gameAccent}
        onClose={closeAddPlayerModal}
        onChangeName={onAddPlayerNameChange}
        onConfirm={confirmAddPlayer}
      />

      <LobbyStartDock
        label={startDockProps.label}
        helperText={startDockProps.helperText}
        onStart={startDockProps.onStart}
        disabled={startDockProps.disabled}
        gameAccent={gameAccent}
      />
    </SafeAreaView>
  );
}
