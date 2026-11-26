import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ForbiddenCategoryId,
  getForbiddenDeck,
} from '@/src/features/games/forbidden-word/content';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { Locale } from '@/src/i18n';
import { triggerGameFeedback, triggerHaptic } from '@/src/ui/feedback';

export const TURN_DURATION_SECONDS = 45;

export type ForbiddenPlayer = {
  id: string;
  name: string;
  avatarId: number;
};

export function useForbiddenWordGame(lobby: GameRuntimeScreenProps['lobby'], locale: Locale) {
  const isPt = locale === 'pt';

  const players = useMemo<ForbiddenPlayer[]>(
    () =>
      lobby.devices.flatMap((device) =>
        device.players.map((player) => ({
          id: player.id,
          name: player.name,
          avatarId: player.avatarId,
        }))
      ),
    [lobby.devices]
  );

  const [category, setCategory] = useState<ForbiddenCategoryId>('all');
  const [speakerIndex, setSpeakerIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [isTurnRunning, setIsTurnRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION_SECONDS);
  const [scoresByPlayer, setScoresByPlayer] = useState<Record<string, number>>({});
  const [turnHits, setTurnHits] = useState(0);
  const [turnBuzzes, setTurnBuzzes] = useState(0);
  const [rulesVisible, setRulesVisible] = useState(false);

  const deck = useMemo(() => getForbiddenDeck(category), [category]);
  const currentCard = deck[cardIndex % Math.max(deck.length, 1)];
  const activeSpeaker = players[speakerIndex % Math.max(players.length, 1)];

  useEffect(() => {
    if (!isTurnRunning) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 11) {
          triggerGameFeedback('warning');
        }
        if (prev <= 1) {
          clearInterval(interval);
          setIsTurnRunning(false);
          triggerGameFeedback('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTurnRunning]);

  const handleSelectCategory = useCallback((nextCategory: ForbiddenCategoryId) => {
    setCategory(nextCategory);
    setCardIndex(0);
    triggerHaptic('selection');
  }, []);

  const handleStartTurn = useCallback(() => {
    setTimeLeft(TURN_DURATION_SECONDS);
    setTurnHits(0);
    setTurnBuzzes(0);
    setIsTurnRunning(true);
    triggerGameFeedback('confirm');
  }, []);

  const handleNextSpeaker = useCallback(() => {
    setSpeakerIndex((prev) => (prev + 1) % Math.max(players.length, 1));
    setCardIndex((prev) => prev + 1);
    setTimeLeft(TURN_DURATION_SECONDS);
    setTurnHits(0);
    setTurnBuzzes(0);
    setIsTurnRunning(false);
    triggerGameFeedback('confirm');
  }, [players.length]);

  const handleHit = useCallback(() => {
    if (!activeSpeaker) return;
    triggerHaptic('success');
    setTurnHits((prev) => prev + 1);
    setScoresByPlayer((prev) => ({
      ...prev,
      [activeSpeaker.id]: (prev[activeSpeaker.id] ?? 0) + 1,
    }));
    setCardIndex((prev) => prev + 1);
  }, [activeSpeaker]);

  const handleSkip = useCallback(() => {
    triggerHaptic('selection');
    setCardIndex((prev) => prev + 1);
  }, []);

  const handleBuzz = useCallback(() => {
    triggerGameFeedback('error');
    setTurnBuzzes((prev) => prev + 1);
    setCardIndex((prev) => prev + 1);
  }, []);

  const isPreTurn = !isTurnRunning && timeLeft === TURN_DURATION_SECONDS;
  const isTurnOver = !isTurnRunning && timeLeft === 0;

  return {
    isPt,
    players,
    category,
    currentCard,
    activeSpeaker,
    isTurnRunning,
    isPreTurn,
    isTurnOver,
    timeLeft,
    scoresByPlayer,
    turnHits,
    turnBuzzes,
    rulesVisible,
    setRulesVisible,
    handleSelectCategory,
    handleStartTurn,
    handleNextSpeaker,
    handleHit,
    handleSkip,
    handleBuzz,
  };
}
