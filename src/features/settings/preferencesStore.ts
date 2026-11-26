import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type ReduceMotionMode = 'system' | 'on' | 'off';

type PersistedPreferences = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reduceMotionMode: ReduceMotionMode;
};

type PreferencesState = PersistedPreferences & {
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setReduceMotionMode: (mode: ReduceMotionMode) => void;
};

const STORAGE_KEY = '@hub-games/user-preferences:v1';

const DEFAULT_PREFERENCES: PersistedPreferences = {
  soundEnabled: true,
  hapticsEnabled: true,
  reduceMotionMode: 'system',
};

const persistPreferences = (next: PersistedPreferences): void => {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...DEFAULT_PREFERENCES,
  isHydrated: false,

  hydrate: async () => {
    if (get().isHydrated) {
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedPreferences>;
        set({
          soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
          hapticsEnabled: typeof parsed.hapticsEnabled === 'boolean' ? parsed.hapticsEnabled : true,
          reduceMotionMode:
            parsed.reduceMotionMode === 'on' ||
            parsed.reduceMotionMode === 'off' ||
            parsed.reduceMotionMode === 'system'
              ? parsed.reduceMotionMode
              : 'system',
          isHydrated: true,
        });
        return;
      }
    } catch {
      // Ignore corrupt storage and fall back to defaults.
    }

    set({ isHydrated: true });
  },

  setSoundEnabled: (soundEnabled) => {
    const { hapticsEnabled, reduceMotionMode } = get();
    set({ soundEnabled });
    persistPreferences({ soundEnabled, hapticsEnabled, reduceMotionMode });
  },

  setHapticsEnabled: (hapticsEnabled) => {
    const { soundEnabled, reduceMotionMode } = get();
    set({ hapticsEnabled });
    persistPreferences({ soundEnabled, hapticsEnabled, reduceMotionMode });
  },

  setReduceMotionMode: (reduceMotionMode) => {
    const { soundEnabled, hapticsEnabled } = get();
    set({ reduceMotionMode });
    persistPreferences({ soundEnabled, hapticsEnabled, reduceMotionMode });
  },
}));
