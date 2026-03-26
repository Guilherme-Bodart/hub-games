import { memo, useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ImpostorRound } from '@/src/features/games/impostor/types';
import { styles } from '@/src/features/games/impostor/styles/impostorStyles';
import { ThemeTokens } from '@/src/theme/types';
import { AvatarSprite } from '@/src/ui/atoms';

type ClueSlotCardProps = {
  player: ImpostorRound['players'][number];
  clue?: string;
  isActive: boolean;
  previousClues: string[];
  typingLabel: string;
  waitingLabel: string;
  theme: ThemeTokens;
};

export const ClueSlotCard = memo(function ClueSlotCard({
  player,
  clue,
  isActive,
  previousClues,
  typingLabel,
  waitingLabel,
  theme,
}: ClueSlotCardProps) {
  const hasClue = Boolean(clue);
  const flipProgress = useSharedValue(1);
  const typingPulse = useSharedValue(1);
  const wasClueVisibleRef = useRef(hasClue);

  useEffect(() => {
    if (hasClue && !wasClueVisibleRef.current) {
      flipProgress.value = 0;
      flipProgress.value = withTiming(1, { duration: 460 });
    }

    wasClueVisibleRef.current = hasClue;
  }, [flipProgress, hasClue]);

  useEffect(() => {
    if (isActive && !hasClue) {
      typingPulse.value = 1;
      typingPulse.value = withRepeat(withTiming(0.5, { duration: 480 }), -1, true);
      return;
    }

    typingPulse.value = withTiming(1, { duration: 160 });
  }, [hasClue, isActive, typingPulse]);

  const flipStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 820 }, { rotateY: `${(1 - flipProgress.value) * 90}deg` }],
    opacity: 0.45 + flipProgress.value * 0.55,
  }));

  const typingStyle = useAnimatedStyle(() => ({
    opacity: hasClue ? 1 : isActive ? typingPulse.value : 0.82,
  }));

  return (
    <Animated.View
      style={[
        styles.clueSlot,
        flipStyle,
        {
          borderColor: isActive
            ? theme.semantic.button.primary.bg
            : hasClue
              ? theme.semantic.status.success
              : theme.semantic.border.subtle,
          backgroundColor: theme.semantic.bg.surface,
        },
      ]}>
      <View style={styles.clueSlotHeader}>
        <AvatarSprite avatarId={player.avatarId} size={24} />
        <Text numberOfLines={1} style={[styles.clueSlotName, { color: theme.semantic.text.primary }]}>
          {player.name}
        </Text>
      </View>
      <View style={styles.clueSlotContentRow}>
        <View style={styles.clueSlotMainClueCol}>
          <Animated.Text
            style={[
              styles.clueSlotValue,
              typingStyle,
              {
                color: hasClue ? theme.semantic.button.primary.bg : theme.semantic.text.muted,
              },
            ]}>
            {hasClue ? clue : isActive ? typingLabel : waitingLabel}
          </Animated.Text>
        </View>
        <View style={[styles.clueSlotDivider, { backgroundColor: theme.semantic.border.subtle }]} />
        <View style={styles.clueHistoryCol}>
          {previousClues.length ? (
            <View style={styles.clueHistoryList}>
              {previousClues.map((oldClue, index) => (
                <Text
                  key={`${player.id}-old-clue-${index}`}
                  style={[styles.clueHistoryText, { color: theme.semantic.text.secondary }]}>
                  {oldClue}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={[styles.clueHistoryText, { color: theme.semantic.text.muted }]}>-</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.player.id === nextProps.player.id &&
    prevProps.player.name === nextProps.player.name &&
    prevProps.player.avatarId === nextProps.player.avatarId &&
    prevProps.clue === nextProps.clue &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.typingLabel === nextProps.typingLabel &&
    prevProps.waitingLabel === nextProps.waitingLabel &&
    prevProps.previousClues.length === nextProps.previousClues.length &&
    prevProps.previousClues.every((value, index) => value === nextProps.previousClues[index]) &&
    prevProps.theme === nextProps.theme
  );
});
