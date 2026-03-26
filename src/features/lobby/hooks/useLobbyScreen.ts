import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, useWindowDimensions } from 'react-native';

import { createImpostorRound } from '@/src/features/games/impostor/logic';
import {
  initializeRemoteImpostorRound,
  subscribeRemoteImpostorState,
} from '@/src/features/games/impostor/realtime';
import { createSintoniaRound } from '@/src/features/games/sintonia/logic';
import { initializeRemoteSintoniaRound } from '@/src/features/games/sintonia/realtime';
import { useLobbyDerivedState } from '@/src/features/lobby/hooks/useLobbyDerivedState';
import { useLobbyPlayerModals } from '@/src/features/lobby/hooks/useLobbyPlayerModals';
import { START_COUNTDOWN_MS } from '@/src/features/lobby/lobby.constants';
import type { LobbyPanelCopy, VisibleLobbyPlayer } from '@/src/features/lobby/lobby.types';
import { useLobbySessionStore } from '@/src/features/lobby/store';
import { useI18n, type Locale } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { triggerGameFeedback } from '@/src/ui/feedback';
import { useReducedMotion } from '@/src/ui/motion';

type UseLobbyScreenResult = {
  locale: Locale;
  loadingBackgroundColor: string;
  lobby: ReturnType<typeof useLobbySessionStore.getState>['lobby'];
  sessionRestoreStatus: ReturnType<typeof useLobbySessionStore.getState>['sessionRestoreStatus'];
  reduceMotion: boolean;
  settingsVisible: boolean;
  setSettingsVisible: (visible: boolean) => void;
  realtimeError: string | null;
  realtimeHintColor: string;
  addModalVisible: boolean;
  addPlayerName: string;
  addPlayerError: string | null;
  leaveModalVisible: boolean;
  closeAddPlayerModal: () => void;
  dismissLeaveLobby: () => void;
  confirmLeaveLobby: () => void;
  confirmAddPlayer: () => void;
  onAddPlayerNameChange: (value: string) => void;
  onBackToCatalog: () => void;
  headerPanelProps: {
    lobbyTitle: string;
    panelCopy: LobbyPanelCopy;
    onOpenSettings: () => void;
    countdownValue: number | null;
    isRemoteLobby: boolean;
    roomCode: string;
    isRoomCodeHidden: boolean;
    onCopyCode: () => void;
    onToggleRoomCodeVisibility: () => void;
    copied: boolean;
    copiedLabel: string;
    copyCodeA11yLabel: string;
    showCodeA11yLabel: string;
    hideCodeA11yLabel: string;
    isCompactViewport: boolean;
    readyCount: number;
    totalPlayers: number;
    readyLabel: string;
    isImpostorLobby: boolean;
    impostorLobbyBadgeLabel: string;
    modeLabel: string;
    remoteStatusLabel: string;
    remoteStatusTone: 'success' | 'neutral' | 'error';
  };
  playersSectionProps: {
    locale: Locale;
    visiblePlayers: VisibleLobbyPlayer[];
    showAddCard: boolean;
    playersEmptyHint: string;
    reduceMotion: boolean;
    playerCellWidth: `${number}%`;
    onToggleReady: (playerId: string, isLocalDevice: boolean) => void;
    onRemovePlayer: (playerId: string) => void;
    onOpenAddPlayerModal: () => void;
  };
  settingsModalProps: {
    panelCopy: LobbyPanelCopy;
    isSettingsEditable: boolean;
    actionAuthorityMode: 'host-only' | 'collaborative';
    isImpostorLobby: boolean;
    impostorContentMode: 'words' | 'questions';
    impostorTargetPlayers: number;
    impostorCount: number;
    minimumPlayers: number;
    maximumPlayers: number;
    totalPlayers: number;
    onUpdateSettings: ReturnType<typeof useLobbySessionStore.getState>['updateGameSettings'];
  };
  startDockProps: {
    label: string;
    onStart: () => void;
    disabled: boolean;
  };
};

export function useLobbyScreen(): UseLobbyScreenResult {
  const { theme } = useTheme();
  const { t, locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const { width: viewportWidth } = useWindowDimensions();
  const navigation = useNavigation();
  const router = useRouter();
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
  const {
    visiblePlayers,
    totalPlayers,
    readyCount,
    minimumPlayers,
    maximumPlayers,
    lobbyTitle,
    modeLabel,
    isLocalHost,
    actionAuthorityMode,
    isImpostorLobby,
    isRemoteImpostorLobby,
    isRemoteSintoniaLobby,
    impostorContentMode,
    impostorTargetPlayers,
    impostorCount,
    lobbyPlayersLimit,
    tooManyPlayers,
    canAddPlayer,
    showAddCard,
    canStartGame,
    canHostStartThisLobby,
    isSettingsEditable,
    isCompactViewport,
    playerCellWidth,
    nextAutoName,
    panelCopy,
    playersEmptyHint,
    impostorLobbyBadgeLabel,
    roomCodeLabels,
    remoteStatusTone,
    remoteStatusLabel,
  } = useLobbyDerivedState({
    lobby,
    locale,
    viewportWidth,
    realtimeStatus,
    t,
  });
  const {
    addModalVisible,
    addPlayerName,
    addPlayerError,
    leaveModalVisible,
    openAddPlayerModal,
    closeAddPlayerModal,
    confirmAddPlayer,
    onAddPlayerNameChange,
    openLeaveModal,
    closeLeaveModal,
  } = useLobbyPlayerModals({
    canAddPlayer,
    nextAutoName,
    locale,
    addPlayer,
  });

  useEffect(() => {
    navigation.setOptions({
      title: t('tabs.lobby'),
      headerShadowVisible: false,
      headerStyle: { backgroundColor: '#FFFFFF' },
      headerTintColor: '#2B2A46',
      headerTitleStyle: {
        color: '#2B2A46',
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

      if (Platform.OS === 'web') {
        const shouldLeave = globalThis.confirm ? globalThis.confirm(t('lobby.leaveConfirmMessage')) : true;
        if (shouldLeave) {
          leaveLobby();
        }
        return;
      }

      openLeaveModal();
    });

    return unsubscribe;
  }, [leaveLobby, lobby, navigation, openLeaveModal, t]);

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
      onError: () => undefined,
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
          'Impostor Neon',
          error instanceof Error && error.message ? error.message : 'Nao foi possivel iniciar a partida agora.'
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
          'Sintonia',
          error instanceof Error && error.message ? error.message : 'Nao foi possivel iniciar a rodada agora.'
        );
        return;
      }
    }

    triggerGameFeedback('result');
    router.push({
      pathname: '/game/[gameId]',
      params: { gameId: lobby.gameId },
    });
  }, [isLocalHost, isRemoteImpostorLobby, isRemoteSintoniaLobby, lobby, locale, router]);

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
    return () => clearInterval(interval);
  }, [clearRemoteStart, countdownTargetAt, isLocalHost, lobby, startGameNow]);

  const dismissLeaveLobby = useCallback(() => {
    closeLeaveModal();
  }, [closeLeaveModal]);

  const confirmLeaveLobby = useCallback(() => {
    closeLeaveModal();
    leaveLobby();
  }, [closeLeaveModal, leaveLobby]);

  const headerPanelProps: UseLobbyScreenResult['headerPanelProps'] = {
    lobbyTitle,
    panelCopy,
    onOpenSettings: () => setSettingsVisible(true),
    countdownValue,
    isRemoteLobby: lobby?.mode === 'remote',
    roomCode: lobby?.roomCode ?? '',
    isRoomCodeHidden,
    onCopyCode: () => {
      if (!lobby) {
        return;
      }
      void Clipboard.setStringAsync(lobby.roomCode);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    },
    onToggleRoomCodeVisibility: () => {
      setIsRoomCodeHidden((current) => !current);
      void Haptics.selectionAsync();
    },
    copied,
    copiedLabel: t('lobby.codeCopied'),
    copyCodeA11yLabel: t('lobby.copyCode'),
    showCodeA11yLabel: roomCodeLabels.showLabel,
    hideCodeA11yLabel: roomCodeLabels.hideLabel,
    isCompactViewport,
    readyCount,
    totalPlayers,
    readyLabel: t('common.ready'),
    isImpostorLobby,
    impostorLobbyBadgeLabel,
    modeLabel,
    remoteStatusLabel,
    remoteStatusTone,
  };

  const playersSectionProps: UseLobbyScreenResult['playersSectionProps'] = {
    locale,
    visiblePlayers,
    showAddCard,
    playersEmptyHint,
    reduceMotion,
    playerCellWidth,
    onToggleReady: (playerId, isLocalDevice) => {
      if (!isLocalDevice) {
        return;
      }
      void Haptics.selectionAsync();
      togglePlayerReady(playerId);
    },
    onRemovePlayer: (playerId) => removePlayer(playerId),
    onOpenAddPlayerModal: openAddPlayerModal,
  };

  const settingsModalProps: UseLobbyScreenResult['settingsModalProps'] = {
    panelCopy,
    isSettingsEditable,
    actionAuthorityMode,
    isImpostorLobby,
    impostorContentMode,
    impostorTargetPlayers,
    impostorCount,
    minimumPlayers,
    maximumPlayers,
    totalPlayers,
    onUpdateSettings: updateGameSettings,
  };

  const startDockLabel =
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
              : t('lobby.waiting', { ready: readyCount, total: totalPlayers });

  return {
    locale,
    loadingBackgroundColor: theme.semantic.bg.app,
    lobby,
    sessionRestoreStatus,
    reduceMotion,
    settingsVisible,
    setSettingsVisible,
    realtimeError,
    realtimeHintColor: theme.semantic.status.warning,
    addModalVisible,
    addPlayerName,
    addPlayerError,
    leaveModalVisible,
    closeAddPlayerModal,
    dismissLeaveLobby,
    confirmLeaveLobby,
    confirmAddPlayer,
    onAddPlayerNameChange,
    onBackToCatalog: () => router.replace('/(tabs)'),
    headerPanelProps,
    playersSectionProps,
    settingsModalProps,
    startDockProps: {
      label: startDockLabel,
      onStart: () => {
        void beginStartSequence();
      },
      disabled: !canStartGame || !canHostStartThisLobby || countdownValue !== null,
    },
  };
}
