import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

type MotionContextValue = {
  reduceMotion: boolean;
};

const MotionContext = createContext<MotionContextValue | undefined>(undefined);

export function MotionProvider({ children }: PropsWithChildren) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncPreference = async () => {
      try {
        const enabled = await AccessibilityInfo.isReduceMotionEnabled();
        if (isMounted) {
          setReduceMotion(enabled);
        }
      } catch {
        if (isMounted) {
          setReduceMotion(false);
        }
      }
    };

    syncPreference();

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

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
