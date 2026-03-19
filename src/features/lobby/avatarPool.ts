import { HybridLobbyState } from '@/src/features/lobby/types';
import { AVATAR_ASSET_TOTAL } from '@/src/features/lobby/avatarCatalog';

export const AVATAR_SPRITE_TOTAL = AVATAR_ASSET_TOTAL;

const buildShuffledAvatarIds = (random: () => number): number[] => {
  const pool = Array.from({ length: AVATAR_SPRITE_TOTAL }, (_, index) => index);

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool;
};

export const assignUniqueAvatarIds = (
  lobby: HybridLobbyState,
  random: () => number = Math.random
): HybridLobbyState => {
  const shuffledIds = buildShuffledAvatarIds(random);
  let nextIndex = 0;

  return {
    ...lobby,
    devices: lobby.devices.map((device) => ({
      ...device,
      players: device.players.map((player) => ({
        ...player,
        avatarId: shuffledIds[nextIndex++ % AVATAR_SPRITE_TOTAL],
      })),
    })),
  };
};

export const pickAvailableAvatarId = (
  lobby: HybridLobbyState,
  random: () => number = Math.random
): number => {
  const usedIds = new Set<number>(
    lobby.devices.flatMap((device) => device.players.map((player) => player.avatarId))
  );

  const availableIds = Array.from({ length: AVATAR_SPRITE_TOTAL }, (_, index) => index).filter(
    (avatarId) => !usedIds.has(avatarId)
  );

  if (availableIds.length === 0) {
    return Math.floor(random() * AVATAR_SPRITE_TOTAL);
  }

  return availableIds[Math.floor(random() * availableIds.length)];
};
