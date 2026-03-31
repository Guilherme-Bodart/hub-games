import { useEffect, useMemo } from 'react';

import { ImpostorRound } from '@/src/features/games/impostor/types';

type UseImpostorGameScreenParams = {
  locale: string;
  round: ImpostorRound | null;
  error: string | null;
  setShellPhase?: (phase: string) => void;
};

export function useImpostorGameScreen({ locale, round, error, setShellPhase }: UseImpostorGameScreenParams) {
  const isPt = locale === 'pt';

  const copy = useMemo(
    () => ({
      title: 'Impostor',
      noPlayers: isPt ? 'Minimo de 4 jogadores prontos.' : 'Minimum of 4 ready players.',
      waiting: isPt ? 'Aguardando rodada...' : 'Waiting for round...',
      roundLiveLabel: isPt ? 'Rodada ativa' : 'Round live',
      playersCountCompact: isPt ? 'jogadores' : 'players',
      rulesTitle: isPt ? 'Como funciona' : 'How it works',
      rulesObjective: isPt
        ? 'Cada rodada tem civis e impostor. Os civis recebem a palavra real; o impostor tenta se misturar sem conhecer a resposta.'
        : 'Each round has civilians and an impostor. Civilians get the real word; the impostor tries to blend in without knowing it.',
      rulesStepOne: isPt
        ? 'Revelem o papel em segredo e passem o celular para o proximo jogador.'
        : 'Reveal each role in secret and pass the phone to the next player.',
      rulesStepTwo: isPt
        ? 'Na fase de pistas, cada jogador envia uma palavra curta sem entregar demais.'
        : 'During clues, each player sends one short clue without giving too much away.',
      rulesStepThree: isPt
        ? 'Depois, o grupo decide se continua, vota em suspeitos e tenta identificar o impostor.'
        : 'Then the group decides whether to continue, vote on suspects, and identify the impostor.',
      reveal: isPt ? 'Revelacao' : 'Reveal',
      clues: isPt ? 'Pistas' : 'Clues',
      roundDecision: isPt ? 'Decisao da rodada' : 'Round decision',
      voting: isPt ? 'Votacao' : 'Voting',
      guessing: isPt ? 'Chute' : 'Guess',
      result: isPt ? 'Resultado' : 'Result',
      skipSuspense: isPt ? 'Pular suspense' : 'Skip suspense',
      goClues: isPt ? 'Ir para pistas' : 'Go to clues',
      holdRevealHint: isPt ? 'Segure para revelar.' : 'Hold to reveal.',
      releaseRevealHint: isPt ? 'Solte para ocultar.' : 'Release to hide.',
      clueInput: isPt ? 'Digite 1 palavra curta' : 'Type 1 short word',
      submitClue: isPt ? 'Enviar pista' : 'Send clue',
      goDecision: isPt ? 'Ir para decisao' : 'Go to decision',
      waitingClue: isPt ? 'aguardando...' : 'waiting...',
      roundDecisionHint: isPt
        ? 'Todos votam: mais uma rodada de palavras ou ir para suspeitos.'
        : 'Everyone votes: another clue round or go to suspects.',
      continueClues: isPt ? 'Mais pistas' : 'More clues',
      goSuspects: isPt ? 'Ir para suspeitos' : 'Go to suspects',
      turnOf: isPt ? 'Vez de' : 'Turn',
      unlockVote: isPt ? 'Estou com o celular' : 'I have the phone',
      votePrivacyHint: isPt
        ? 'Passe o celular para o jogador da vez e desbloqueie para votar.'
        : 'Pass the phone to the active player and unlock to vote.',
      guessInput: isPt ? 'Palavra dos civis' : 'Civil prompt',
      submitGuess: isPt ? 'Confirmar chute' : 'Submit guess',
      winnerC: isPt ? 'Civis venceram' : 'Civilians won',
      winnerI: isPt ? 'Impostores venceram' : 'Impostors won',
      suspense: isPt ? 'Sinal instavel...' : 'Signal unstable...',
      defeatBanner: isPt ? 'Derrota dos civis' : 'Civilians defeated',
      victoryBanner: isPt ? 'Vitoria dos civis' : 'Civilians victory',
      impostorRevealSingle: isPt ? 'O impostor era' : 'The impostor was',
      impostorRevealMulti: isPt ? 'Os impostores eram' : 'The impostors were',
      revealBlockTitle: isPt ? 'Revelacao da rodada' : 'Round reveal',
      civilWord: isPt ? 'Palavra dos civis' : 'Civil word',
      impostorSecret: isPt ? 'Segredo do impostor' : 'Impostor secret',
      voteMapTitle: isPt ? 'Quem votou em quem' : 'Who voted for who',
      votesCount: isPt ? 'votos' : 'votes',
      newRound: isPt ? 'Nova rodada' : 'New round',
      back: isPt ? 'Voltar ao lobby' : 'Back to lobby',
      hostOnly: isPt ? 'Apenas host pode confirmar.' : 'Only host can confirm.',
    }),
    [isPt]
  );

  const phaseLabel =
    round?.phase === 'reveal'
      ? copy.reveal
      : round?.phase === 'clues'
        ? copy.clues
        : round?.phase === 'roundDecision'
          ? copy.roundDecision
          : round?.phase === 'voting'
            ? copy.voting
            : round?.phase === 'guessing'
              ? copy.guessing
              : copy.result;

  const shellPhaseLabel = round ? phaseLabel : copy.waiting;

  const topBarStatusTone: 'error' | 'warning' | 'success' | 'info' =
    error || round?.phase === 'guessing'
      ? 'error'
      : round?.phase === 'voting' || round?.phase === 'roundDecision'
        ? 'warning'
        : round?.phase === 'result'
          ? 'success'
          : 'info';

  useEffect(() => {
    setShellPhase?.(shellPhaseLabel);
  }, [setShellPhase, shellPhaseLabel]);

  return {
    isPt,
    copy,
    phaseLabel,
    topBarStatusTone,
  };
}

