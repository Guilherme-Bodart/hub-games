import { Locale } from '@/src/i18n';

export type FlagCategoryTag = 'romantic' | 'funny' | 'chaos' | 'daily';
export type FlagCategoryId = 'all' | FlagCategoryTag;

export type FlagCardItem = {
  id: string;
  categories: FlagCategoryTag[];
  text: Record<Locale, string>;
};

export const FLAG_CATEGORIES: Array<{
  id: FlagCategoryId;
  label: Record<Locale, string>;
}> = [
  { id: 'all', label: { pt: 'Todas', en: 'All' } },
  { id: 'funny', label: { pt: 'Engraçadas', en: 'Funny' } },
  { id: 'chaos', label: { pt: 'Caos', en: 'Chaos' } },
  { id: 'romantic', label: { pt: 'Românticas', en: 'Romantic' } },
  { id: 'daily', label: { pt: 'Cotidiano', en: 'Daily' } },
];

export const greenFlagsCatalog: readonly FlagCardItem[] = [
  {
    id: 'gf-1',
    categories: ['romantic', 'daily'],
    text: {
      pt: 'Cozinha como um chef profissional todas as noites para você',
      en: 'Cooks like a professional chef for you every night',
    },
  },
  {
    id: 'gf-2',
    categories: ['romantic', 'funny'],
    text: {
      pt: 'Paga todas as viagens de férias do casal para qualquer lugar do mundo',
      en: 'Pays for all couple vacations anywhere in the world',
    },
  },
  {
    id: 'gf-3',
    categories: ['daily', 'romantic'],
    text: {
      pt: 'Sempre faz massagem nos seus pés depois de um dia cansativo',
      en: 'Always gives you a foot massage after a tiring day',
    },
  },
  {
    id: 'gf-4',
    categories: ['funny', 'daily'],
    text: {
      pt: 'Tem uma casa na praia incrível sempre liberada para os seus amigos',
      en: 'Owns an amazing beach house always open for your friends',
    },
  },
  {
    id: 'gf-5',
    categories: ['romantic', 'daily'],
    text: {
      pt: 'Lembra de todas as datas importantes e dá presentes perfeitos',
      en: 'Remembers every important date and gives perfect gifts',
    },
  },
  {
    id: 'gf-6',
    categories: ['daily', 'funny'],
    text: {
      pt: 'Faz toda a faxina da casa cantando e sem reclamar de nada',
      en: 'Does all the house cleaning singing and without complaining',
    },
  },
  {
    id: 'gf-7',
    categories: ['romantic', 'chaos'],
    text: {
      pt: 'Te defende em qualquer discussão mesmo quando você está 100% errado(a)',
      en: 'Defends you in any argument even when you are 100% wrong',
    },
  },
  {
    id: 'gf-8',
    categories: ['funny', 'daily'],
    text: {
      pt: 'Tem contatos VIP para entrar de graça em todos os shows e festas',
      en: 'Has VIP contacts to get into every concert and party for free',
    },
  },
  {
    id: 'gf-9',
    categories: ['romantic'],
    text: {
      pt: 'Tem o sorriso mais bonito do mundo e cheira perfeitamente bem 24h',
      en: 'Has the most beautiful smile and smells amazing 24/7',
    },
  },
  {
    id: 'gf-10',
    categories: ['daily', 'romantic'],
    text: {
      pt: 'Adora sua família e faz todo mundo rir nos almoços de domingo',
      en: 'Loves your family and makes everyone laugh at Sunday lunches',
    },
  },
  {
    id: 'gf-11',
    categories: ['funny', 'chaos'],
    text: {
      pt: 'Ganhou na loteria e divide a conta bancária com você sem perguntas',
      en: 'Won the lottery and shares the bank account with you no questions asked',
    },
  },
  {
    id: 'gf-12',
    categories: ['daily'],
    text: {
      pt: 'Sempre dirige na volta das festas para você curtir em paz',
      en: 'Always drives back from parties so you can enjoy in peace',
    },
  },
];

export const redFlagsCatalog: readonly FlagCardItem[] = [
  {
    id: 'rf-1',
    categories: ['funny', 'chaos'],
    text: {
      pt: 'Mas fala com voz de bebê em público quando está com fome',
      en: 'But speaks in a baby voice in public whenever hungry',
    },
  },
  {
    id: 'rf-2',
    categories: ['chaos', 'daily'],
    text: {
      pt: 'Mas bate palma entusiasticamente toda vez que o avião pousa ou o filme acaba',
      en: 'But claps enthusiastically every time a plane lands or a movie ends',
    },
  },
  {
    id: 'rf-3',
    categories: ['funny', 'daily'],
    text: {
      pt: 'Mas exige dormir com 6 cachorros em cima da cama todas as noites',
      en: 'But insists on sleeping with 6 dogs on the bed every single night',
    },
  },
  {
    id: 'rf-4',
    categories: ['chaos', 'funny'],
    text: {
      pt: 'Mas narra a própria vida em voz alta como se fosse o Galvão Bueno',
      en: 'But narrates their own life out loud like a sports commentator',
    },
  },
  {
    id: 'rf-5',
    categories: ['daily', 'romantic'],
    text: {
      pt: 'Mas manda áudio de 9 minutos no WhatsApp para responder um simples "sim"',
      en: 'But sends 9-minute voice notes just to answer a simple "yes"',
    },
  },
  {
    id: 'rf-6',
    categories: ['chaos', 'funny'],
    text: {
      pt: 'Mas acredita fielmente que a Terra tem formato de coxinha',
      en: 'But genuinely believes the Earth is shaped like a giant donut',
    },
  },
  {
    id: 'rf-7',
    categories: ['daily', 'funny'],
    text: {
      pt: 'Mas usa meia branca com chinelo até em casamento chique',
      en: 'But wears white socks with flip-flops even at fancy weddings',
    },
  },
  {
    id: 'rf-8',
    categories: ['romantic', 'chaos'],
    text: {
      pt: 'Mas pede opinião da mãe por chamada de vídeo antes de pedir qualquer prato no restaurante',
      en: 'But video-calls their mom before ordering any dish at a restaurant',
    },
  },
  {
    id: 'rf-9',
    categories: ['funny', 'daily'],
    text: {
      pt: 'Mas dá spoiler do final de todas as séries que vocês começam a assistir',
      en: 'But spoils the ending of every series you start watching together',
    },
  },
  {
    id: 'rf-10',
    categories: ['chaos', 'funny'],
    text: {
      pt: 'Mas faz dancinha de TikTok no meio da fila do supermercado',
      en: 'But performs TikTok dances in the middle of the grocery store line',
    },
  },
  {
    id: 'rf-11',
    categories: ['daily', 'chaos'],
    text: {
      pt: 'Mas coloca ketchup no brigadeiro, na pizza e até no café',
      en: 'But puts ketchup on dessert, pizza, and even coffee',
    },
  },
  {
    id: 'rf-12',
    categories: ['funny', 'romantic'],
    text: {
      pt: 'Mas tem uma tatuagem gigante do rosto do ex nas costas',
      en: 'But has a giant tattoo of their ex face on their back',
    },
  },
];

export const getFilteredFlags = (
  catalog: readonly FlagCardItem[],
  locale: Locale,
  category: FlagCategoryId = 'all'
): string[] => {
  const filtered =
    category === 'all'
      ? catalog
      : catalog.filter((item) => item.categories.includes(category));
  const list = filtered.length >= 3 ? filtered : catalog;
  return list.map((item) => item.text[locale]);
};
