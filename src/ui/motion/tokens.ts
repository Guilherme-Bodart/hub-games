import { FadeInDown } from 'react-native-reanimated';

export const MOTION_TOKENS = {
  fast: 160,
  medium: 300,
  suspense: 620,
  stagger: 56,
} as const;

export const getDuration = (
  speed: keyof typeof MOTION_TOKENS,
  reduceMotion: boolean
): number => (reduceMotion ? 0 : MOTION_TOKENS[speed]);

export const getStaggerDelay = (index: number, reduceMotion: boolean): number =>
  reduceMotion ? 0 : index * MOTION_TOKENS.stagger;

export const createCatalogCardEntering = (index: number, reduceMotion: boolean) => {
  if (reduceMotion) {
    return undefined;
  }

  return FadeInDown.springify().damping(16).stiffness(180).delay(index * MOTION_TOKENS.stagger);
};
