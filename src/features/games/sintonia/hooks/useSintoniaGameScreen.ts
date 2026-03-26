import { useEffect, useMemo, useState } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { SintoniaPhase, SintoniaRound, SintoniaRoundResult } from '@/src/features/games/sintonia/types';

type TranslateFn = (key: any, params?: Record<string, number | string>) => string;

type UseSintoniaGameScreenParams = {
  phase: SintoniaPhase;
  roundResult: SintoniaRoundResult;
  isRemoteRealtime: boolean;
  canControlCriticalActions: boolean;
  realtimeStatus: string;
  round: SintoniaRound | null;
  roundError: boolean;
  locale: string;
  viewportWidth: number;
  setShellPhase?: (phase: string) => void;
  t: TranslateFn;
};

export function useSintoniaGameScreen({
  phase,
  roundResult,
  isRemoteRealtime,
  canControlCriticalActions,
  realtimeStatus,
  round,
  roundError,
  locale,
  viewportWidth,
  setShellPhase,
  t,
}: UseSintoniaGameScreenParams) {
  const [rulesVisible, setRulesVisible] = useState(false);

  const phaseBadgeLabel = useMemo(
    () =>
      phase === 'secrets'
        ? t('sintonia.secretPhaseTitle')
        : phase === 'ordering'
          ? t('sintonia.orderingPhaseTitle')
          : phase === 'revealing'
            ? t('sintonia.revealingPhaseTitle')
            : roundResult === 'success'
              ? t('sintonia.successTitle')
              : t('sintonia.failureTitle'),
    [phase, roundResult, t]
  );

  const playersSectionLabel = locale === 'pt' ? 'Jogadores' : 'Players';

  const dragDirectionHint =
    locale === 'pt'
      ? 'Arraste para os lados e para cima/baixo para reposicionar'
      : 'Drag sideways or up/down to reposition';

  const dockHelperText =
    phase === 'secrets'
      ? locale === 'pt'
        ? 'Segure no seu card para revelar seu numero.'
        : 'Hold your card to reveal your number.'
      : phase === 'ordering'
        ? dragDirectionHint
        : phase === 'revealing'
          ? locale === 'pt'
            ? 'Aguarde a revelacao.'
            : 'Wait for reveal.'
          : locale === 'pt'
            ? 'Rodada finalizada. Pronto para outra?'
            : 'Round finished. Ready for another one?';

  const canAdvancePhase = !isRemoteRealtime || canControlCriticalActions;

  const topBarStatusTone: 'error' | 'warning' | 'success' =
    realtimeStatus === 'error'
      ? 'error'
      : realtimeStatus === 'connecting' ||
          realtimeStatus === 'reconnecting' ||
          realtimeStatus === 'idle'
        ? 'warning'
        : 'success';

  const titleFlicker = useSharedValue(0.8);
  const themeBorderGlow = useSharedValue(0.72);
  const themeShineOffset = useSharedValue(-260);

  useEffect(() => {
    titleFlicker.value = withRepeat(
      withSequence(
        withTiming(0.52, { duration: 90 }),
        withTiming(1, { duration: 120 }),
        withTiming(0.86, { duration: 700 }),
        withTiming(1, { duration: 580 })
      ),
      -1,
      false
    );

    themeShineOffset.value = withRepeat(
      withSequence(
        withTiming(viewportWidth + 120, { duration: 1900, easing: Easing.linear }),
        withTiming(-260, { duration: 0 })
      ),
      -1,
      false
    );

    themeBorderGlow.value = withRepeat(withTiming(1, { duration: 1400 }), -1, true);
  }, [themeBorderGlow, themeShineOffset, titleFlicker, viewportWidth]);

  const titleFlickerStyle = useAnimatedStyle(() => ({
    opacity: titleFlicker.value,
    transform: [{ scale: 0.992 + titleFlicker.value * 0.016 }],
  }));

  const themeShineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: themeShineOffset.value }, { rotate: '-7deg' }],
  }));

  const themeGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.2 + themeBorderGlow.value * 0.28,
    shadowRadius: 10 + themeBorderGlow.value * 10,
    elevation: 5 + themeBorderGlow.value * 6,
  }));

  useEffect(() => {
    if (isRemoteRealtime && !round && !roundError) {
      setShellPhase?.(t('connection.reconnecting'));
      return;
    }

    if (!round || roundError) {
      setShellPhase?.(t('game.unavailableTitle'));
      return;
    }

    setShellPhase?.(phaseBadgeLabel);
  }, [isRemoteRealtime, phaseBadgeLabel, round, roundError, setShellPhase, t]);

  return {
    rulesVisible,
    setRulesVisible,
    phaseBadgeLabel,
    playersSectionLabel,
    dockHelperText,
    canAdvancePhase,
    topBarStatusTone,
    titleFlickerStyle,
    themeShineStyle,
    themeGlowStyle,
  };
}

