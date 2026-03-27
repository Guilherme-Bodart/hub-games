import { z } from 'zod';

import { HybridLobbyState } from '@/src/features/lobby';
import { Locale } from '@/src/i18n';
import { getSintoniaThemes, SintoniaThemeCategory } from '@/src/features/games/sintonia/categories';
import {
  OrderingEvaluation,
  SintoniaPlayer,
  SintoniaRevealFeedback,
  SintoniaRound,
} from '@/src/features/games/sintonia/types';

type RoundPlayerSeed = Omit<SintoniaPlayer, 'secretNumber'>;

type CreateSintoniaRoundParams = {
  lobby: HybridLobbyState;
  locale: Locale;
  random?: () => number;
};

const playerSeedSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  avatarId: z.number().int().min(0),
  deviceId: z.string().min(1),
  isHost: z.boolean(),
  isLocalDevice: z.boolean(),
});

const roundInputSchema = z.object({
  mode: z.enum(['local', 'remote']),
  players: z.array(playerSeedSchema).min(2).max(10),
  themes: z
    .array(
      z.object({
        prompt: z.string().min(4),
        lowLabel: z.string().min(1),
        highLabel: z.string().min(1),
      })
    )
    .min(1),
});

const normalizeRandom = (random: () => number): number =>
  Math.max(0, Math.min(0.999999, random()));

const shuffle = <T>(values: T[], random: () => number): T[] => {
  const next = [...values];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(normalizeRandom(random) * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
};

const collectRoundPlayers = (lobby: HybridLobbyState): RoundPlayerSeed[] => {
  const activeDevices =
    lobby.mode === 'local'
      ? lobby.devices.filter((device) => device.isLocalDevice)
      : lobby.devices.filter((device) => device.isConnected);

  return activeDevices.flatMap((device) =>
    device.players.map((player) => ({
      id: player.id,
      name: player.name,
      avatarId: player.avatarId,
      deviceId: player.deviceId,
      isHost: player.isHost,
      isLocalDevice: device.isLocalDevice,
    }))
  );
};

export const drawUniqueNumbers = (amount: number, random: () => number): number[] => {
  const pool = Array.from({ length: 100 }, (_, index) => index + 1);
  const shuffledPool = shuffle(pool, random);
  return shuffledPool.slice(0, amount);
};

const pickTheme = (
  themes: readonly SintoniaThemeCategory[],
  random: () => number
): SintoniaThemeCategory =>
  themes[Math.floor(normalizeRandom(random) * themes.length)];

export const createPlayersMap = (
  players: SintoniaPlayer[]
): Record<string, SintoniaPlayer> =>
  players.reduce<Record<string, SintoniaPlayer>>((accumulator, player) => {
    accumulator[player.id] = player;
    return accumulator;
  }, {});

export const createHiddenRevealMap = (
  players: SintoniaPlayer[]
): Record<string, SintoniaRevealFeedback> =>
  players.reduce<Record<string, SintoniaRevealFeedback>>((accumulator, player) => {
    accumulator[player.id] = 'hidden';
    return accumulator;
  }, {});

export const createDevicesReadyMap = (
  players: SintoniaPlayer[],
  initialReady = false
): Record<string, boolean> =>
  players.reduce<Record<string, boolean>>((accumulator, player) => {
    if (accumulator[player.deviceId] === undefined) {
      accumulator[player.deviceId] = initialReady;
    }
    return accumulator;
  }, {});

export const createSintoniaRound = ({
  lobby,
  locale,
  random = Math.random,
}: CreateSintoniaRoundParams): SintoniaRound => {
  const parsedInput = roundInputSchema.parse({
    mode: lobby.mode,
    players: collectRoundPlayers(lobby),
    themes: getSintoniaThemes(locale),
  });

  const secretNumbers = drawUniqueNumbers(parsedInput.players.length, random);
  const players = parsedInput.players.map<SintoniaPlayer>((player, index) => ({
    ...player,
    secretNumber: secretNumbers[index],
  }));
  const selectedTheme = pickTheme(parsedInput.themes, random);

  return {
    id: `sintonia-${Date.now()}`,
    theme: selectedTheme.prompt,
    themeScaleLow: selectedTheme.lowLabel,
    themeScaleHigh: selectedTheme.highLabel,
    mode: parsedInput.mode,
    players,
    initialOrder: shuffle(
      players.map((player) => player.id),
      random
    ),
  };
};

export const movePlayerId = (
  playerIds: string[],
  fromIndex: number,
  toIndex: number
): string[] => {
  if (fromIndex === toIndex) {
    return playerIds;
  }

  const nextOrder = [...playerIds];
  const [moved] = nextOrder.splice(fromIndex, 1);
  nextOrder.splice(toIndex, 0, moved);
  return nextOrder;
};

export const evaluateRevealStep = (
  previousNumber: number | null,
  currentNumber: number
): { isCorrect: boolean; nextPrevious: number } => {
  const isCorrect = previousNumber === null || currentNumber > previousNumber;

  return {
    isCorrect,
    nextPrevious: previousNumber === null ? currentNumber : Math.max(previousNumber, currentNumber),
  };
};

export const evaluateOrdering = (
  orderedPlayerIds: string[],
  playersById: Record<string, SintoniaPlayer>
): OrderingEvaluation => {
  let previousNumber: number | null = null;

  for (let index = 0; index < orderedPlayerIds.length; index += 1) {
    const player = playersById[orderedPlayerIds[index]];

    if (!player) {
      return {
        isSuccess: false,
        firstFailureIndex: index,
      };
    }

    const { isCorrect, nextPrevious } = evaluateRevealStep(
      previousNumber,
      player.secretNumber
    );

    if (!isCorrect) {
      return {
        isSuccess: false,
        firstFailureIndex: index,
      };
    }

    previousNumber = nextPrevious;
  }

  return {
    isSuccess: true,
    firstFailureIndex: null,
  };
};
