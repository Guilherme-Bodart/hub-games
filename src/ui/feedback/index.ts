import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { usePreferencesStore } from '@/src/features/settings/preferencesStore';
import { playSfxCue, SfxCueId } from '@/src/ui/audio';

export type GameFeedbackEvent =
  | 'reveal'
  | 'submit'
  | 'vote'
  | 'result'
  | 'warning'
  | 'reconnect'
  | 'confirm'
  | 'error';

export type FeedbackHaptic =
  | 'selection'
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'none';

type FeedbackEventConfig = {
  haptic: FeedbackHaptic;
  soundCue: SfxCueId;
};

export const GAME_FEEDBACK_MAP: Record<GameFeedbackEvent, FeedbackEventConfig> = {
  reveal: { haptic: 'impactMedium', soundCue: 'sfx_reveal' },
  submit: { haptic: 'impactLight', soundCue: 'sfx_submit' },
  vote: { haptic: 'impactMedium', soundCue: 'sfx_vote' },
  result: { haptic: 'success', soundCue: 'sfx_result' },
  warning: { haptic: 'warning', soundCue: 'sfx_warning' },
  reconnect: { haptic: 'impactLight', soundCue: 'sfx_reconnect' },
  confirm: { haptic: 'selection', soundCue: 'sfx_confirm' },
  error: { haptic: 'error', soundCue: 'sfx_error' },
};

export const triggerHaptic = (type: FeedbackHaptic): void => {
  if (type === 'none' || Platform.OS === 'web') {
    return;
  }

  if (!usePreferencesStore.getState().hapticsEnabled) {
    return;
  }

  if (type === 'selection') {
    void Haptics.selectionAsync();
    return;
  }

  if (type === 'impactLight') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return;
  }

  if (type === 'impactMedium') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    return;
  }

  if (type === 'impactHeavy') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    return;
  }

  if (type === 'success') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return;
  }

  if (type === 'warning') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    return;
  }

  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

type TriggerFeedbackOptions = {
  haptics?: boolean;
  sounds?: boolean;
};

export const triggerGameFeedback = (
  event: GameFeedbackEvent,
  options: TriggerFeedbackOptions = {}
): FeedbackEventConfig => {
  const config = GAME_FEEDBACK_MAP[event];
  const { hapticsEnabled, soundEnabled } = usePreferencesStore.getState();

  if (options.haptics !== false && hapticsEnabled) {
    triggerHaptic(config.haptic);
  }

  if (options.sounds !== false && soundEnabled) {
    void playSfxCue(config.soundCue);
  }

  return config;
};
