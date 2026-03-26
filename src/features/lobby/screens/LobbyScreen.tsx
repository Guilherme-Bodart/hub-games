import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LobbyAddPlayerModal } from '@/src/features/lobby/components/LobbyAddPlayerModal';
import { LobbyHeaderPanel } from '@/src/features/lobby/components/LobbyHeaderPanel';
import { LobbyLeaveConfirmModal } from '@/src/features/lobby/components/LobbyLeaveConfirmModal';
import { LobbyLoadingState } from '@/src/features/lobby/components/LobbyLoadingState';
import { LobbyPlayersSection } from '@/src/features/lobby/components/LobbyPlayersSection';
import { LobbySettingsModal } from '@/src/features/lobby/components/LobbySettingsModal';
import { LobbyStartDock } from '@/src/features/lobby/components/LobbyStartDock';
import { useLobbyScreen } from '@/src/features/lobby/hooks/useLobbyScreen';
import { styles } from '@/src/features/lobby/lobby.styles';
import { useTheme } from '@/src/theme';

export function LobbyScreen() {
  const { theme } = useTheme();
  const {
    lobby,
    sessionRestoreStatus,
    settingsVisible,
    setSettingsVisible,
    realtimeError,
    realtimeHintColor,
    addModalVisible,
    addPlayerName,
    addPlayerError,
    leaveModalVisible,
    closeAddPlayerModal,
    dismissLeaveLobby,
    confirmLeaveLobby,
    confirmAddPlayer,
    onAddPlayerNameChange,
    onBackToCatalog,
    headerPanelProps,
    playersSectionProps,
    settingsModalProps,
    startDockProps,
  } = useLobbyScreen();

  if (!lobby) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
        <LobbyLoadingState
          restoring={sessionRestoreStatus === 'restoring'}
          onBackToCatalog={onBackToCatalog}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        pointerEvents="none"
        colors={['#FFF5D6', '#FFE8F2', '#E9E6FF', '#DDF3FF']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.lobbyMilkOverlay} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LobbyHeaderPanel {...headerPanelProps} />

        {realtimeError && lobby.mode === 'remote' ? (
          <Text
            style={[
              styles.realtimeHint,
              {
                color: realtimeHintColor,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {realtimeError}
          </Text>
        ) : null}

        <LobbyPlayersSection {...playersSectionProps} />
      </ScrollView>

      <LobbyAddPlayerModal
        visible={addModalVisible}
        name={addPlayerName}
        error={addPlayerError}
        onClose={closeAddPlayerModal}
        onChangeName={onAddPlayerNameChange}
        onConfirm={confirmAddPlayer}
      />

      <LobbyLeaveConfirmModal
        visible={leaveModalVisible}
        onClose={dismissLeaveLobby}
        onConfirmLeave={confirmLeaveLobby}
      />

      <LobbySettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        {...settingsModalProps}
      />

      <LobbyStartDock
        style={styles.bottomDock}
        label={startDockProps.label}
        onStart={startDockProps.onStart}
        disabled={startDockProps.disabled}
        startButtonStyle={styles.startButton}
      />
    </SafeAreaView>
  );
}

export default LobbyScreen;
