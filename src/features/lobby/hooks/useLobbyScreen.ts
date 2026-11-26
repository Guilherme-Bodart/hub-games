import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import { useLobbyDerivedState } from '@/src/features/lobby/hooks/useLobbyDerivedState';
import { useLobbyNavigationGuard } from '@/src/features/lobby/hooks/useLobbyNavigationGuard';
import { useLobbyPlayerModals } from '@/src/features/lobby/hooks/useLobbyPlayerModals';
import { useLobbyRoomCodeState } from '@/src/features/lobby/hooks/useLobbyRoomCodeState';
import { useLobbyStartSequence } from '@/src/features/lobby/hooks/useLobbyStartSequence';
import type { LobbyPanelCopy, VisibleLobbyPlayer } from '@/src/features/lobby/lobby.types';
import { useLobbySessionStore } from '@/src/features/lobby/lobbySessionStore';
import { useI18n, type Locale } from '@/src/i18n';
import { type GameAccentPalette, getGameAccent, useTheme } from '@/src/theme';
import { useReducedMotion } from '@/src/ui/motion';

type UseLobbyScreenResult = {
  locale: Locale;
  lobby: ReturnType<typeof useLobbySessionStore.getState>['lobby'];
  gameAccent: GameAccentPalette;
  sessionRestoreStatus: ReturnType<typeof useLobbySessionStore.getState>['sessionRestoreStatus'];
  reduceMotion: boolean;
  settingsVisible: boolean;
  setSettingsVisible: (visible: boolean) => void;
  realtimeError: string | null;
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
    onPressBack: () => void;
    onOpenSettings: () => void;
    isRemoteLobby: boolean;
    allowLocalPlayers: boolean;
    roomCode: string;
    roomCodeLabel: string;
    isRoomCodeHidden: boolean;
    onCopyCode: () => void;
    onToggleRoomCodeVisibility: () => void;
    copied: boolean;
    copiedLabel: string;
    copyCodeA11yLabel: string;
    showCodeA11yLabel: string;
    hideCodeA11yLabel: string;
    readyCount: number;
    totalPlayers: number;
    readyLabel: string;
    isImpostorLobby: boolean;
    impostorLobbyBadgeLabel: string;
    impostorContentModeLabel: string | null;
    clueTimerBadgeLabel: string | null;
  };
  playersSectionProps: {
    panelCopy: LobbyPanelCopy;
    visiblePlayers: VisibleLobbyPlayer[];
    showAddCard: boolean;
    playersEmptyHint: string;
    playerColumns: number;
    playerGap: number;
    onToggleReady: (playerId: string, isLocalDevice: boolean) => void;
    onRemovePlayer: (playerId: string) => void;
    onOpenAddPlayerModal: () => void;
  };
  settingsModalProps: {
    panelCopy: LobbyPanelCopy;
    isSettingsEditable: boolean;
    supportsOnlineSync: boolean;
    allowLocalPlayers: boolean;
    hasAnyMultiPlayerDevice: boolean;
    actionAuthorityMode: 'host-only' | 'collaborative';
    isImpostorLobby: boolean;
    impostorContentMode: 'words' | 'questions';
    impostorTargetPlayers: number;
    impostorCount: number;
    impostorClueTurnSeconds: 10 | 20 | 30;
    minimumPlayers: number;
    maximumPlayers: number;
    totalPlayers: number;
    onUpdateSettings: ReturnType<typeof useLobbySessionStore.getState>['updateGameSettings'];
  };
  startDockProps: {
    label: string;
    helperText?: string;
    onStart: () => void;
    disabled: boolean;
  };
};

export function useLobbyScreen(): UseLobbyScreenResult {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const { width: viewportWidth } = useWindowDimensions();

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

  const [settingsVisible, setSettingsVisible] = useState(false);

  const gameAccent = useMemo(() => getGameAccent(lobby?.gameId), [lobby?.gameId]);

  const derived = useLobbyDerivedState({
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
    openAddPlayerModal,
    closeAddPlayerModal,
    confirmAddPlayer,
    onAddPlayerNameChange,
  } = useLobbyPlayerModals({
    canAddPlayer: derived.canAddPlayer,
    nextAutoName: derived.nextAutoName,
    locale,
    addPlayer,
  });

  const { copied, isRoomCodeHidden, onCopyCode, onToggleRoomCodeVisibility } =
    useLobbyRoomCodeState({ roomCode: lobby?.roomCode ?? null });

  const { countdownValue, beginStartSequence } = useLobbyStartSequence({
    lobby,
    locale,
    isLocalHost: derived.isLocalHost,
    isRemoteImpostorLobby: derived.isRemoteImpostorLobby,
    isRemoteSintoniaLobby: derived.isRemoteSintoniaLobby,
    canStartGame: derived.canStartGame,
    canHostStartThisLobby: derived.canHostStartThisLobby,
    scheduleRemoteStart,
    clearRemoteStart,
    t,
  });

  const { leaveModalVisible, dismissLeaveLobby, confirmLeaveLobby, onBackToCatalog } =
    useLobbyNavigationGuard({
      lobby,
      isLocalHost: derived.isLocalHost,
      clearRemoteStart,
      endSession,
      title: t('tabs.lobby'),
      leaveConfirmMessage: t('lobby.leaveConfirmMessage'),
      headerFamily: theme.semantic.typography.titleFamily,
      headerWeight: theme.semantic.typography.titleWeight,
      headerTextColor: theme.semantic.text.primary,
      headerBackgroundColor: theme.semantic.bg.surface,
    });

  const onPressBack = useCallback(() => {
    if (!lobby) {
      onBackToCatalog();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    onBackToCatalog();
  }, [lobby, onBackToCatalog, router]);

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

  const startDockLabel = useMemo(() => {
    if (derived.canStartGame && derived.canHostStartThisLobby) {
      return t('lobby.startGame');
    }
    if (derived.tooManyPlayers) {
      return t('lobby.tooManyPlayers', { max: derived.lobbyPlayersLimit });
    }
    if (derived.totalPlayers < derived.minimumPlayers) {
      return t('lobby.needMorePlayers', { min: derived.minimumPlayers });
    }
    if (!derived.canHostStartThisLobby) {
      return derived.panelCopy.waitingHostStart;
    }
    return t('lobby.waiting', { ready: derived.readyCount, total: derived.totalPlayers });
  }, [
    derived.canHostStartThisLobby,
    derived.canStartGame,
    derived.lobbyPlayersLimit,
    derived.minimumPlayers,
    derived.panelCopy.waitingHostStart,
    derived.readyCount,
    derived.tooManyPlayers,
    derived.totalPlayers,
    t,
  ]);

  return {
    locale,
    lobby,
    gameAccent,
    sessionRestoreStatus,
    reduceMotion,
    settingsVisible,
    setSettingsVisible,
    realtimeError,
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
    headerPanelProps: {
      lobbyTitle: derived.lobbyTitle,
      panelCopy: derived.panelCopy,
      onPressBack,
      onOpenSettings: () => setSettingsVisible(true),
      isRemoteLobby: lobby?.mode === 'remote',
      allowLocalPlayers: derived.allowLocalPlayers,
      roomCode: lobby?.roomCode ?? '',
      roomCodeLabel: t('lobby.roomCodeLabel'),
      isRoomCodeHidden,
      onCopyCode,
      onToggleRoomCodeVisibility,
      copied,
      copiedLabel: t('lobby.codeCopied'),
      copyCodeA11yLabel: t('lobby.copyCode'),
      showCodeA11yLabel: derived.roomCodeLabels.showLabel,
      hideCodeA11yLabel: derived.roomCodeLabels.hideLabel,
      readyCount: derived.readyCount,
      totalPlayers: derived.totalPlayers,
      readyLabel: t('common.ready'),
      isImpostorLobby: derived.isImpostorLobby,
      impostorLobbyBadgeLabel: derived.impostorLobbyBadgeLabel,
      impostorContentModeLabel: derived.impostorContentModeLabel,
      clueTimerBadgeLabel: derived.clueTimerBadgeLabel,
    },
    playersSectionProps: {
      panelCopy: derived.panelCopy,
      visiblePlayers: derived.visiblePlayers,
      showAddCard: derived.showAddCard,
      playersEmptyHint: derived.playersEmptyHint,
      playerColumns: derived.playerColumns,
      playerGap: derived.playerGap,
      onToggleReady: handleToggleReady,
      onRemovePlayer: (playerId) => removePlayer(playerId),
      onOpenAddPlayerModal: openAddPlayerModal,
    },
    settingsModalProps: {
      panelCopy: derived.panelCopy,
      isSettingsEditable: derived.isSettingsEditable,
      supportsOnlineSync: derived.supportsOnlineSync,
      allowLocalPlayers: derived.allowLocalPlayers,
      hasAnyMultiPlayerDevice: derived.hasAnyMultiPlayerDevice,
      actionAuthorityMode: derived.actionAuthorityMode,
      isImpostorLobby: derived.isImpostorLobby,
      impostorContentMode: derived.impostorContentMode,
      impostorTargetPlayers: derived.impostorTargetPlayers,
      impostorCount: derived.impostorCount,
      impostorClueTurnSeconds: derived.impostorClueTurnSeconds as 10 | 20 | 30,
      minimumPlayers: derived.minimumPlayers,
      maximumPlayers: derived.maximumPlayers,
      totalPlayers: derived.totalPlayers,
      onUpdateSettings: updateGameSettings,
    },
    startDockProps: {
      label: countdownValue !== null ? t('lobby.waitingSimple') : startDockLabel,
      helperText:
        countdownValue !== null
          ? `${derived.panelCopy.countdownStarting} ${countdownValue}`
          : derived.showReadyHint
            ? t('lobby.tapAvatarHint')
            : undefined,
      onStart: () => {
        void beginStartSequence();
      },
      disabled: !derived.canStartGame || !derived.canHostStartThisLobby || countdownValue !== null,
    },
  };
}
