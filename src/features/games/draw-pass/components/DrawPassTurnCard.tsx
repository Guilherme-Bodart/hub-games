import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { DrawingBoard } from '@/src/features/games/draw-pass/components/DrawingBoard';
import { DRAW_CATEGORIES, DrawCategoryId } from '@/src/features/games/draw-pass/content';
import { drawPassStyles as styles } from '@/src/features/games/draw-pass/styles/drawPassStyles';
import {
  ChainEntry,
  DrawPassPlayer,
  Stroke,
} from '@/src/features/games/draw-pass/types/drawPass.types';
import { Locale } from '@/src/i18n';
import { getGameAccent, useTheme } from '@/src/theme';
import { AvatarSprite, Card, Input } from '@/src/ui/atoms';

type DrawPassTurnCardProps = {
  locale: Locale;
  isPt: boolean;
  turnIndex: number;
  category: DrawCategoryId;
  activePlayer: DrawPassPlayer;
  isDrawingTurn: boolean;
  promptToDraw: string;
  currentStrokes: Stroke[];
  currentGuess: string;
  previousEntry?: ChainEntry;
  onSelectCategory: (id: DrawCategoryId) => void;
  onRerollPrompt: () => void;
  onAddStroke: (stroke: Stroke) => void;
  onClearCanvas: () => void;
  onChangeGuess: (text: string) => void;
  onSubmitStep: () => void;
};

export function DrawPassTurnCard({
  locale,
  isPt,
  turnIndex,
  category,
  activePlayer,
  isDrawingTurn,
  promptToDraw,
  currentStrokes,
  currentGuess,
  previousEntry,
  onSelectCategory,
  onRerollPrompt,
  onAddStroke,
  onClearCanvas,
  onChangeGuess,
  onSubmitStep,
}: DrawPassTurnCardProps) {
  const { theme } = useTheme();
  const accent = getGameAccent('draw-pass');

  return (
    <>
      {turnIndex === 0 ? (
        <View style={styles.categoryRow}>
          {DRAW_CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <Pressable
                key={cat.id}
                accessibilityRole="button"
                onPress={() => onSelectCategory(cat.id)}
                style={[
                  styles.categoryPill,
                  {
                    borderColor: isActive ? accent.primary : theme.semantic.border.hairline,
                    backgroundColor: isActive ? accent.primary : theme.semantic.bg.surface,
                  },
                ]}>
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isActive ? accent.textOnPrimary : theme.semantic.text.secondary,
                      fontFamily: theme.semantic.typography.titleFamily,
                    },
                  ]}>
                  {cat.label[locale]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Card>
        <View style={styles.turnHeaderRow}>
          <AvatarSprite avatarId={activePlayer.avatarId} size={40} />
          <View style={styles.turnHeaderTextWrap}>
            <Text
              style={[
                styles.playerTurnName,
                { color: theme.semantic.text.primary, fontFamily: theme.semantic.typography.titleFamily },
              ]}>
              {activePlayer.name}
            </Text>
            <Text style={[styles.turnInstruction, { color: theme.semantic.text.secondary }]}>
              {isDrawingTurn
                ? isPt
                  ? 'Desenhe a frase abaixo sem escrever letras!'
                  : 'Draw the prompt below without writing letters!'
                : isPt
                  ? 'O que você acha que é esse desenho?'
                  : 'What do you think this drawing is?'}
            </Text>
          </View>
          {turnIndex === 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={onRerollPrompt}
              style={[
                styles.rerollBtn,
                { borderColor: theme.semantic.border.hairline, backgroundColor: theme.semantic.bg.subtle },
              ]}>
              <SymbolView
                name={{ ios: 'arrow.triangle.2.circlepath', android: 'refresh', web: 'refresh' }}
                size={13}
                tintColor={theme.semantic.text.secondary}
              />
              <Text style={[styles.rerollBtnText, { color: theme.semantic.text.secondary }]}>
                {isPt ? 'Trocar' : 'Reroll'}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {isDrawingTurn ? (
          <>
            <View style={[styles.promptBanner, { borderColor: accent.primary, backgroundColor: accent.tint }]}>
              <Text style={[styles.promptEyebrow, { color: accent.primary, fontFamily: theme.semantic.typography.titleFamily }]}>
                {isPt ? 'TEMA PARA DESENHAR' : 'PROMPT TO DRAW'}
              </Text>
              <Text style={[styles.promptText, { color: theme.semantic.text.primary, fontFamily: theme.semantic.typography.titleFamily }]}>
                {promptToDraw}
              </Text>
            </View>
            <DrawingBoard
              strokes={currentStrokes}
              interactive
              isPt={isPt}
              onAddStroke={onAddStroke}
              onClear={onClearCanvas}
            />
          </>
        ) : (
          <>
            {previousEntry?.type === 'drawing' ? (
              <DrawingBoard strokes={previousEntry.strokes} interactive={false} isPt={isPt} />
            ) : null}
            <Input
              label={isPt ? 'Seu palpite sobre o desenho' : 'Your guess for the drawing'}
              value={currentGuess}
              onChangeText={onChangeGuess}
              onSubmitEditing={onSubmitStep}
              returnKeyType="done"
              placeholder={isPt ? 'Ex: Um cachorro dirigindo ônibus...' : 'E.g. A dog driving a bus...'}
            />
          </>
        )}
      </Card>
    </>
  );
}
