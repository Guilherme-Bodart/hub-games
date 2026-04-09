import { assignUniqueAvatarIds } from '@/src/features/lobby/avatarPool';
import {
  addRemotePlayer,
  removeRemotePlayer,
  toggleRemotePlayerReady,
  updateRemoteLobbySettings,
} from '@/src/features/lobby/firebaseRealtime';
import { normalizeLobbyGameSettings } from '@/src/features/lobby/gameSettings';
import {
  clearStoredRemoteSessionContext,
  getStoredPreferredNickname,
  persistPreferredNickname,
} from '@/src/features/lobby/lobbyPersistenceService';
import {
  clearRemoteSubscriptions,
  executeRemoteAction,
  getRemoteSessionContext,
  setRemoteSessionContext,
} from '@/src/features/lobby/lobbyRealtimeService';
import {
  clearRemoteStartFlow,
  createRemoteSessionFlow,
  joinRemoteSessionFlow,
  restoreRemoteSessionIfAny,
  scheduleRemoteStartFlow,
} from '@/src/features/lobby/lobbySessionRemoteFlows';
import type {
  LobbySessionActions,
  LobbyStoreGet,
  LobbyStoreSet,
} from '@/src/features/lobby/lobbySession.types';
import {
  countPlayers,
  createRoomCode,
  getMaxPlayersForLobby,
  isLocalDeviceHost,
  normalizeLobbyWithCurrentPlayers,
  withAddedLocalPlayer,
  withRemovedLocalPlayer,
  withToggledPlayerReady,
} from '@/src/features/lobby/lobbySessionUtils';
import { buildInitialHybridLobby } from '@/src/features/lobby/mockState';
import type { LobbyGameSettings } from '@/src/features/lobby/types';

const setRealtimeError = (set: LobbyStoreSet, message: string): void => {
  set({
    realtimeStatus: 'error',
    realtimeError: message,
  });
};

export const buildLobbySessionActions = (
  set: LobbyStoreSet,
  get: LobbyStoreGet
): LobbySessionActions => ({
  getPreferredNickname: async () => getStoredPreferredNickname(),
  setPreferredNickname: async (nickname) => {
    await persistPreferredNickname(nickname);
  },
  selectGame: (gameId) => set({ selectedGameId: gameId }),
  startSession: (gameId, mode) => {
    clearRemoteSubscriptions();
    setRemoteSessionContext(null);
    void clearStoredRemoteSessionContext().catch(() => undefined);
    const nextRoomCode = mode === 'remote' ? createRoomCode() : '';

    set({
      selectedGameId: gameId,
      selectedMode: mode,
      lobby: assignUniqueAvatarIds(buildInitialHybridLobby(gameId, mode, nextRoomCode)),
      realtimeStatus: 'idle',
      realtimeError: null,
      sessionRestoreStatus: 'ready',
    });
  },
  endSession: () => {
    clearRemoteSubscriptions();
    setRemoteSessionContext(null);
    void clearStoredRemoteSessionContext().catch(() => undefined);
    set({
      selectedGameId: null,
      selectedMode: null,
      lobby: null,
      realtimeStatus: 'idle',
      realtimeError: null,
      sessionRestoreStatus: 'ready',
    });
  },
  restoreRemoteSessionIfAny: () => restoreRemoteSessionIfAny(set, get),
  createRemoteSession: (gameId, options) => createRemoteSessionFlow(set, get, gameId, options),
  joinRemoteSession: (roomCode, options) => joinRemoteSessionFlow(set, get, roomCode, options),
  updateGameSettings: (nextSettings) => {
    const lobby = get().lobby;

    if (!lobby) {
      return;
    }

    const sanitizedPatch = Object.entries(nextSettings).reduce<LobbyGameSettings>(
      (accumulator, [key, value]) => {
        if (value !== undefined) {
          accumulator[key] = value;
        }
        return accumulator;
      },
      {}
    );

    const mergedSettings = normalizeLobbyGameSettings(
      lobby.gameId,
      {
        ...lobby.gameSettings,
        ...sanitizedPatch,
      },
      countPlayers(lobby)
    );

    if (lobby.mode === 'remote') {
      const session = getRemoteSessionContext();
      if (!session || !isLocalDeviceHost(lobby)) {
        return;
      }

      executeRemoteAction(
        () => updateRemoteLobbySettings(session.roomCode, mergedSettings),
        'Falha ao atualizar configurações da sala.',
        (message) => setRealtimeError(set, message),
        { maxAttempts: 3 }
      );
      return;
    }

    set((state) => {
      if (!state.lobby) {
        return state;
      }

      return {
        ...state,
        lobby: normalizeLobbyWithCurrentPlayers({
          ...state.lobby,
          gameSettings: mergedSettings,
        }),
      };
    });
  },
  scheduleRemoteStart: (startAt) => scheduleRemoteStartFlow(set, get, startAt),
  clearRemoteStart: () => clearRemoteStartFlow(set, get),
  addPlayerToSelectedDevice: (name) => {
    const lobby = get().lobby;
    if (!lobby) {
      return;
    }

    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    if (lobby.mode === 'remote') {
      const session = getRemoteSessionContext();
      const totalPlayers = countPlayers(lobby);
      const maximumPlayers = getMaxPlayersForLobby(lobby);

      if (!session || totalPlayers >= maximumPlayers) {
        setRealtimeError(
          set,
          totalPlayers >= maximumPlayers
            ? `Limite da sala atingido (${maximumPlayers}).`
            : 'Conexão remota indisponível.'
        );
        return;
      }

      executeRemoteAction(
        () => addRemotePlayer(session.roomCode, session.deviceId, trimmed),
        'Falha ao adicionar jogador remoto.',
        (message) => setRealtimeError(set, message),
        { maxAttempts: 1 }
      );
      return;
    }

    set((state) => {
      if (!state.lobby) {
        return state;
      }

      const localLobby = state.lobby;
      if (countPlayers(localLobby) >= getMaxPlayersForLobby(localLobby)) {
        return state;
      }

      return { ...state, lobby: withAddedLocalPlayer(localLobby, trimmed) };
    });
  },
  togglePlayerReady: (playerId) => {
    const lobby = get().lobby;
    if (!lobby) {
      return;
    }

    if (lobby.mode === 'remote') {
      const session = getRemoteSessionContext();
      const localDevice = lobby.devices.find((device) => device.id === lobby.selectedDeviceId);
      const ownsPlayer = localDevice?.players.some((player) => player.id === playerId);

      if (!ownsPlayer || !session) {
        return;
      }

      executeRemoteAction(
        () => toggleRemotePlayerReady(session.roomCode, session.deviceId, playerId),
        'Falha ao atualizar status de pronto.',
        (message) => setRealtimeError(set, message),
        { maxAttempts: 1 }
      );
      return;
    }

    set((state) => {
      if (!state.lobby) {
        return state;
      }

      return {
        ...state,
        lobby: withToggledPlayerReady(state.lobby, playerId),
      };
    });
  },
  removePlayer: (playerId) => {
    const lobby = get().lobby;
    if (!lobby) {
      return;
    }

    if (lobby.mode === 'remote') {
      const session = getRemoteSessionContext();
      const localDevice = lobby.devices.find((device) => device.id === lobby.selectedDeviceId);
      const targetPlayer = localDevice?.players.find((player) => player.id === playerId);

      if (!targetPlayer || targetPlayer.isHost || !session) {
        return;
      }

      executeRemoteAction(
        () => removeRemotePlayer(session.roomCode, session.deviceId, playerId),
        'Falha ao remover jogador remoto.',
        (message) => setRealtimeError(set, message),
        { maxAttempts: 2 }
      );
      return;
    }

    set((state) => {
      if (!state.lobby) {
        return state;
      }

      return {
        ...state,
        lobby: withRemovedLocalPlayer(state.lobby, playerId),
      };
    });
  },
});
