import { Audio, AVPlaybackSource } from 'expo-av';

export const SFX_SOURCES = {
  sfx_reveal: require('../../../assets/sfx/sfx_reveal.wav'),
  sfx_submit: require('../../../assets/sfx/sfx_submit.wav'),
  sfx_vote: require('../../../assets/sfx/sfx_vote.wav'),
  sfx_result: require('../../../assets/sfx/sfx_result.wav'),
  sfx_warning: require('../../../assets/sfx/sfx_warning.wav'),
  sfx_reconnect: require('../../../assets/sfx/sfx_reconnect.wav'),
  sfx_confirm: require('../../../assets/sfx/sfx_confirm.wav'),
  sfx_error: require('../../../assets/sfx/sfx_error.wav'),
} as const satisfies Record<string, AVPlaybackSource>;

export type SfxCueId = keyof typeof SFX_SOURCES;

const soundCache = new Map<SfxCueId, Audio.Sound>();
let audioConfigured = false;

const configureAudioMode = async (): Promise<void> => {
  if (audioConfigured) {
    return;
  }

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });
  } catch {
    // If audio mode fails we still let the app run without SFX.
  }

  audioConfigured = true;
};

const ensureSoundLoaded = async (cueId: SfxCueId): Promise<Audio.Sound | null> => {
  const cached = soundCache.get(cueId);

  if (cached) {
    return cached;
  }

  try {
    await configureAudioMode();
    const { sound } = await Audio.Sound.createAsync(SFX_SOURCES[cueId], {
      shouldPlay: false,
      volume: 0.85,
      progressUpdateIntervalMillis: 500,
    });
    soundCache.set(cueId, sound);
    return sound;
  } catch {
    return null;
  }
};

export const preloadSfxCues = async (cueIds: readonly SfxCueId[]): Promise<void> => {
  await Promise.all(cueIds.map((cueId) => ensureSoundLoaded(cueId)));
};

export const playSfxCue = async (
  cueId: SfxCueId,
  options?: { volume?: number }
): Promise<void> => {
  const sound = await ensureSoundLoaded(cueId);

  if (!sound) {
    return;
  }

  try {
    await sound.setStatusAsync({
      positionMillis: 0,
      shouldPlay: true,
      volume: options?.volume ?? 0.85,
    });
  } catch {
    // Playback errors should not break gameplay flows.
  }
};

export const unloadAllSfx = async (): Promise<void> => {
  const sounds = Array.from(soundCache.values());
  soundCache.clear();

  await Promise.all(
    sounds.map(async (sound) => {
      try {
        await sound.unloadAsync();
      } catch {
        // Ignore unload errors during shutdown.
      }
    })
  );
};
