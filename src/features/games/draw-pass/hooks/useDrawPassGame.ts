import { useCallback, useMemo, useState } from 'react';

import {
  DrawCategoryId,
  pickDrawPrompt,
} from '@/src/features/games/draw-pass/content';
import {
  ChainEntry,
  DrawPassPlayer,
  Stroke,
} from '@/src/features/games/draw-pass/types/drawPass.types';
import { Locale } from '@/src/i18n';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { triggerGameFeedback, triggerHaptic } from '@/src/ui/feedback';

export function useDrawPassGame(lobby: GameRuntimeScreenProps['lobby'], locale: Locale) {
  const isPt = locale === 'pt';

  const players = useMemo<DrawPassPlayer[]>(
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

  const [category, setCategory] = useState<DrawCategoryId>('all');
  const [initialPrompt, setInitialPrompt] = useState(() => pickDrawPrompt(locale, 'all'));
  const [chain, setChain] = useState<ChainEntry[]>([]);
  const [currentStrokes, setCurrentStrokes] = useState<Stroke[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isHandoffPending, setIsHandoffPending] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(false);

  const turnIndex = chain.length === 0 ? 0 : chain.length - 1;
  const activePlayer = players[turnIndex % Math.max(players.length, 1)];
  // Even turns (0, 2, 4...) draw a prompt; Odd turns (1, 3, 5...) guess the previous drawing.
  const isDrawingTurn = turnIndex % 2 === 0;
  const previousEntry = chain[chain.length - 1];

  const promptToDraw =
    turnIndex === 0
      ? initialPrompt
      : previousEntry?.type === 'prompt'
        ? previousEntry.text
        : initialPrompt;

  const handleSelectCategory = useCallback(
    (nextCategory: DrawCategoryId) => {
      setCategory(nextCategory);
      setInitialPrompt(pickDrawPrompt(locale, nextCategory));
      triggerHaptic('selection');
    },
    [locale]
  );

  const handleRerollPrompt = useCallback(() => {
    setInitialPrompt(pickDrawPrompt(locale, category, initialPrompt));
    triggerHaptic('selection');
  }, [category, initialPrompt, locale]);

  const handleAddStroke = useCallback((stroke: Stroke) => {
    setCurrentStrokes((prev) => [...prev, stroke]);
  }, []);

  const handleUndoStroke = useCallback(() => {
    setCurrentStrokes((prev) => prev.slice(0, -1));
    triggerHaptic('selection');
  }, []);

  const handleClearCanvas = useCallback(() => {
    if (currentStrokes.length === 0) return;
    setCurrentStrokes([]);
    triggerHaptic('impactLight');
  }, [currentStrokes.length]);

  const handleAcceptHandoff = useCallback(() => {
    setIsHandoffPending(false);
    triggerGameFeedback('reveal');
  }, []);

  const handleSubmitStep = useCallback(() => {
    if (!activePlayer) return;

    if (isDrawingTurn) {
      if (currentStrokes.length === 0) return;

      const updatedChain: ChainEntry[] =
        turnIndex === 0
          ? [
              {
                type: 'prompt',
                authorName: isPt ? 'Tema Inicial' : 'Initial Prompt',
                authorAvatarId: activePlayer.avatarId,
                text: initialPrompt,
              },
              {
                type: 'drawing',
                authorName: activePlayer.name,
                authorAvatarId: activePlayer.avatarId,
                strokes: currentStrokes,
              },
            ]
          : [
              ...chain,
              {
                type: 'drawing',
                authorName: activePlayer.name,
                authorAvatarId: activePlayer.avatarId,
                strokes: currentStrokes,
              },
            ];

      setChain(updatedChain);
      setCurrentStrokes([]);
      triggerGameFeedback('submit');

      if (turnIndex + 1 >= players.length) {
        setIsFinished(true);
        setIsHandoffPending(false);
      } else {
        setIsHandoffPending(true);
      }
      return;
    }

    if (!currentGuess.trim()) return;

    const updatedChain: ChainEntry[] = [
      ...chain,
      {
        type: 'prompt',
        authorName: activePlayer.name,
        authorAvatarId: activePlayer.avatarId,
        text: currentGuess.trim(),
      },
    ];

    setChain(updatedChain);
    setCurrentGuess('');
    triggerGameFeedback('submit');

    if (turnIndex + 1 >= players.length) {
      setIsFinished(true);
      setIsHandoffPending(false);
    } else {
      setIsHandoffPending(true);
    }
  }, [
    activePlayer,
    chain,
    currentGuess,
    currentStrokes,
    initialPrompt,
    isDrawingTurn,
    isPt,
    players.length,
    turnIndex,
  ]);

  const handleNewGame = useCallback(() => {
    setInitialPrompt(pickDrawPrompt(locale, category, initialPrompt));
    setChain([]);
    setCurrentStrokes([]);
    setCurrentGuess('');
    setIsHandoffPending(false);
    setIsFinished(false);
    triggerGameFeedback('confirm');
  }, [category, initialPrompt, locale]);

  const canSubmit = isDrawingTurn ? currentStrokes.length > 0 : Boolean(currentGuess.trim());

  return {
    isPt,
    players,
    category,
    chain,
    currentStrokes,
    currentGuess,
    setCurrentGuess,
    isHandoffPending,
    isFinished,
    rulesVisible,
    setRulesVisible,
    turnIndex,
    activePlayer,
    isDrawingTurn,
    previousEntry,
    promptToDraw,
    canSubmit,
    handleSelectCategory,
    handleRerollPrompt,
    handleAddStroke,
    handleUndoStroke,
    handleClearCanvas,
    handleAcceptHandoff,
    handleSubmitStep,
    handleNewGame,
  };
}
