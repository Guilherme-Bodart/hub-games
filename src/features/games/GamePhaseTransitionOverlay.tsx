import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { getDuration, useReducedMotion } from '@/src/ui/motion';

type GamePhaseTransitionOverlayProps = {
  phaseLabel: string | null;
};

const OVERLAY_FALLBACK_MS = 440;

export function GamePhaseTransitionOverlay({ phaseLabel }: GamePhaseTransitionOverlayProps) {
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();
  const previousPhaseRef = useRef<string | null>(null);
  const [visiblePhase, setVisiblePhase] = useState<string | null>(null);

  useEffect(() => {
    if (!phaseLabel || phaseLabel === previousPhaseRef.current) {
      return;
    }

    previousPhaseRef.current = phaseLabel;
    setVisiblePhase(phaseLabel);

    const hideAfterMs = reduceMotion ? 0 : OVERLAY_FALLBACK_MS;
    const timeout = setTimeout(() => {
      setVisiblePhase(null);
    }, hideAfterMs);

    return () => clearTimeout(timeout);
  }, [phaseLabel, reduceMotion]);

  if (!visiblePhase) {
    return null;
  }

  const fadeDuration = getDuration('fast', reduceMotion);

  return (
    <View pointerEvents="none" style={styles.root}>
      <Animated.View
        entering={FadeIn.duration(fadeDuration)}
        exiting={FadeOut.duration(fadeDuration)}
        style={[
          styles.panel,
          {
            borderColor: withAlpha(theme.semantic.button.primary.bg, 0.42),
            backgroundColor: withAlpha(theme.semantic.bg.overlay, 0.84),
          },
        ]}>
        <Text
          style={[
            styles.label,
            {
              color: theme.semantic.text.primary,
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {visiblePhase}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  label: {
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
