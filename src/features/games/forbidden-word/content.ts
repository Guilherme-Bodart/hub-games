import { Locale } from '@/src/i18n';

export type ForbiddenCategoryTag = 'party' | 'daily' | 'pop' | 'food';
export type ForbiddenCategoryId = 'all' | ForbiddenCategoryTag;

export type ForbiddenCardItem = {
  id: string;
  categories: ForbiddenCategoryTag[];
  word: Record<Locale, string>;
  forbidden: Record<Locale, [string, string, string, string]>;
};

export const FORBIDDEN_CATEGORIES: Array<{
  id: ForbiddenCategoryId;
  label: Record<Locale, string>;
}> = [
  { id: 'all', label: { pt: 'Todas', en: 'All' } },
  { id: 'party', label: { pt: 'Festa & Rolê', en: 'Party & Fun' } },
  { id: 'daily', label: { pt: 'Cotidiano', en: 'Daily Life' } },
  { id: 'pop', label: { pt: 'Cultura Pop', en: 'Pop Culture' } },
  { id: 'food', label: { pt: 'Comidas', en: 'Foods' } },
];

export const forbiddenCardsCatalog: readonly ForbiddenCardItem[] = [
  {
    id: 'fw-1',
    categories: ['food', 'party'],
    word: { pt: 'CHURRASCO', en: 'BARBECUE' },
    forbidden: {
      pt: ['Carne', 'Carvão', 'Espeto', 'Picanha'],
      en: ['Meat', 'Charcoal', 'Grill', 'Steak'],
    },
  },
  {
    id: 'fw-2',
    categories: ['party', 'daily'],
    word: { pt: 'KARAOKÊ', en: 'KARAOKE' },
    forbidden: {
      pt: ['Cantar', 'Microfone', 'Música', 'Letra'],
      en: ['Sing', 'Microphone', 'Music', 'Lyrics'],
    },
  },
  {
    id: 'fw-3',
    categories: ['daily'],
    word: { pt: 'DESPERTADOR', en: 'ALARM CLOCK' },
    forbidden: {
      pt: ['Acordar', 'Manhã', 'Sono', 'Soneca'],
      en: ['Wake up', 'Morning', 'Sleep', 'Snooze'],
    },
  },
  {
    id: 'fw-4',
    categories: ['pop'],
    word: { pt: 'HOMEM-ARANHA', en: 'SPIDER-MAN' },
    forbidden: {
      pt: ['Teia', 'Peter Parker', 'Herói', 'Marvel'],
      en: ['Web', 'Peter Parker', 'Hero', 'Marvel'],
    },
  },
  {
    id: 'fw-5',
    categories: ['food', 'daily'],
    word: { pt: 'PIPOCA', en: 'POPCORN' },
    forbidden: {
      pt: ['Cinema', 'Milho', 'Manteiga', 'Panela'],
      en: ['Cinema', 'Corn', 'Butter', 'Movie'],
    },
  },
  {
    id: 'fw-6',
    categories: ['party', 'daily'],
    word: { pt: 'PRAIA', en: 'BEACH' },
    forbidden: {
      pt: ['Mar', 'Areia', 'Sol', 'Onda'],
      en: ['Sea', 'Sand', 'Sun', 'Wave'],
    },
  },
  {
    id: 'fw-7',
    categories: ['daily', 'pop'],
    word: { pt: 'SELFIE', en: 'SELFIE' },
    forbidden: {
      pt: ['Foto', 'Celular', 'Câmera', 'Rosto'],
      en: ['Photo', 'Phone', 'Camera', 'Face'],
    },
  },
  {
    id: 'fw-8',
    categories: ['food', 'party'],
    word: { pt: 'BRIGADEIRO', en: 'CHOCOLATE FUDGE' },
    forbidden: {
      pt: ['Chocolate', 'Leite Condensado', 'Festa', 'Granulado'],
      en: ['Chocolate', 'Sweet', 'Party', 'Sprinkles'],
    },
  },
  {
    id: 'fw-9',
    categories: ['pop', 'party'],
    word: { pt: 'CARNAVAL', en: 'CARNIVAL' },
    forbidden: {
      pt: ['Bloco', 'Fantasia', 'Samba', 'Feriado'],
      en: ['Parade', 'Costume', 'Samba', 'Music'],
    },
  },
  {
    id: 'fw-10',
    categories: ['daily'],
    word: { pt: 'ELEVADOR', en: 'ELEVATOR' },
    forbidden: {
      pt: ['Prédio', 'Subir', 'Andar', 'Escada'],
      en: ['Building', 'Floor', 'Up', 'Stairs'],
    },
  },
];

export const getForbiddenDeck = (category: ForbiddenCategoryId = 'all'): ForbiddenCardItem[] => {
  const filtered =
    category === 'all'
      ? forbiddenCardsCatalog
      : forbiddenCardsCatalog.filter((card) => card.categories.includes(category));
  return [...(filtered.length > 0 ? filtered : forbiddenCardsCatalog)];
};
