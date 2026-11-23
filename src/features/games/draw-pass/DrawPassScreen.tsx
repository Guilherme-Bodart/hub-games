import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { useCallback, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  DRAW_CATEGORIES,
  DrawCategoryId,
  pickDrawPrompt,
} from '@/src/features/games/draw-pass/content';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import {
  AvatarSprite,
  Badge,
  BottomActionDock,
  Button,
  Card,
  GameScreenShell,
  GameTopBar,
  Input,
  Modal,
} from '@/src/ui/atoms';
import { triggerGameFeedback } from '@/src/ui/feedback';

type Point = { x: number; y: number };
type Stroke = {
  color: string;
  size: number;
  points: Point[];
};

type ChainEntry =
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

const PALETTE_COLORS = ['#1E293B', '#EF4444', '#2563EB', '#16A34A', '#D97706', '#9333EA'];

function DrawingBoard({
  strokes,
  interactive,
  onAddStroke,
}: {
  strokes: Stroke[];
  interactive: boolean;
  onAddStroke?: (stroke: Stroke) => void;
}) {
  const [activeColor, setActiveColor] = useState(PALETTE_COLORS[0]);
  const [activePoints, setActivePoints] = useState<Point[]>([]);
  const activePointsRef = useRef<Point[]>([]);
  const activeColorRef = useRef(activeColor);
  activeColorRef.current = activeColor;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => interactive,
        onMoveShouldSetPanResponder: () => interactive,
        onPanResponderGrant: (evt) => {
          if (!interactive) return;
          const pt = { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY };
          activePointsRef.current = [pt];
          setActivePoints([pt]);
        },
        onPanResponderMove: (evt) => {
          if (!interactive) return;
          const pt = { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY };
          activePointsRef.current = [...activePointsRef.current, pt];
          setActivePoints(activePointsRef.current);
        },
        onPanResponderRelease: () => {
          if (!interactive || activePointsRef.current.length === 0) return;
          onAddStroke?.({
            color: activeColorRef.current,
            size: 5,
            points: activePointsRef.current,
          });
          activePointsRef.current = [];
          setActivePoints([]);
        },
      }),
    [interactive, onAddStroke]
  );

  const allStrokes = useMemo(
    () =>
      activePoints.length > 0
        ? [...strokes, { color: activeColor, size: 5, points: activePoints }]
        : strokes,
    [activeColor, activePoints, strokes]
  );

  return (
    <View style={styles.boardWrapper}>
      <View style={styles.canvasSurface} {...panResponder.panHandlers}>
        {allStrokes.map((stroke, strokeIndex) =>
          stroke.points.map((pt, ptIndex) => {
            if (ptIndex === 0) {
              return (
                <View
                  key={`dot-${strokeIndex}-0`}
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: pt.x - stroke.size / 2,
                    top: pt.y - stroke.size / 2,
                    width: stroke.size,
                    height: stroke.size,
                    borderRadius: stroke.size / 2,
                    backgroundColor: stroke.color,
                  }}
                />
              );
            }
            const prev = stroke.points[ptIndex - 1];
            const dx = pt.x - prev.x;
            const dy = pt.y - prev.y;
            const length = Math.max(Math.hypot(dx, dy), stroke.size);
            const angle = Math.atan2(dy, dx);
            const midX = (prev.x + pt.x) / 2;
            const midY = (prev.y + pt.y) / 2;

            return (
              <View
                key={`seg-${strokeIndex}-${ptIndex}`}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: midX - length / 2,
                  top: midY - stroke.size / 2,
                  width: length,
                  height: stroke.size,
                  borderRadius: stroke.size / 2,
                  backgroundColor: stroke.color,
                  transform: [{ rotate: `${angle}rad` }],
                }}
              />
            );
          })
        )}
      </View>

      {interactive ? (
        <View style={styles.paletteRow}>
          {PALETTE_COLORS.map((color) => {
            const isSelected = activeColor === color;
            return (
              <Pressable
                key={color}
                accessibilityRole="button"
                onPress={() => {
                  setActiveColor(color);
                  void Haptics.selectionAsync();
                }}
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: color,
                    borderWidth: isSelected ? 3 : 1,
                    borderColor: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.25)',
                    transform: [{ scale: isSelected ? 1.12 : 1 }],
                  },
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export function DrawPassScreen({ lobby, onExitLobby }: GameRuntimeScreenProps) {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const isPt = locale === 'pt';

  const players = useMemo(
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

  const [category, setCategory] = useState<DrawCategoryId>('all');
  const [initialPrompt, setInitialPrompt] = useState(() => pickDrawPrompt(locale, 'all'));
  const [chain, setChain] = useState<ChainEntry[]>([]);
  const [currentStrokes, setCurrentStrokes] = useState<Stroke[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(false);

  const turnIndex = chain.length;
  const activePlayer = players[turnIndex % Math.max(players.length, 1)];
  // Even turns (0, 2, 4...) draw a prompt; Odd turns (1, 3, 5...) guess the previous drawing!
  const isDrawingTurn = turnIndex % 2 === 0;
  const previousEntry = chain[chain.length - 1];
  const promptToDraw =
    turnIndex === 0
      ? initialPrompt
      : previousEntry?.type === 'prompt'
        ? previousEntry.text
        : initialPrompt;

  const handleSubmitStep = useCallback(() => {
    if (!activePlayer) return;

    if (isDrawingTurn) {
      if (currentStrokes.length === 0) return;

      const updatedChain: ChainEntry[] =
        turnIndex === 0
          ? [
              {
                type: 'prompt',
                authorName: isPt ? 'Tema Inicial' : 'Initial Prompt',
                authorAvatarId: activePlayer.avatarId,
                text: initialPrompt,
              },
              {
                type: 'drawing',
                authorName: activePlayer.name,
                authorAvatarId: activePlayer.avatarId,
                strokes: currentStrokes,
              },
            ]
          : [
              ...chain,
              {
                type: 'drawing',
                authorName: activePlayer.name,
                authorAvatarId: activePlayer.avatarId,
                strokes: currentStrokes,
              },
            ];

      setChain(updatedChain);
      setCurrentStrokes([]);
      triggerGameFeedback('submit');

      if (turnIndex + 1 >= players.length) {
        setIsFinished(true);
      }
      return;
    }

    if (!currentGuess.trim()) return;

    const updatedChain: ChainEntry[] = [
      ...chain,
      {
        type: 'prompt',
        authorName: activePlayer.name,
        authorAvatarId: activePlayer.avatarId,
        text: currentGuess.trim(),
      },
    ];

    setChain(updatedChain);
    setCurrentGuess('');
    triggerGameFeedback('submit');

    if (turnIndex + 1 >= players.length) {
      setIsFinished(true);
    }
  }, [activePlayer, chain, currentGuess, currentStrokes, initialPrompt, isDrawingTurn, isPt, players.length, turnIndex]);

  const handleNewGame = useCallback(() => {
    setInitialPrompt(pickDrawPrompt(locale, category, initialPrompt));
    setChain([]);
    setCurrentStrokes([]);
    setCurrentGuess('');
    setIsFinished(false);
    triggerGameFeedback('confirm');
  }, [category, initialPrompt, locale]);

  return (
    <GameScreenShell
      footerInset={124}
      footer={
        !isFinished ? (
          <BottomActionDock
            helperText={
              isPt
                ? 'Termine sua etapa e passe o celular para o próximo jogador!'
                : 'Finish your step and pass the phone to the next player!'
            }
            layout="row"
            primaryAction={{
              label: isDrawingTurn
                ? isPt
                  ? 'Pronto! Passar celular'
                  : 'Done! Pass phone'
                : isPt
                  ? 'Confirmar chute'
                  : 'Confirm guess',
              onPress: handleSubmitStep,
              disabled: isDrawingTurn ? currentStrokes.length === 0 : !currentGuess.trim(),
              variant: 'primary',
            }}
            secondaryAction={
              isDrawingTurn && currentStrokes.length > 0
                ? {
                    label: isPt ? 'Desfazer' : 'Undo',
                    onPress: () => setCurrentStrokes((prev) => prev.slice(0, -1)),
                    variant: 'ghost',
                  }
                : undefined
            }
          />
        ) : (
          <BottomActionDock
            layout="row"
            primaryAction={{
              label: isPt ? 'Nova Rodada' : 'New Round',
              onPress: handleNewGame,
              variant: 'primary',
            }}
            secondaryAction={{
              label: isPt ? 'Lobby' : 'Lobby',
              onPress: onExitLobby,
              variant: 'ghost',
            }}
          />
        )
      }>
      <GameTopBar
        title={isPt ? 'Desenha e Passa' : 'Draw & Pass'}
        subtitle={
          isFinished
            ? isPt
              ? 'Linha do Tempo Completa'
              : 'Full Chain Reveal'
            : isPt
              ? `Vez de ${activePlayer?.name ?? ''} (${turnIndex + 1}/${players.length})`
              : `${activePlayer?.name ?? ''}'s turn (${turnIndex + 1}/${players.length})`
        }
        onPressLeft={onExitLobby}
        onPressRight={() => setRulesVisible(true)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={isFinished || !isDrawingTurn}>
        {turnIndex === 0 && !isFinished ? (
          <View style={styles.categoryRow}>
            {DRAW_CATEGORIES.map((cat) => {
              const isActive = category === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  accessibilityRole="button"
                  onPress={() => {
                    setCategory(cat.id);
                    setInitialPrompt(pickDrawPrompt(locale, cat.id));
                    void Haptics.selectionAsync();
                  }}
                  style={[
                    styles.categoryPill,
                    {
                      borderColor: isActive
                        ? theme.semantic.button.primary.bg
                        : theme.semantic.border.subtle,
                      backgroundColor: isActive
                        ? theme.semantic.button.primary.bg
                        : theme.semantic.bg.surface,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.categoryPillText,
                      {
                        color: isActive
                          ? theme.semantic.button.primary.text
                          : theme.semantic.text.secondary,
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

        {!isFinished && activePlayer ? (
          <Card>
            <View style={styles.turnHeaderRow}>
              <AvatarSprite avatarId={activePlayer.avatarId} size={40} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.playerTurnName,
                    {
                      color: theme.semantic.text.primary,
                      fontFamily: theme.semantic.typography.titleFamily,
                    },
                  ]}>
                  {activePlayer.name}
                </Text>
                <Text style={{ color: theme.semantic.text.secondary, fontSize: 12 }}>
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
                  onPress={() => {
                    setInitialPrompt(pickDrawPrompt(locale, category, initialPrompt));
                    void Haptics.selectionAsync();
                  }}
                  style={[
                    styles.rerollBtn,
                    {
                      borderColor: theme.semantic.border.subtle,
                      backgroundColor: theme.semantic.bg.elevated,
                    },
                  ]}>
                  <SymbolView
                    name={{ ios: 'arrow.triangle.2.circlepath', android: 'refresh', web: 'refresh' }}
                    size={13}
                    tintColor={theme.semantic.text.secondary}
                  />
                  <Text style={{ color: theme.semantic.text.secondary, fontSize: 11 }}>
                    {isPt ? 'Trocar' : 'Reroll'}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {isDrawingTurn ? (
              <>
                <View
                  style={[
                    styles.promptBanner,
                    {
                      borderColor: theme.semantic.border.subtle,
                      backgroundColor: theme.semantic.bg.elevated,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.promptText,
                      {
                        color: theme.semantic.text.primary,
                        fontFamily: theme.semantic.typography.titleFamily,
                      },
                    ]}>
                    {promptToDraw}
                  </Text>
                </View>

                <DrawingBoard
                  strokes={currentStrokes}
                  interactive
                  onAddStroke={(stroke) => setCurrentStrokes((prev) => [...prev, stroke])}
                />
              </>
            ) : (
              <>
                {previousEntry?.type === 'drawing' ? (
                  <DrawingBoard strokes={previousEntry.strokes} interactive={false} />
                ) : null}
                <Input
                  label={isPt ? 'Seu palpite sobre o desenho' : 'Your guess for the drawing'}
                  value={currentGuess}
                  onChangeText={setCurrentGuess}
                  onSubmitEditing={handleSubmitStep}
                  returnKeyType="done"
                  placeholder={
                    isPt ? 'Ex: Um cachorro dirigindo ônibus...' : 'E.g. A dog driving a bus...'
                  }
                />
              </>
            )}
          </Card>
        ) : null}

        {isFinished ? (
          <Card
            title={isPt ? 'Álbum do Telefone Sem Fio' : 'Broken Telephone Album'}
            subtitle={
              isPt
                ? 'Veja como a frase inicial se transformou de mão em mão!'
                : 'See how the original prompt transformed from player to player!'
            }>
            <View style={styles.timelineList}>
              {chain.map((item, idx) => (
                <View
                  key={`chain-${idx}`}
                  style={[
                    styles.timelineItem,
                    {
                      borderColor: theme.semantic.border.subtle,
                      backgroundColor: theme.semantic.bg.elevated,
                    },
                  ]}>
                  <View style={styles.timelineHeader}>
                    <Badge
                      label={
                        item.type === 'prompt'
                          ? idx === 0
                            ? isPt
                              ? 'Frase Original'
                              : 'Original Prompt'
                            : isPt
                              ? `Chute de ${item.authorName}`
                              : `${item.authorName}'s Guess`
                          : isPt
                            ? `Desenho de ${item.authorName}`
                            : `${item.authorName}'s Drawing`
                      }
                      variant={item.type === 'prompt' ? 'info' : 'success'}
                    />
                  </View>
                  {item.type === 'prompt' ? (
                    <Text
                      style={[
                        styles.timelinePromptText,
                        {
                          color: theme.semantic.text.primary,
                          fontFamily: theme.semantic.typography.titleFamily,
                        },
                      ]}>
                      “{item.text}”
                    </Text>
                  ) : (
                    <DrawingBoard strokes={item.strokes} interactive={false} />
                  )}
                </View>
              ))}
            </View>
          </Card>
        ) : null}
      </ScrollView>

      <Modal
        visible={rulesVisible}
        title={isPt ? 'Regras • Desenha e Passa' : 'Rules • Draw & Pass'}
        onClose={() => setRulesVisible(false)}>
        <Text style={{ color: theme.semantic.text.secondary, fontSize: 14, lineHeight: 20 }}>
          {isPt
            ? '1. O 1º jogador vê uma frase maluca e desenha na tela.'
            : '1. The 1st player sees a crazy prompt and draws it on screen.'}
        </Text>
        <Text style={{ color: theme.semantic.text.secondary, fontSize: 14, lineHeight: 20 }}>
          {isPt
            ? '2. O próximo jogador vê APENAS o desenho (sem a frase!) e escreve o que acha que é.'
            : '2. The next player sees ONLY the drawing and writes what they think it is.'}
        </Text>
        <Text style={{ color: theme.semantic.text.secondary, fontSize: 14, lineHeight: 20 }}>
          {isPt
            ? '3. No final, todos veem a linha do tempo completa de como a história desandou!'
            : '3. At the end, everyone sees the full timeline of how the story went off the rails!'}
        </Text>
      </Modal>
    </GameScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 12,
    paddingBottom: 28,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryPillText: {
    fontSize: 12,
  },
  turnHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerTurnName: {
    fontSize: 17,
  },
  rerollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  promptBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
  },
  boardWrapper: {
    gap: 10,
  },
  canvasSurface: {
    width: '100%',
    height: 250,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    position: 'relative',
  },
  paletteRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 999,
  },
  timelineList: {
    gap: 12,
  },
  timelineItem: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelinePromptText: {
    fontSize: 16,
    lineHeight: 22,
  },
});
