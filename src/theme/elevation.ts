import { Platform, ViewStyle } from 'react-native';

export type ElevationLevel = 'flat' | 'card' | 'floating' | 'hero';

const SHADOW_INK = '#181C3A';

export const ELEVATION_STYLES: Record<ElevationLevel, ViewStyle> = {
  flat: {
    elevation: 0,
    shadowOpacity: 0,
  },
  card: Platform.select<ViewStyle>({
    android: {
      elevation: 3,
      shadowColor: SHADOW_INK,
    },
    default: {
      shadowColor: SHADOW_INK,
      shadowOpacity: 0.07,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
  }) ?? {},
  floating: Platform.select<ViewStyle>({
    android: {
      elevation: 6,
      shadowColor: SHADOW_INK,
    },
    default: {
      shadowColor: SHADOW_INK,
      shadowOpacity: 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
  }) ?? {},
  hero: Platform.select<ViewStyle>({
    android: {
      elevation: 10,
      shadowColor: SHADOW_INK,
    },
    default: {
      shadowColor: SHADOW_INK,
      shadowOpacity: 0.18,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
    },
  }) ?? {},
};
