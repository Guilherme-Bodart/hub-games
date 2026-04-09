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
      noPlayers: isPt ? 'Mínimo de 4 jogadores prontos.' : 'Minimum of 4 ready players.',
      waiting: isPt ? 'Aguardando rodada...' : 'Waiting for round...',
      playersCountCompact: isPt ? 'jogadores' : 'players',
      roundTheme: isPt ? 'Tema da rodada' : 'Round theme',
      wordsMode: isPt ? 'Palavra secreta' : 'Secret word',
      questionsMode: isPt ? 'Pergunta secreta' : 'Secret question',
      rulesTitle: isPt ? 'Como funciona' : 'How it works',
      rulesObjective: isPt
        ? 'Cada rodada tem civis e impostor. Os civis recebem a palavra real; o impostor recebe apenas uma dica ampla e tenta se misturar.'
        : 'Each round has civilians and an impostor. Civilians get the real word; the impostor gets only a broad hint and tries to blend in.',
      rulesStepOne: isPt
        ? 'Revelem o papel em segredo e passem o celular para o próximo jogador.'
        : 'Reveal each role in secret and pass the phone to the next player.',
      rulesStepTwo: isPt
        ? 'Na fase de pistas, cada jogador envia uma palavra curta sem entregar demais.'
        : 'During clues, each player sends one short clue without giving too much away.',
      rulesStepThree: isPt
        ? 'Depois, o grupo decide se continua, vota em suspeitos e tenta identificar o impostor.'
        : 'Then the group decides whether to continue, vote on suspects, and identify the impostor.',
      reveal: isPt ? 'Revelação' : 'Reveal',
      revealStageEyebrow: isPt ? 'Passe o celular' : 'Pass the phone',
      revealStageTitle: isPt ? 'Cada jogador revela em segredo' : 'Each player reveals in secret',
      revealStageHint: isPt
        ? 'Segure sua carta, memorize a informação e entregue o celular para o próximo.'
        : 'Hold your card, memorize the info, and hand the phone to the next player.',
      revealQueueLabel: isPt ? 'Ordem local de revelação' : 'Local reveal order',
      revealWaitingLabel: isPt ? 'Aguardando jogador local' : 'Waiting for local player',
      revealPassLabel: isPt ? 'Passe o celular' : 'Pass the phone',
      revealPlayerProgress: isPt ? 'Jogador' : 'Player',
      revealNextPlayer: isPt ? 'Próximo jogador' : 'Next player',
      revealEmptyLabel: isPt
        ? 'Nenhum jogador local pronto para revelar neste aparelho.'
        : 'No local player is ready to reveal on this device.',
      revealSpotlightTitle: isPt ? 'Segredo revelado' : 'Revealed secret',
      revealCivilPromptLabel: isPt ? 'Palavra do civil' : 'Civil word',
      revealImpostorPromptLabel: isPt ? 'Dica do impostor' : 'Impostor hint',
      revealImpostorHint: isPt
        ? 'Você não recebeu a palavra exata. Use essa dica ampla para blefar.'
        : 'You did not receive the exact word. Use this broad hint to bluff.',
      revealCivilHint: isPt
        ? 'Guarde a palavra exata e dê uma pista sem entregar demais.'
        : 'Keep the exact word secret and give a clue without giving too much away.',
      clues: isPt ? 'Pista' : 'Clue',
      cluesStageEyebrow: isPt ? 'Rodada em andamento' : 'Round in motion',
      cluesStageHint: isPt ? 'Pistas curtas, ritmo rápido e nada de entregar demais.' : 'Keep clues short, quick, and subtle.',
      roundDecision: isPt ? 'Decisão da rodada' : 'Round decision',
      voting: isPt ? 'Votação' : 'Voting',
      guessing: isPt ? 'Chute' : 'Guess',
      guessingStageTitle: isPt ? 'Última chance do impostor' : 'Impostor last chance',
      guessingStageHint: isPt
        ? 'Se acertar a palavra dos civis, o impostor rouba a rodada.'
        : 'If the impostor guesses the civilian word, the round flips.',
      result: isPt ? 'Resultado' : 'Result',
      skipSuspense: isPt ? 'Pular suspense' : 'Skip suspense',
      goClues: isPt ? 'Ir para pistas' : 'Go to clues',
      holdRevealHint: isPt ? 'Segure para revelar.' : 'Hold to reveal.',
      releaseRevealHint: isPt ? 'Solte para ocultar.' : 'Release to hide.',
      clueInput: isPt ? 'Digite uma palavra' : 'Type one word',
      submitClue: isPt ? 'Enviar pista' : 'Send clue',
      goDecision: isPt ? 'Ir para decisão' : 'Go to decision',
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
      suspense: isPt ? 'Sinal instável...' : 'Signal unstable...',
      defeatBanner: isPt ? 'Derrota dos civis' : 'Civilians defeated',
      victoryBanner: isPt ? 'Vitória dos civis' : 'Civilians win',
      impostorRevealSingle: isPt ? 'O impostor era' : 'The impostor was',
      impostorRevealMulti: isPt ? 'Os impostores eram' : 'The impostors were',
      revealBlockTitle: isPt ? 'Revelação da rodada' : 'Round reveal',
      civilWord: isPt ? 'Palavra dos civis' : 'Civil word',
      impostorSecret: isPt ? 'Segredo do impostor' : 'Impostor secret',
      impostorHintWord: isPt ? 'Dica recebida pelo impostor' : 'Hint shown to the impostor',
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

