import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioSource,
} from 'expo-audio';

export const SFX_SOURCES = {
  sfx_reveal: require('../../../assets/sfx/sfx_reveal.wav'),
  sfx_submit: require('../../../assets/sfx/sfx_submit.wav'),
  sfx_vote: require('../../../assets/sfx/sfx_vote.wav'),
  sfx_result: require('../../../assets/sfx/sfx_result.wav'),
  sfx_warning: require('../../../assets/sfx/sfx_warning.wav'),
  sfx_reconnect: require('../../../assets/sfx/sfx_reconnect.wav'),
  sfx_confirm: require('../../../assets/sfx/sfx_confirm.wav'),
  sfx_error: require('../../../assets/sfx/sfx_error.wav'),
} as const satisfies Record<string, AudioSource>;

export type SfxCueId = keyof typeof SFX_SOURCES;

const soundCache = new Map<SfxCueId, AudioPlayer>();
let audioConfigured = false;

const configureAudioMode = async (): Promise<void> => {
  if (audioConfigured) {
    return;
  }

  try {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
      shouldPlayInBackground: false,
    });
  } catch {
    // If audio mode fails we still let the app run without SFX.
  }

  audioConfigured = true;
};

const ensureSoundLoaded = async (cueId: SfxCueId): Promise<AudioPlayer | null> => {
  const cached = soundCache.get(cueId);

  if (cached) {
    return cached;
  }

  try {
    await configureAudioMode();
    const player = createAudioPlayer(SFX_SOURCES[cueId], {
      updateInterval: 500,
    });
    player.volume = 0.85;
    soundCache.set(cueId, player);
    return player;
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
  const player = await ensureSoundLoaded(cueId);

  if (!player) {
    return;
  }

  try {
    player.volume = options?.volume ?? 0.85;
    await player.seekTo(0);
    player.play();
  } catch {
    // Playback errors should not break gameplay flows.
  }
};

export const unloadAllSfx = async (): Promise<void> => {
  const players = Array.from(soundCache.values());
  soundCache.clear();

  for (const player of players) {
    try {
      player.remove();
    } catch {
      // Ignore unload errors during shutdown.
    }
  }
};
