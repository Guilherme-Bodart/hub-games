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
import { useTheme } from '@/src/theme';
import { Button } from '@/src/ui/atoms';

const LOBBY_BACKGROUND_GRADIENT = ['#FFF5D6', '#FFE8F2', '#E9E6FF', '#DDF3FF'] as const;

export default function LobbyScreen() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const {
    lobby,
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
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          pointerEvents="none"
          colors={LOBBY_BACKGROUND_GRADIENT}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.lobbyMilkOverlay} />
        <View style={styles.loadingWrap}>
          <View style={styles.loadingCard}>
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
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        pointerEvents="none"
        colors={LOBBY_BACKGROUND_GRADIENT}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.lobbyMilkOverlay} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LobbyHeaderPanel
          lobbyTitle={headerPanelProps.lobbyTitle}
          settingsLabel={headerPanelProps.panelCopy.settingsTitle}
          onOpenSettings={headerPanelProps.onOpenSettings}
          countdownValue={headerPanelProps.countdownValue}
          countdownStartingLabel={headerPanelProps.panelCopy.countdownStarting}
          isRemoteLobby={headerPanelProps.isRemoteLobby}
          roomCode={headerPanelProps.roomCode}
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
          modeLabel={headerPanelProps.modeLabel}
          remoteStatusTone={headerPanelProps.remoteStatusTone}
          remoteStatusLabel={headerPanelProps.remoteStatusLabel}
        />

        <LobbyPlayersSection
          visiblePlayers={playersSectionProps.visiblePlayers}
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
        isSettingsEditable={settingsModalProps.isSettingsEditable}
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
        onClose={closeAddPlayerModal}
        onChangeName={onAddPlayerNameChange}
        onConfirm={confirmAddPlayer}
      />

      <LobbyStartDock
        style={styles.bottomDock}
        label={startDockProps.label}
        onStart={startDockProps.onStart}
        disabled={startDockProps.disabled}
        startButtonStyle={{
          backgroundColor: '#F47D74',
          borderColor: '#E86B63',
          borderBottomColor: '#D85D56',
        }}
      />
    </SafeAreaView>
  );
}
