import { Locale } from '@/src/i18n';

export type DrawCategoryTag = 'animals' | 'chaos' | 'party' | 'daily';
export type DrawCategoryId = 'all' | DrawCategoryTag;

export type DrawPromptItem = {
  id: string;
  categories: DrawCategoryTag[];
  text: Record<Locale, string>;
};

export const DRAW_CATEGORIES: Array<{
  id: DrawCategoryId;
  label: Record<Locale, string>;
}> = [
  { id: 'all', label: { pt: 'Todas', en: 'All' } },
  { id: 'animals', label: { pt: 'Animais', en: 'Animals' } },
  { id: 'chaos', label: { pt: 'Caos', en: 'Chaos' } },
  { id: 'party', label: { pt: 'Festa', en: 'Party' } },
  { id: 'daily', label: { pt: 'Cotidiano', en: 'Daily' } },
];

export const drawPromptsCatalog: readonly DrawPromptItem[] = [
  {
    id: 'dp-1',
    categories: ['animals', 'chaos'],
    text: {
      pt: 'Um jacaré levantando peso na academia',
      en: 'An alligator lifting weights at the gym',
    },
  },
  {
    id: 'dp-2',
    categories: ['animals', 'party'],
    text: {
      pt: 'Um pinguim de óculos escuros tocando bateria',
      en: 'A penguin wearing sunglasses playing drums',
    },
  },
  {
    id: 'dp-3',
    categories: ['chaos', 'daily'],
    text: {
      pt: 'Um alienígena tentando fritar um ovo',
      en: 'An alien trying to fry an egg',
    },
  },
  {
    id: 'dp-4',
    categories: ['animals', 'daily'],
    text: {
      pt: 'Um cachorro dirigindo um ônibus lotado',
      en: 'A dog driving a crowded bus',
    },
  },
  {
    id: 'dp-5',
    categories: ['party', 'chaos'],
    text: {
      pt: 'Um pirata andando de skate na praia',
      en: 'A pirate skateboarding at the beach',
    },
  },
  {
    id: 'dp-6',
    categories: ['animals', 'chaos'],
    text: {
      pt: 'Um polvo trabalhando de garçom com 8 bandejas',
      en: 'An octopus working as a waiter with 8 trays',
    },
  },
  {
    id: 'dp-7',
    categories: ['daily', 'party'],
    text: {
      pt: 'Um astronauta comendo pizza na Lua',
      en: 'An astronaut eating pizza on the Moon',
    },
  },
  {
    id: 'dp-8',
    categories: ['animals', 'chaos'],
    text: {
      pt: 'Uma girafa tomando banho de chuveiro',
      en: 'A giraffe taking a shower',
    },
  },
  {
    id: 'dp-9',
    categories: ['chaos', 'party'],
    text: {
      pt: 'Um dinossauro soprando velinha de aniversário',
      en: 'A T-Rex blowing out birthday candles',
    },
  },
  {
    id: 'dp-10',
    categories: ['daily', 'animals'],
    text: {
      pt: 'Um gato gigante dormindo em cima de um prédio',
      en: 'A giant cat sleeping on top of a building',
    },
  },
];

export const pickDrawPrompt = (
  locale: Locale,
  category: DrawCategoryId = 'all',
  excludePrompt?: string
): string => {
  const filtered =
    category === 'all'
      ? drawPromptsCatalog
      : drawPromptsCatalog.filter((item) => item.categories.includes(category));
  const pool = filtered.length > 0 ? filtered : drawPromptsCatalog;
  const candidates = pool
    .map((item) => item.text[locale])
    .filter((text) => text !== excludePrompt);
  const source = candidates.length > 0 ? candidates : pool.map((item) => item.text[locale]);
  return source[Math.floor(Math.random() * source.length)];
};
