import { useCallback, useMemo, useState } from 'react';

import {
  FlagCategoryId,
  getFilteredFlags,
  greenFlagsCatalog,
  redFlagsCatalog,
} from '@/src/features/games/red-green-flag/content';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { Locale } from '@/src/i18n';
import { triggerGameFeedback, triggerHaptic } from '@/src/ui/feedback';

export type FlagPlayer = {
  id: string;
  name: string;
  avatarId: number;
};

export type CandidateSubmission = {
  cupidId: string;
  cupidName: string;
  cupidAvatarId: number;
  greenFlag: string;
  redFlag: string;
};

export type RedGreenFlagPhase = 'building' | 'pitching' | 'result';

const shuffleArray = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export function useRedGreenFlagGame(lobby: GameRuntimeScreenProps['lobby'], locale: Locale) {
  const isPt = locale === 'pt';

  const players = useMemo<FlagPlayer[]>(
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

  const [category, setCategory] = useState<FlagCategoryId>('all');
  const [singleIndex, setSingleIndex] = useState(0);
  const [phase, setPhase] = useState<RedGreenFlagPhase>('building');
  const [activeCupidTurn, setActiveCupidTurn] = useState(0);
  const [isCupidHandoff, setIsCupidHandoff] = useState(false);
  const [selectedGreen, setSelectedGreen] = useState<string | null>(null);
  const [selectedRed, setSelectedRed] = useState<string | null>(null);
  const [handSeed, setHandSeed] = useState(0);
  const [submissions, setSubmissions] = useState<CandidateSubmission[]>([]);
  const [winningCupidId, setWinningCupidId] = useState<string | null>(null);
  const [rulesVisible, setRulesVisible] = useState(false);

  const singlePlayer = players[singleIndex % Math.max(players.length, 1)];
  const cupids = useMemo(
    () => players.filter((player) => player.id !== singlePlayer?.id),
    [players, singlePlayer?.id]
  );
  const currentCupid = cupids[activeCupidTurn];

  const currentHand = useMemo(() => {
    const greens = shuffleArray(getFilteredFlags(greenFlagsCatalog, locale, category)).slice(0, 3);
    const reds = shuffleArray(getFilteredFlags(redFlagsCatalog, locale, category)).slice(0, 3);
    return { greens, reds };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, locale, activeCupidTurn, singleIndex, handSeed]);

  const handleSelectCategory = useCallback((nextCategory: FlagCategoryId) => {
    setCategory(nextCategory);
    setSelectedGreen(null);
    setSelectedRed(null);
    triggerHaptic('selection');
  }, []);

  const handleRerollHand = useCallback(() => {
    setSelectedGreen(null);
    setSelectedRed(null);
    setHandSeed((prev) => prev + 1);
    triggerHaptic('selection');
  }, []);

  const handleSelectGreen = useCallback((flagText: string) => {
    setSelectedGreen(flagText);
    triggerHaptic('selection');
  }, []);

  const handleSelectRed = useCallback((flagText: string) => {
    setSelectedRed(flagText);
    triggerHaptic('selection');
  }, []);

  const handleAcceptCupidHandoff = useCallback(() => {
    setIsCupidHandoff(false);
    triggerGameFeedback('reveal');
  }, []);

  const handleConfirmCandidate = useCallback(() => {
    if (!currentCupid || !selectedGreen || !selectedRed) {
      return;
    }

    const nextSubmissions: CandidateSubmission[] = [
      ...submissions,
      {
        cupidId: currentCupid.id,
        cupidName: currentCupid.name,
        cupidAvatarId: currentCupid.avatarId,
        greenFlag: selectedGreen,
        redFlag: selectedRed,
      },
    ];

    setSubmissions(nextSubmissions);
    setSelectedGreen(null);
    setSelectedRed(null);
    triggerGameFeedback('submit');

    if (activeCupidTurn + 1 < cupids.length) {
      setActiveCupidTurn((prev) => prev + 1);
      setIsCupidHandoff(true);
    } else {
      setIsCupidHandoff(false);
      setPhase('pitching');
    }
  }, [activeCupidTurn, cupids.length, currentCupid, selectedGreen, selectedRed, submissions]);

  const handleSelectWinner = useCallback((cupidId: string) => {
    setWinningCupidId(cupidId);
    triggerHaptic('selection');
  }, []);

  const handleConfirmMatch = useCallback(() => {
    if (!winningCupidId) return;
    triggerGameFeedback('result');
    setPhase('result');
  }, [winningCupidId]);

  const handleStartNextRound = useCallback(() => {
    setSingleIndex((prev) => (prev + 1) % Math.max(players.length, 1));
    setPhase('building');
    setActiveCupidTurn(0);
    setIsCupidHandoff(false);
    setSelectedGreen(null);
    setSelectedRed(null);
    setSubmissions([]);
    setWinningCupidId(null);
    setHandSeed((prev) => prev + 1);
    triggerGameFeedback('confirm');
  }, [players.length]);

  const winningSubmission = submissions.find((item) => item.cupidId === winningCupidId);

  return {
    isPt,
    players,
    category,
    phase,
    singlePlayer,
    cupids,
    activeCupidTurn,
    currentCupid,
    isCupidHandoff,
    currentHand,
    selectedGreen,
    selectedRed,
    submissions,
    winningCupidId,
    winningSubmission,
    rulesVisible,
    setRulesVisible,
    handleSelectCategory,
    handleRerollHand,
    handleSelectGreen,
    handleSelectRed,
    handleAcceptCupidHandoff,
    handleConfirmCandidate,
    handleSelectWinner,
    handleConfirmMatch,
    handleStartNextRound,
  };
}
