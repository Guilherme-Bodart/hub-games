import { Locale } from '@/src/i18n';

import { ImpostorPromptMode } from '@/src/features/games/impostor/types';

type PromptDeckEntry = {
  id: string;
  theme: Record<Locale, string>;
  civilPrompt: Record<Locale, string>;
  impostorPrompt: Record<Locale, string>;
};

const wordsDeck: PromptDeckEntry[] = [
  {
    id: 'w-fast-food',
    theme: { pt: 'Comida rapida', en: 'Fast food' },
    civilPrompt: { pt: 'Hamburguer', en: 'Burger' },
    impostorPrompt: { pt: 'Sanduiche', en: 'Sandwich' },
  },
  {
    id: 'w-music',
    theme: { pt: 'Musica', en: 'Music' },
    civilPrompt: { pt: 'Guitarra', en: 'Guitar' },
    impostorPrompt: { pt: 'Violao', en: 'Acoustic guitar' },
  },
  {
    id: 'w-travel',
    theme: { pt: 'Viagem', en: 'Travel' },
    civilPrompt: { pt: 'Aeroporto', en: 'Airport' },
    impostorPrompt: { pt: 'Rodoviaria', en: 'Bus terminal' },
  },
  {
    id: 'w-house',
    theme: { pt: 'Casa', en: 'Home' },
    civilPrompt: { pt: 'Geladeira', en: 'Fridge' },
    impostorPrompt: { pt: 'Freezer', en: 'Freezer' },
  },
  {
    id: 'w-sports',
    theme: { pt: 'Esporte', en: 'Sports' },
    civilPrompt: { pt: 'Futebol', en: 'Football' },
    impostorPrompt: { pt: 'Futsal', en: 'Indoor football' },
  },
  {
    id: 'w-nature',
    theme: { pt: 'Natureza', en: 'Nature' },
    civilPrompt: { pt: 'Cachoeira', en: 'Waterfall' },
    impostorPrompt: { pt: 'Rio', en: 'River' },
  },
  {
    id: 'w-office',
    theme: { pt: 'Trabalho', en: 'Work' },
    civilPrompt: { pt: 'Reuniao', en: 'Meeting' },
    impostorPrompt: { pt: 'Workshop', en: 'Workshop' },
  },
  {
    id: 'w-school',
    theme: { pt: 'Escola', en: 'School' },
    civilPrompt: { pt: 'Caderno', en: 'Notebook' },
    impostorPrompt: { pt: 'Livro', en: 'Book' },
  },
];

const questionsDeck: PromptDeckEntry[] = [
  {
    id: 'q-phone-use',
    theme: { pt: 'Rotina digital', en: 'Digital routine' },
    civilPrompt: {
      pt: 'Quantas vezes por dia voce pega no celular?',
      en: 'How many times per day do you pick up your phone?',
    },
    impostorPrompt: {
      pt: 'Quantas horas por dia um brasileiro passa nas redes sociais?',
      en: 'How many hours per day does an average person spend on social media?',
    },
  },
  {
    id: 'q-sleep',
    theme: { pt: 'Sono', en: 'Sleep' },
    civilPrompt: {
      pt: 'Quantas horas voce dormiu ontem?',
      en: 'How many hours did you sleep last night?',
    },
    impostorPrompt: {
      pt: 'Qual a media de horas de sono recomendada por noite?',
      en: 'What is the recommended average number of sleep hours per night?',
    },
  },
  {
    id: 'q-water',
    theme: { pt: 'Saude', en: 'Health' },
    civilPrompt: {
      pt: 'Quantos copos de agua voce bebe por dia?',
      en: 'How many glasses of water do you drink per day?',
    },
    impostorPrompt: {
      pt: 'Quantos litros de agua sao recomendados por dia?',
      en: 'How many liters of water are recommended per day?',
    },
  },
  {
    id: 'q-workout',
    theme: { pt: 'Exercicio', en: 'Exercise' },
    civilPrompt: {
      pt: 'Quantas vezes por semana voce treina?',
      en: 'How many times per week do you work out?',
    },
    impostorPrompt: {
      pt: 'Qual a media de minutos de atividade fisica por semana recomendada?',
      en: 'What is the recommended weekly minutes of physical activity?',
    },
  },
  {
    id: 'q-streaming',
    theme: { pt: 'Entretenimento', en: 'Entertainment' },
    civilPrompt: {
      pt: 'Quantas series voce assistiu no ultimo mes?',
      en: 'How many series did you watch in the last month?',
    },
    impostorPrompt: {
      pt: 'Quantas horas de streaming por semana em media as pessoas assistem?',
      en: 'How many hours of streaming per week do people watch on average?',
    },
  },
  {
    id: 'q-coffee',
    theme: { pt: 'Consumo', en: 'Consumption' },
    civilPrompt: {
      pt: 'Quantos cafes voce toma por dia?',
      en: 'How many coffees do you drink per day?',
    },
    impostorPrompt: {
      pt: 'Qual o consumo medio de cafe por pessoa por dia?',
      en: 'What is the average coffee consumption per person per day?',
    },
  },
];

const pickEntry = (entries: PromptDeckEntry[], random: () => number = Math.random): PromptDeckEntry => {
  const selectedIndex = Math.floor(random() * entries.length);
  return entries[selectedIndex] ?? entries[0];
};

const WORDS_IMPOSTOR_TOKEN = 'IMPOSTOR';

export const getPromptDeckSize = (mode: ImpostorPromptMode): number =>
  mode === 'questions' ? questionsDeck.length : wordsDeck.length;

export const pickImpostorPromptEntry = (
  mode: ImpostorPromptMode,
  locale: Locale,
  random: () => number = Math.random
): {
  id: string;
  theme: string;
  civilPrompt: string;
  impostorPrompt: string;
} => {
  const entry = pickEntry(mode === 'questions' ? questionsDeck : wordsDeck, random);

  return {
    id: entry.id,
    theme: entry.theme[locale],
    civilPrompt: entry.civilPrompt[locale],
    impostorPrompt: mode === 'words' ? WORDS_IMPOSTOR_TOKEN : entry.impostorPrompt[locale],
  };
};
