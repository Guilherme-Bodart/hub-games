import { DrawCategoryId } from '@/src/features/games/draw-pass/content';

export type Point = {
  x: number;
  y: number;
};

export type Stroke = {
  color: string;
  size: number;
  points: Point[];
};

export type DrawPassPlayer = {
  id: string;
  name: string;
  avatarId: number;
};

export type ChainEntry =
  | {
      type: 'prompt';
      authorName: string;
      authorAvatarId: number;
      text: string;
    }
  | {
      type: 'drawing';
      authorName: string;
      authorAvatarId: number;
      strokes: Stroke[];
    };

export type DrawPassCategory = DrawCategoryId;
