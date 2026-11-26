import { useCallback, useEffect, useMemo, useRef } from 'react';
import { LayoutChangeEvent, PanResponder } from 'react-native';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { SintoniaRevealFeedback } from '@/src/features/games/sintonia/types';

type UseOrderingCardDragParams = {
  playerId: string;
  revealFeedback: SintoniaRevealFeedback;
  isDragEnabled: boolean;
  onDrop: (playerId: string, dragX: number, dragY: number) => boolean;
  onDragStateChange?: (dragging: boolean) => void;
  onMeasure?: (layout: { width: number; height: number }) => void;
};

export function useOrderingCardDrag({
  playerId,
  revealFeedback,
  isDragEnabled,
  onDrop,
  onDragStateChange,
  onMeasure,
}: UseOrderingCardDragParams) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isDragging = useSharedValue(0);
  const flipProgress = useSharedValue(revealFeedback === 'hidden' ? 0 : 1);

  const callbacksRef = useRef({ isDragEnabled, onDrop, onDragStateChange, playerId });
  callbacksRef.current = { isDragEnabled, onDrop, onDragStateChange, playerId };

  useEffect(() => {
    flipProgress.value = withTiming(revealFeedback === 'hidden' ? 0 : 1, {
      duration: 360,
      easing: Easing.out(Easing.cubic),
    });
  }, [flipProgress, revealFeedback]);

  const dragStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: isDragging.value > 0 ? 40 : 0,
  }));

  const frontFaceStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg` },
    ],
    opacity: interpolate(flipProgress.value, [0, 0.48, 0.5, 1], [1, 1, 0, 0]),
  }));

  const backFaceStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [-180, 0])}deg` },
    ],
    opacity: interpolate(flipProgress.value, [0, 0.5, 0.52, 1], [0, 0, 1, 1]),
  }));

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!onMeasure) {
        return;
      }

      const { width, height } = event.nativeEvent.layout;
      if (width > 0 && height > 0) {
        onMeasure({ width, height });
      }
    },
    [onMeasure]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => callbacksRef.current.isDragEnabled,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          callbacksRef.current.isDragEnabled &&
          (Math.abs(gestureState.dy) > 3 || Math.abs(gestureState.dx) > 3),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          if (!callbacksRef.current.isDragEnabled) {
            return;
          }
          isDragging.value = 1;
          callbacksRef.current.onDragStateChange?.(true);
          scale.value = withTiming(1.04, { duration: 110 });
        },
        onPanResponderMove: (_, gestureState) => {
          if (!callbacksRef.current.isDragEnabled) {
            return;
          }
          translateX.value = gestureState.dx;
          translateY.value = gestureState.dy;
        },
        onPanResponderRelease: (_, gestureState) => {
          let moved = false;

          if (callbacksRef.current.isDragEnabled) {
            moved = callbacksRef.current.onDrop(
              callbacksRef.current.playerId,
              gestureState.dx,
              gestureState.dy
            );
          }

          isDragging.value = 0;
          callbacksRef.current.onDragStateChange?.(false);

          if (moved) {
            // Reset drag offset immediately so the card doesn't jump past its new grid cell.
            translateX.value = 0;
            translateY.value = 0;
            scale.value = withSequence(
              withTiming(1.03, { duration: 60, easing: Easing.out(Easing.quad) }),
              withTiming(1, { duration: 120, easing: Easing.out(Easing.cubic) })
            );
            return;
          }

          translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
          translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
          scale.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.cubic) });
        },
        onPanResponderTerminate: () => {
          isDragging.value = 0;
          callbacksRef.current.onDragStateChange?.(false);
          translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
          translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
          scale.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.cubic) });
        },
      }),
    [isDragging, scale, translateX, translateY]
  );

  return {
    panHandlers: panResponder.panHandlers,
    handleLayout,
    dragStyle,
    frontFaceStyle,
    backFaceStyle,
  };
}
