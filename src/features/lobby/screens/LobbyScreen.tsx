import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getGameById } from '@/src/features/catalog';
import { createImpostorRound } from '@/src/features/games/impostor/logic';
import {
  initializeRemoteImpostorRound,
  subscribeRemoteImpostorState,
} from '@/src/features/games/impostor/realtime';
import { createSintoniaRound } from '@/src/features/games/sintonia/logic';
import { initializeRemoteSintoniaRound } from '@/src/features/games/sintonia/realtime';
import {
  LOBBY_SETTINGS_KEYS,
  resolveImpostorContentMode,
  resolveImpostorCount,
  resolveImpostorRoundTargetPlayers,
  resolveLobbyActionAuthorityMode,
  useLobbySessionStore,
} from '@/src/features/lobby';
import {
  LobbyHeaderPanel,
  LobbyPlayersSection,
  LobbySettingsModal,
  type LobbySettingsCopy,
} from '@/src/features/lobby/components';
import { styles } from '@/src/features/lobby/styles/lobbyStyles';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { BottomActionDock, Button, Input, Modal } from '@/src/ui/atoms';
import { triggerGameFeedback } from '@/src/ui/feedback';
import { useReducedMotion } from '@/src/ui/motion';

const START_COUNTDOWN_MS = 3200;

export default function LobbyScreen() {
  const { theme } = useTheme();
  const { t, locale } = useI18n();
  const { width: viewportWidth } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const navigation = useNavigation();
  const allowLeaveRef = useRef(false);
  const handledRemoteRoundIdRef = useRef<string | null>(null);
  const consumedStartAtRef = useRef<number | null>(null);

  const lobby = useLobbySessionStore((state) => state.lobby);
  const realtimeStatus = useLobbySessionStore((state) => state.realtimeStatus);
  const realtimeError = useLobbySessionStore((state) => state.realtimeError);
  const sessionRestoreStatus = useLobbySessionStore((state) => state.sessionRestoreStatus);
  const addPlayer = useLobbySessionStore((state) => state.addPlayerToSelectedDevice);
  const togglePlayerReady = useLobbySessionStore((state) => state.togglePlayerReady);
  const removePlayer = useLobbySessionStore((state) => state.removePlayer);
  const updateGameSettings = useLobbySessionStore((state) => state.updateGameSettings);
  const scheduleRemoteStart = useLobbySessionStore((state) => state.scheduleRemoteStart);
  const clearRemoteStart = useLobbySessionStore((state) => state.clearRemoteStart);
  const endSession = useLobbySessionStore((state) => state.endSession);

  const [copied, setCopied] = useState(false);
  const [isRoomCodeHidden, setIsRoomCodeHidden] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [countdownTargetAt, setCountdownTargetAt] = useState<number | null>(null);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
  const [addPlayerModalVisible, setAddPlayerModalVisible] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  const visibleDevices = useMemo(() => {
    if (!lobby) {
      return [];
    }

    return lobby.mode === 'local'
      ? lobby.devices.filter((device) => device.isLocalDevice)
      : lobby.devices;
  }, [lobby]);

  const visiblePlayers = useMemo(
    () =>
      visibleDevices.flatMap((device) =>
        device.players.map((player) => ({
          player,
          isLocalDevice: device.isLocalDevice,
        }))
      ),
    [visibleDevices]
  );

  const totalPlayers = useMemo(
    () => visibleDevices.reduce((total, device) => total + device.players.length, 0),
    [visibleDevices]
  );

  const readyCount = useMemo(
    () =>
      visibleDevices.reduce(
        (total, device) => total + device.players.filter((player) => player.isReady).length,
        0
      ),
    [visibleDevices]
  );

  const selectedGame = lobby ? getGameById(lobby.gameId) : undefined;
  const minimumPlayers = selectedGame?.players.min ?? 1;
  const maximumPlayers = selectedGame?.players.max ?? Number.MAX_SAFE_INTEGER;
  const modeLabel = lobby
    ? lobby.mode === 'local'
      ? t('common.localMode')
      : t('common.remoteMode')
    : t('common.hybridMode');
  const isLocalHost = useMemo(() => {
    if (!lobby) {
      return false;
    }

    return (
      lobby.devices
        .find((device) => device.id === lobby.selectedDeviceId)
        ?.players.some((player) => player.isHost) ?? false
    );
  }, [lobby]);

  const actionAuthorityMode = lobby
    ? resolveLobbyActionAuthorityMode(lobby.gameSettings)
    : 'host-only';
  const isImpostorLobby = lobby?.gameId === 'impostor-neon';
  const isRemoteImpostorLobby = lobby?.mode === 'remote' && isImpostorLobby;
  const isRemoteSintoniaLobby = lobby?.mode === 'remote' && lobby?.gameId === 'sintonia';
  const impostorContentMode = lobby ? resolveImpostorContentMode(lobby.gameSettings) : 'words';
  const impostorTargetPlayers = lobby ? resolveImpostorRoundTargetPlayers(lobby.gameSettings) : 12;
  const impostorCount = lobby ? resolveImpostorCount(lobby.gameSettings) : 1;

  const lobbyPlayersLimit = isImpostorLobby
    ? Math.min(impostorTargetPlayers, maximumPlayers)
    : maximumPlayers;

  const tooManyPlayers = totalPlayers > lobbyPlayersLimit;
  const canAddPlayer = totalPlayers < lobbyPlayersLimit;
  const showAddCard = canAddPlayer;
  const canStartGame =
    totalPlayers >= minimumPlayers && !tooManyPlayers && readyCount === totalPlayers;
  const canHostStartThisLobby = lobby?.mode === 'remote' ? isLocalHost : true;
  const isSettingsEditable = isLocalHost;

  const playersEmptyHint = t('lobby.emptyPlayersHint');

  const impostorLobbyBadgeLabel = t('lobby.impostorCount', {
    count: impostorCount,
    suffix: impostorCount > 1 ? (locale === 'pt' ? 'es' : 's') : '',
  });

  const remoteStatusTone =
    realtimeStatus === 'connected'
      ? 'success'
      : realtimeStatus === 'connecting' ||
          realtimeStatus === 'reconnecting' ||
          realtimeStatus === 'idle'
        ? 'neutral'
        : 'error';

  const remoteStatusLabel =
    realtimeStatus === 'connected'
      ? t('connection.online')
      : realtimeStatus === 'connecting' ||
          realtimeStatus === 'reconnecting' ||
          realtimeStatus === 'idle'
        ? t('connection.reconnecting')
        : t('connection.error');

  const lobbyTitle = selectedGame ? selectedGame.title[locale] : t('tabs.lobby');
  const playerColumns =
    viewportWidth >= 980 ? 6 : viewportWidth >= 760 ? 4 : viewportWidth >= 560 ? 3 : 2;
  const playerGridHorizontalPadding = 32;
  const playerGridMaxWidth = 620;
  const playerGridGap = 12;
  const playerGridWidth = Math.min(
    playerGridMaxWidth,
    Math.max(0, viewportWidth - playerGridHorizontalPadding)
  );
  const playerCellWidth = Math.max(
    78,
    Math.floor((playerGridWidth - playerGridGap * (playerColumns - 1)) / playerColumns)
  );

  const panelCopy: LobbySettingsCopy & {
    waitingHostStart: string;
    countdownStarting: string;
  } = {
    settingsTitle: t('lobby.settingsTitle'),
    controlMode: t('lobby.controlMode'),
    hostOnly: t('lobby.hostOnly'),
    collaborative: t('lobby.collaborative'),
    impostorMode: t('lobby.impostorMode'),
    words: t('lobby.words'),
    questions: t('lobby.questions'),
    roundPlayers: t('lobby.roundPlayers'),
    impostors: t('lobby.impostors'),
    hostOnlyHint: t('lobby.hostOnlyHint'),
    waitingHostStart: t('lobby.waitingHostStart'),
    countdownStarting: t('lobby.countdownStarting'),
  };

  useEffect(() => {
    navigation.setOptions({
      title: t('tabs.lobby'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#2B2A46',
      headerTitleStyle: {
        fontFamily: theme.semantic.typography.titleFamily,
        fontWeight: theme.semantic.typography.titleWeight,
      },
    });
  }, [navigation, t, theme.semantic.typography.titleFamily, theme.semantic.typography.titleWeight]);

  const leaveLobby = useCallback(() => {
    allowLeaveRef.current = true;
    if (lobby?.mode === 'remote' && isLocalHost) {
      void clearRemoteStart().catch(() => undefined);
    }
    endSession();

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)');
  }, [clearRemoteStart, endSession, isLocalHost, lobby?.mode, router]);

  useEffect(() => {
    if (!lobby) {
      return;
    }

    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (allowLeaveRef.current) {
        return;
      }

      event.preventDefault();
      setLeaveConfirmVisible(true);
    });

    return unsubscribe;
  }, [lobby, navigation]);

  const handleCancelLeave = useCallback(() => {
    setLeaveConfirmVisible(false);
  }, []);

  const handleConfirmLeave = useCallback(() => {
    setLeaveConfirmVisible(false);
    leaveLobby();
  }, [leaveLobby]);

  useEffect(() => {
    if (!lobby || !isRemoteImpostorLobby) {
      handledRemoteRoundIdRef.current = null;
      return;
    }

    const unsubscribe = subscribeRemoteImpostorState({
      roomCode: lobby.roomCode,
      onState: (round) => {
        if (!round) {
          return;
        }

        if (handledRemoteRoundIdRef.current === round.id) {
          return;
        }

        handledRemoteRoundIdRef.current = round.id;
        router.push({
          pathname: '/game/[gameId]',
          params: { gameId: lobby.gameId },
        });
      },
      onError: (_message) => undefined,
    });

    return unsubscribe;
  }, [isRemoteImpostorLobby, lobby, router]);

  const startGameNow = useCallback(async () => {
    if (!lobby) {
      return;
    }

    if (isRemoteImpostorLobby && isLocalHost) {
      try {
        const initialRound = createImpostorRound({ lobby, locale });
        handledRemoteRoundIdRef.current = initialRound.id;
        await initializeRemoteImpostorRound(lobby.roomCode, initialRound, lobby.selectedDeviceId);
      } catch (error) {
        Alert.alert(
          selectedGame?.title[locale] ?? t('tabs.lobby'),
          error instanceof Error && error.message
            ? error.message
            : t('lobby.startErrorImpostor')
        );
        return;
      }
    }

    if (isRemoteSintoniaLobby && isLocalHost) {
      try {
        const initialRound = createSintoniaRound({ lobby, locale });
        await initializeRemoteSintoniaRound(lobby.roomCode, initialRound, lobby.selectedDeviceId);
      } catch (error) {
        Alert.alert(
          selectedGame?.title[locale] ?? t('tabs.lobby'),
          error instanceof Error && error.message
            ? error.message
            : t('lobby.startErrorSintonia')
        );
        return;
      }
    }

    triggerGameFeedback('result');
    router.push({
      pathname: '/game/[gameId]',
      params: { gameId: lobby.gameId },
    });
  }, [
    isLocalHost,
    isRemoteImpostorLobby,
    isRemoteSintoniaLobby,
    lobby,
    locale,
    router,
    selectedGame,
    t,
  ]);

  const beginStartSequence = useCallback(async () => {
    if (!lobby || !canStartGame || !canHostStartThisLobby) {
      return;
    }

    const targetAt = Date.now() + START_COUNTDOWN_MS;

    if (lobby.mode === 'remote') {
      try {
        await scheduleRemoteStart(targetAt);
      } catch (error) {
        Alert.alert(
          t('tabs.lobby'),
          error instanceof Error && error.message ? error.message : t('connection.error')
        );
      }
      return;
    }

    setCountdownTargetAt(targetAt);
    triggerGameFeedback('confirm');
  }, [canHostStartThisLobby, canStartGame, lobby, scheduleRemoteStart, t]);

  useEffect(() => {
    if (!lobby || lobby.mode !== 'remote') {
      consumedStartAtRef.current = null;
      return;
    }

    setCountdownTargetAt(lobby.startAt);
  }, [lobby?.mode, lobby?.startAt]);

  useEffect(() => {
    if (!countdownTargetAt || !lobby) {
      setCountdownValue(null);
      return;
    }

    const syncCountdown = () => {
      const remainingMs = countdownTargetAt - Date.now();
      const nextValue = Math.max(0, Math.ceil(remainingMs / 1000));
      setCountdownValue(nextValue);

      if (remainingMs > 0) {
        return;
      }

      if (consumedStartAtRef.current === countdownTargetAt) {
        return;
      }

      consumedStartAtRef.current = countdownTargetAt;
      setCountdownTargetAt(null);

      void (async () => {
        await startGameNow();

        if (lobby.mode === 'remote' && isLocalHost) {
          setTimeout(() => {
            void clearRemoteStart().catch(() => undefined);
          }, 1600);
        }
      })();
    };

    syncCountdown();
    const interval = setInterval(syncCountdown, 120);

    return () => {
      clearInterval(interval);
    };
  }, [clearRemoteStart, countdownTargetAt, isLocalHost, lobby, startGameNow]);

  const handleCopyRoomCode = useCallback(() => {
    if (!lobby) {
      return;
    }

    void Clipboard.setStringAsync(lobby.roomCode);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }, [lobby]);

  const handleToggleRoomCodeHidden = useCallback(() => {
    setIsRoomCodeHidden((current) => !current);
    void Haptics.selectionAsync();
  }, []);

  const handleToggleReady = useCallback(
    (playerId: string, isLocalDevice: boolean) => {
      if (!isLocalDevice) {
        return;
      }

      void Haptics.selectionAsync();
      togglePlayerReady(playerId);
    },
    [togglePlayerReady]
  );

  const handleAddPlayer = useCallback(
    (name: string) => {
      addPlayer(name);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [addPlayer]
  );

  const handleRequestAddPlayer = useCallback(() => {
    setNewPlayerName('');
    setAddPlayerModalVisible(true);
  }, []);

  const handleCloseAddPlayerModal = useCallback(() => {
    setAddPlayerModalVisible(false);
    setNewPlayerName('');
  }, []);

  const handleConfirmAddPlayer = useCallback(() => {
    const trimmedName = newPlayerName.trim();

    if (!trimmedName) {
      return;
    }

    handleAddPlayer(trimmedName);
    setAddPlayerModalVisible(false);
    setNewPlayerName('');
  }, [handleAddPlayer, newPlayerName]);

  if (!lobby) {
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
        <View style={styles.loadingWrap}>
          <View style={styles.loadingCard}>
            {sessionRestoreStatus === 'restoring' ? (
              <ActivityIndicator size="small" color="#5B69D8" />
            ) : null}
            <Text
              style={[
                styles.loadingTitle,
                {
                  color: '#2B2A46',
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
                  color: '#5C5F7A',
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
                onPress={() => router.replace('/(tabs)')}
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
        colors={['#FFF5D6', '#FFE8F2', '#E9E6FF', '#DDF3FF']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.lobbyMilkOverlay} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LobbyHeaderPanel
          lobbyTitle={lobbyTitle}
          settingsLabel={panelCopy.settingsTitle}
          onOpenSettings={() => setSettingsVisible(true)}
          countdownValue={countdownValue}
          countdownStartingLabel={panelCopy.countdownStarting}
          isRemoteLobby={lobby.mode === 'remote'}
          roomCode={lobby.roomCode}
          isRoomCodeHidden={isRoomCodeHidden}
          onCopyRoomCode={handleCopyRoomCode}
          onToggleRoomCodeHidden={handleToggleRoomCodeHidden}
          copied={copied}
          copyCodeLabel={t('lobby.copyCode')}
          showRoomCodeLabel={t('lobby.showRoomCode')}
          hideRoomCodeLabel={t('lobby.hideRoomCode')}
          codeCopiedLabel={t('lobby.codeCopied')}
          readyCount={readyCount}
          totalPlayers={totalPlayers}
          readyLabel={t('common.ready')}
          isImpostorLobby={isImpostorLobby}
          impostorLobbyBadgeLabel={impostorLobbyBadgeLabel}
          modeLabel={modeLabel}
          remoteStatusTone={remoteStatusTone}
          remoteStatusLabel={remoteStatusLabel}
        />

        <LobbyPlayersSection
          visiblePlayers={visiblePlayers}
          reduceMotion={reduceMotion}
          playerCellWidth={playerCellWidth}
          playerColumns={playerColumns}
          playerGap={playerGridGap}
          showAddCard={showAddCard}
          playersEmptyHint={playersEmptyHint}
          isRemoteLobby={lobby.mode === 'remote'}
          realtimeError={realtimeError}
          onToggleReady={handleToggleReady}
          onRemove={removePlayer}
          onRequestAddPlayer={handleRequestAddPlayer}
        />
      </ScrollView>

      <LobbySettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        panelCopy={panelCopy}
        isSettingsEditable={isSettingsEditable}
        actionAuthorityMode={actionAuthorityMode}
        onSetActionAuthorityMode={(mode) =>
          updateGameSettings({
            [LOBBY_SETTINGS_KEYS.actionAuthorityMode]: mode,
          })
        }
        isImpostorLobby={isImpostorLobby}
        impostorContentMode={impostorContentMode}
        onSetImpostorContentMode={(mode) =>
          updateGameSettings({
            [LOBBY_SETTINGS_KEYS.impostorContentMode]: mode,
          })
        }
        impostorTargetPlayers={impostorTargetPlayers}
        minimumPlayers={minimumPlayers}
        maximumPlayers={maximumPlayers}
        onSetImpostorTargetPlayers={(value) =>
          updateGameSettings({
            [LOBBY_SETTINGS_KEYS.impostorTargetPlayers]: value,
          })
        }
        impostorCount={impostorCount as 1 | 2}
        totalPlayers={totalPlayers}
        onSetImpostorCount={(value) =>
          updateGameSettings({
            [LOBBY_SETTINGS_KEYS.impostorCount]: value,
          })
        }
      />

      <Modal
        visible={leaveConfirmVisible}
        onClose={handleCancelLeave}
        title={t('lobby.leaveConfirmTitle')}
        closeStyle="solid"
        style={styles.leaveModal}>
        <Text
          style={[
            styles.leaveMessage,
            {
              color: '#5C5F7A',
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {t('lobby.leaveConfirmMessage')}
        </Text>
        <View style={styles.leaveActions}>
          <Button
            label={t('common.leave')}
            onPress={handleConfirmLeave}
            variant="ghost"
            color="#FFFFFF"
            textColor="#D95C7C"
          />
        </View>
      </Modal>

      <Modal
        visible={addPlayerModalVisible}
        onClose={handleCloseAddPlayerModal}
        title={t('lobby.addPersonThisDevice')}
        closeStyle="solid"
        style={styles.addPlayerModal}>
        <Input
          value={newPlayerName}
          onChangeText={setNewPlayerName}
          placeholder={t('lobby.addPersonPlaceholder')}
          accessibilityLabel={t('lobby.addPersonPlaceholder')}
          style={styles.addPlayerInput}
        />
        <View style={styles.addPlayerActions}>
          <Button
            label={t('lobby.addPlayerA11y')}
            onPress={handleConfirmAddPlayer}
            disabled={!newPlayerName.trim()}
            variant="primary"
          />
        </View>
      </Modal>

      <BottomActionDock
        style={styles.bottomDock}
        primaryAction={{
          label:
            countdownValue !== null
              ? `${panelCopy.countdownStarting} ${countdownValue}`
              : canStartGame && canHostStartThisLobby
                ? t('lobby.startGame')
                : tooManyPlayers
                  ? t('lobby.tooManyPlayers', { max: lobbyPlayersLimit })
                  : totalPlayers < minimumPlayers
                    ? t('lobby.needMorePlayers', { min: minimumPlayers })
                    : !canHostStartThisLobby
                      ? panelCopy.waitingHostStart
                      : t('lobby.waiting', { ready: readyCount, total: totalPlayers }),
          onPress: () => {
            void beginStartSequence();
          },
          disabled: !canStartGame || !canHostStartThisLobby || countdownValue !== null,
          variant: 'primary',
          color: '#F47D74',
          textColor: '#20255C',
        }}
      />
    </SafeAreaView>
  );
}
