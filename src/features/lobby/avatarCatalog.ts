import { ImageSourcePropType } from 'react-native';
import { GENERATED_AVATAR_ASSETS } from '@/src/features/lobby/avatarCatalog.generated';

export const AVATAR_ASSETS: ReadonlyArray<ImageSourcePropType> = GENERATED_AVATAR_ASSETS;

export const AVATAR_ASSET_TOTAL = AVATAR_ASSETS.length;

export const normalizeAvatarId = (avatarId: number): number => {
  if (AVATAR_ASSET_TOTAL === 0 || !Number.isFinite(avatarId)) {
    return 0;
  }

  const normalized = Math.trunc(avatarId) % AVATAR_ASSET_TOTAL;
  return normalized < 0 ? normalized + AVATAR_ASSET_TOTAL : normalized;
};

export const resolveAvatarAsset = (avatarId: number): ImageSourcePropType =>
  AVATAR_ASSETS[normalizeAvatarId(avatarId)];
