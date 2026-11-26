import {
  LOBBY_SETTINGS_KEYS,
  getDefaultLobbyGameSettings,
  normalizeLobbyGameSettings,
  resolveAllowLocalPlayers,
} from '@/src/features/lobby/gameSettings';
import {
  doesLobbyGameSupportOnlineSync,
  getLobbyGameMeta,
  getLobbyGamePlayerLimits,
} from '@/src/features/lobby/lobbyGameMeta';
import { usePreferencesStore } from '@/src/features/settings/preferencesStore';

describe('Lobby Hybrid vs Online-Only settings & game meta', () => {
  it('defaults allowLocalPlayers to true (Hybrid) and respects false (Online-Only)', () => {
    const defaults = getDefaultLobbyGameSettings('impostor-neon');
    expect(resolveAllowLocalPlayers(defaults)).toBe(true);

    const onlineOnly = normalizeLobbyGameSettings(
      'impostor-neon',
      { [LOBBY_SETTINGS_KEYS.allowLocalPlayers]: false },
      4
    );
    expect(resolveAllowLocalPlayers(onlineOnly)).toBe(false);
  });

  it('registers all 5 games in lobbyGameMeta with accurate online sync support', () => {
    expect(getLobbyGameMeta('impostor-neon')?.supportsOnlineSync).toBe(true);
    expect(getLobbyGameMeta('sintonia')?.supportsOnlineSync).toBe(true);
    expect(doesLobbyGameSupportOnlineSync('draw-pass')).toBe(false);
    expect(doesLobbyGameSupportOnlineSync('forbidden-word')).toBe(false);
    expect(doesLobbyGameSupportOnlineSync('red-green-flag')).toBe(false);

    expect(getLobbyGamePlayerLimits('forbidden-word')).toEqual({ min: 2, max: 12 });
    expect(getLobbyGamePlayerLimits('red-green-flag')).toEqual({ min: 2, max: 10 });
  });

  it('updates user preferences store cleanly', () => {
    const store = usePreferencesStore.getState();
    store.setSoundEnabled(false);
    store.setHapticsEnabled(false);
    store.setReduceMotionMode('on');

    const next = usePreferencesStore.getState();
    expect(next.soundEnabled).toBe(false);
    expect(next.hapticsEnabled).toBe(false);
    expect(next.reduceMotionMode).toBe('on');

    next.setSoundEnabled(true);
    next.setHapticsEnabled(true);
    next.setReduceMotionMode('system');
  });
});
