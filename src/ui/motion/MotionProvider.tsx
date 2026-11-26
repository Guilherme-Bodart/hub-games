import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { usePreferencesStore } from '@/src/features/settings/preferencesStore';

type MotionContextValue = {
  reduceMotion: boolean;
};

const MotionContext = createContext<MotionContextValue | undefined>(undefined);

export function MotionProvider({ children }: PropsWithChildren) {
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const reduceMotionMode = usePreferencesStore((state) => state.reduceMotionMode);

  useEffect(() => {
    let isMounted = true;

    const syncPreference = async () => {
      try {
        const enabled = await AccessibilityInfo.isReduceMotionEnabled();
        if (isMounted) {
          setSystemReduceMotion(enabled);
        }
      } catch {
        if (isMounted) {
          setSystemReduceMotion(false);
        }
      }
    };

    void syncPreference();

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setSystemReduceMotion
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const reduceMotion =
    reduceMotionMode === 'on'
      ? true
      : reduceMotionMode === 'off'
        ? false
        : systemReduceMotion;

  const value = useMemo<MotionContextValue>(
    () => ({
      reduceMotion,
    }),
    [reduceMotion]
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export const useReducedMotion = (): boolean => {
  const context = useContext(MotionContext);

  if (!context) {
    throw new Error('useReducedMotion must be used inside MotionProvider.');
  }

  return context.reduceMotion;
};
