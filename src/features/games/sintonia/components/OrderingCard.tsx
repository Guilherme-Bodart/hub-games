import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, memo } from 'react';
import { Text, View } from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';

import { useOrderingCardDrag } from '@/src/features/games/sintonia/hooks/useOrderingCardDrag';
import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { SintoniaPlayer, SintoniaRevealFeedback } from '@/src/features/games/sintonia/types';
import { ELEVATION_STYLES, getGameAccent, useTheme } from '@/src/theme';
import { AvatarSprite } from '@/src/ui/atoms';

type OrderingCardProps = {
  index: number;
  player: SintoniaPlayer;
  revealFeedback: SintoniaRevealFeedback;
  isDragEnabled: boolean;
  onDrop: (playerId: string, dragX: number, dragY: number) => boolean;
  onDragStateChange?: (dragging: boolean) => void;
  onMeasure?: (layout: { width: number; height: number }) => void;
  columns: number;
  compact: boolean;
  hiddenNumberLabel: string;
};

type CardFaceProps = {
  index: number;
  player: SintoniaPlayer;
  isDragEnabled: boolean;
  isRevealedFace: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
  borderColor: string;
  hiddenNumberLabel: string;
  animatedStyle: ComponentProps<typeof Animated.View>['style'];
};

function OrderingCardFace({
  index,
  player,
  isDragEnabled,
  isRevealedFace,
  isCorrect,
  isIncorrect,
  borderColor,
  hiddenNumberLabel,
  animatedStyle,
}: CardFaceProps) {
  const { theme } = useTheme();
  const accent = getGameAccent('sintonia');
  const { typography, badge, status, border, bg, text } = theme.semantic;

  const badgeBg = isRevealedFace
    ? isCorrect
      ? badge.successBg
      : isIncorrect
        ? badge.errorBg
        : accent.tint
    : accent.tint;
  const badgeText = isRevealedFace
    ? isCorrect
      ? badge.successText
      : isIncorrect
        ? badge.errorText
        : accent.primary
    : accent.primary;

  return (
    <Animated.View
      style={[
        styles.flipFace,
        ELEVATION_STYLES.card,
        isRevealedFace ? styles.flipBackFace : null,
        { backgroundColor: bg.surface, borderColor },
        animatedStyle,
      ]}>
      <View style={styles.cornerBadgeWrap}>
        <View style={[styles.orderBadge, { backgroundColor: badgeBg, borderColor: border.hairline }]}>
          <Text
            style={[
              styles.orderBadgeText,
              { color: badgeText, fontFamily: typography.numberFamily, fontWeight: typography.numberWeight },
            ]}>
            {index + 1}
          </Text>
        </View>
        {isDragEnabled ? (
          <View style={[styles.dragHandleWrap, { borderColor: border.hairline, backgroundColor: bg.subtle }]}>
            <Ionicons name="move-outline" size={13} color={text.secondary} />
          </View>
        ) : null}
      </View>

      <View style={styles.cardMainRow}>
        <View
          style={[
            styles.avatarWrap,
            { borderColor: player.isHost ? status.warning : border.hairline, backgroundColor: bg.subtle },
          ]}>
          <AvatarSprite avatarId={player.avatarId} size={42} />
        </View>
        <View style={styles.cardMeta}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.playerName,
              { color: text.primary, fontFamily: typography.titleFamily, fontWeight: typography.titleWeight },
            ]}>
            {player.name}
          </Text>
          {isRevealedFace ? (
            <Text
              style={[
                styles.revealedNumber,
                {
                  color: isCorrect ? status.success : isIncorrect ? status.error : accent.primary,
                  fontFamily: typography.numberFamily,
                  fontWeight: typography.numberWeight,
                },
              ]}>
              {player.secretNumber}
            </Text>
          ) : (
            <Text
              numberOfLines={1}
              style={[
                styles.playerHint,
                { color: text.secondary, fontFamily: typography.bodyFamily, fontWeight: typography.bodyWeight },
              ]}>
              {hiddenNumberLabel}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export const OrderingCard = memo(
  function OrderingCard({
    index,
    player,
    revealFeedback,
    isDragEnabled,
    onDrop,
    onDragStateChange,
    onMeasure,
    columns,
    compact,
    hiddenNumberLabel,
  }: OrderingCardProps) {
    const { theme } = useTheme();
    const { panHandlers, handleLayout, dragStyle, frontFaceStyle, backFaceStyle } =
      useOrderingCardDrag({
        playerId: player.id,
        revealFeedback,
        isDragEnabled,
        onDrop,
        onDragStateChange,
        onMeasure,
      });

    const isCorrect = revealFeedback === 'correct';
    const isIncorrect = revealFeedback === 'incorrect';
    const borderColor = isCorrect
      ? theme.semantic.status.success
      : isIncorrect
        ? theme.semantic.status.error
        : player.isHost
          ? theme.semantic.status.warning
          : theme.semantic.border.hairline;

    const cardWidth =
      columns === 1 ? '100%' : columns === 2 ? '48.2%' : columns === 3 ? '31.6%' : '23.8%';

    return (
      <Animated.View
        layout={Layout.springify().damping(18).stiffness(170)}
        onLayout={handleLayout}
        style={[styles.orderingCard, { width: cardWidth, minHeight: compact ? 84 : 78 }, dragStyle]}
        {...panHandlers}>
        <View style={styles.flipShell}>
          <OrderingCardFace
            index={index}
            player={player}
            isDragEnabled={isDragEnabled}
            isRevealedFace={false}
            isCorrect={isCorrect}
            isIncorrect={isIncorrect}
            borderColor={borderColor}
            hiddenNumberLabel={hiddenNumberLabel}
            animatedStyle={frontFaceStyle}
          />
          <OrderingCardFace
            index={index}
            player={player}
            isDragEnabled={isDragEnabled}
            isRevealedFace
            isCorrect={isCorrect}
            isIncorrect={isIncorrect}
            borderColor={borderColor}
            hiddenNumberLabel={hiddenNumberLabel}
            animatedStyle={backFaceStyle}
          />
        </View>
      </Animated.View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.index === nextProps.index &&
    prevProps.player.id === nextProps.player.id &&
    prevProps.player.name === nextProps.player.name &&
    prevProps.player.avatarId === nextProps.player.avatarId &&
    prevProps.player.secretNumber === nextProps.player.secretNumber &&
    prevProps.player.isHost === nextProps.player.isHost &&
    prevProps.revealFeedback === nextProps.revealFeedback &&
    prevProps.isDragEnabled === nextProps.isDragEnabled &&
    prevProps.columns === nextProps.columns &&
    prevProps.compact === nextProps.compact &&
    prevProps.hiddenNumberLabel === nextProps.hiddenNumberLabel
);
