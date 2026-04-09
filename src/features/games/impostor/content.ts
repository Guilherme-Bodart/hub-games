import { Locale } from '@/src/i18n';

import { ImpostorPromptMode } from '@/src/features/games/impostor/types';

type LocalizedText = Record<Locale, string>;

type BasePromptDeckEntry = {
  id: string;
  theme: LocalizedText;
  civilPrompt: LocalizedText;
};

type WordPromptDeckEntry = BasePromptDeckEntry & {
  impostorHint: LocalizedText;
  tags: string[];
};

type QuestionPromptDeckEntry = BasePromptDeckEntry & {
  impostorPrompt: LocalizedText;
};

const wordsDeck: WordPromptDeckEntry[] = [
  {
    id: 'w-fast-food',
    theme: { pt: 'Lanche de rua', en: 'Street snack' },
    civilPrompt: { pt: 'Hambúrguer', en: 'Burger' },
    impostorHint: { pt: 'Comida', en: 'Food' },
    tags: ['food', 'snack', 'fast-food'],
  },
  {
    id: 'w-music',
    theme: { pt: 'Palco', en: 'Stage' },
    civilPrompt: { pt: 'Guitarra', en: 'Guitar' },
    impostorHint: { pt: 'Música', en: 'Music' },
    tags: ['music', 'instrument'],
  },
  {
    id: 'w-travel',
    theme: { pt: 'Embarque', en: 'Departure' },
    civilPrompt: { pt: 'Aeroporto', en: 'Airport' },
    impostorHint: { pt: 'Viagem', en: 'Travel' },
    tags: ['travel', 'transport'],
  },
  {
    id: 'w-house',
    theme: { pt: 'Rotina da casa', en: 'Home routine' },
    civilPrompt: { pt: 'Geladeira', en: 'Fridge' },
    impostorHint: { pt: 'Cozinha', en: 'Kitchen' },
    tags: ['home', 'kitchen', 'appliance'],
  },
  {
    id: 'w-sports',
    theme: { pt: 'Dia de jogo', en: 'Game day' },
    civilPrompt: { pt: 'Futebol', en: 'Football' },
    impostorHint: { pt: 'Esporte', en: 'Sport' },
    tags: ['sports', 'ball', 'competition'],
  },
  {
    id: 'w-nature',
    theme: { pt: 'Paisagem', en: 'Landscape' },
    civilPrompt: { pt: 'Cachoeira', en: 'Waterfall' },
    impostorHint: { pt: 'Natureza', en: 'Nature' },
    tags: ['nature', 'water', 'outdoors'],
  },
  {
    id: 'w-office',
    theme: { pt: 'Escritório', en: 'Office' },
    civilPrompt: { pt: 'Reunião', en: 'Meeting' },
    impostorHint: { pt: 'Trabalho', en: 'Work' },
    tags: ['work', 'office', 'team'],
  },
  {
    id: 'w-school',
    theme: { pt: 'Sala de aula', en: 'Classroom' },
    civilPrompt: { pt: 'Caderno', en: 'Notebook' },
    impostorHint: { pt: 'Escola', en: 'School' },
    tags: ['school', 'study', 'classroom'],
  },
];

const questionsDeck: QuestionPromptDeckEntry[] = [
  {
    id: 'q-phone-use',
    theme: { pt: 'Rotina digital', en: 'Digital routine' },
    civilPrompt: {
      pt: 'Quantas vezes por dia você pega no celular?',
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
      pt: 'Quantas horas você dormiu ontem?',
      en: 'How many hours did you sleep last night?',
    },
    impostorPrompt: {
      pt: 'Qual é a média de horas de sono recomendada por noite?',
      en: 'What is the recommended average number of sleep hours per night?',
    },
  },
  {
    id: 'q-water',
    theme: { pt: 'Saúde', en: 'Health' },
    civilPrompt: {
      pt: 'Quantos copos de água você bebe por dia?',
      en: 'How many glasses of water do you drink per day?',
    },
    impostorPrompt: {
      pt: 'Quantos litros de água são recomendados por dia?',
      en: 'How many liters of water are recommended per day?',
    },
  },
  {
    id: 'q-workout',
    theme: { pt: 'Exercício', en: 'Exercise' },
    civilPrompt: {
      pt: 'Quantas vezes por semana você treina?',
      en: 'How many times per week do you work out?',
    },
    impostorPrompt: {
      pt: 'Qual é a média de minutos de atividade física recomendada por semana?',
      en: 'What is the recommended number of minutes of physical activity per week?',
    },
  },
  {
    id: 'q-streaming',
    theme: { pt: 'Entretenimento', en: 'Entertainment' },
    civilPrompt: {
      pt: 'Quantas séries você assistiu no último mês?',
      en: 'How many series did you watch in the last month?',
    },
    impostorPrompt: {
      pt: 'Quantas horas de streaming por semana, em média, as pessoas assistem?',
      en: 'How many hours of streaming per week do people watch on average?',
    },
  },
  {
    id: 'q-coffee',
    theme: { pt: 'Consumo', en: 'Consumption' },
    civilPrompt: {
      pt: 'Quantos cafés você toma por dia?',
      en: 'How many coffees do you drink per day?',
    },
    impostorPrompt: {
      pt: 'Qual é o consumo médio de café por pessoa por dia?',
      en: 'What is the average coffee consumption per person per day?',
    },
  },
];

const pickEntry = <T extends BasePromptDeckEntry>(
  entries: T[],
  random: () => number = Math.random
): T => {
  const selectedIndex = Math.floor(random() * entries.length);
  return entries[selectedIndex] ?? entries[0];
};

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
  if (mode === 'questions') {
    const entry = pickEntry(questionsDeck, random);

    return {
      id: entry.id,
      theme: entry.theme[locale],
      civilPrompt: entry.civilPrompt[locale],
      impostorPrompt: entry.impostorPrompt[locale],
    };
  }

  const entry = pickEntry(wordsDeck, random);

  return {
    id: entry.id,
    theme: entry.theme[locale],
    civilPrompt: entry.civilPrompt[locale],
    impostorPrompt: entry.impostorHint[locale],
  };
};
