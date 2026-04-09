import { memo, useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { PlayerClueCardTone } from '@/src/features/games/impostor/hooks/useImpostorCluesPhaseViewModel';
import { cluesPhaseStyles as styles } from '@/src/features/games/impostor/styles/cluesPhaseStyles';
import { ImpostorRound } from '@/src/features/games/impostor/types';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite } from '@/src/ui/atoms';

type PlayerClueCardProps = {
  player: ImpostorRound['players'][number];
  clue?: string;
  previousClues: string[];
  playerLabel?: string;
  statusLabel: string;
  emphasisLabel: string;
  historyLabel: string;
  tone: PlayerClueCardTone;
  theme: ThemeTokens;
};

const resolveTone = (tone: PlayerClueCardTone, theme: ThemeTokens) => {
  if (tone === 'submitted') {
    return {
      borderColor: withAlpha(theme.semantic.status.success, 0.24),
      cardBg: withAlpha('#FFFFFF', 0.94),
      shadowColor: withAlpha(theme.semantic.status.success, 0.24),
      avatarBg: withAlpha(theme.semantic.status.success, 0.1),
      avatarBorder: withAlpha(theme.semantic.status.success, 0.16),
      statusBg: withAlpha(theme.semantic.status.success, 0.12),
      statusBorder: withAlpha(theme.semantic.status.success, 0.18),
      statusText: '#1F8E70',
      emphasisText: theme.semantic.button.primary.bg,
      historyBg: withAlpha(theme.semantic.status.success, 0.05),
      historyBorder: withAlpha(theme.semantic.status.success, 0.08),
      historyChipBg: withAlpha(theme.semantic.status.success, 0.08),
      historyChipBorder: withAlpha(theme.semantic.status.success, 0.1),
    };
  }

  if (tone === 'typing') {
    return {
      borderColor: withAlpha(theme.semantic.button.primary.bg, 0.24),
      cardBg: withAlpha('#FFFFFF', 0.94),
      shadowColor: withAlpha(theme.semantic.button.primary.bg, 0.22),
      avatarBg: withAlpha(theme.semantic.button.primary.bg, 0.12),
      avatarBorder: withAlpha(theme.semantic.button.primary.bg, 0.16),
      statusBg: withAlpha(theme.semantic.button.primary.bg, 0.12),
      statusBorder: withAlpha(theme.semantic.button.primary.bg, 0.18),
      statusText: theme.semantic.button.primary.bg,
      emphasisText: theme.semantic.text.primary,
      historyBg: withAlpha(theme.semantic.text.muted, 0.08),
      historyBorder: withAlpha(theme.semantic.text.muted, 0.1),
      historyChipBg: withAlpha(theme.semantic.text.muted, 0.08),
      historyChipBorder: withAlpha(theme.semantic.text.muted, 0.1),
    };
  }

  return {
    borderColor: withAlpha(theme.semantic.border.subtle, 0.95),
    cardBg: withAlpha('#FFFFFF', 0.92),
    shadowColor: withAlpha(theme.semantic.shadow.base, 0.12),
    avatarBg: withAlpha(theme.semantic.text.muted, 0.1),
    avatarBorder: withAlpha(theme.semantic.border.subtle, 0.9),
    statusBg: withAlpha(theme.semantic.text.muted, 0.1),
    statusBorder: withAlpha(theme.semantic.border.subtle, 0.95),
    statusText: theme.semantic.text.secondary,
    emphasisText: theme.semantic.text.secondary,
    historyBg: withAlpha(theme.semantic.text.muted, 0.07),
    historyBorder: withAlpha(theme.semantic.text.muted, 0.1),
    historyChipBg: withAlpha(theme.semantic.bg.surface, 0.85),
    historyChipBorder: withAlpha(theme.semantic.border.subtle, 0.95),
  };
};

export const PlayerClueCard = memo(function PlayerClueCard({
  player,
  clue,
  previousClues,
  playerLabel,
  statusLabel,
  emphasisLabel,
  historyLabel,
  tone,
  theme,
}: PlayerClueCardProps) {
  const hasClue = Boolean(clue);
  const flipProgress = useSharedValue(1);
  const emphasisPulse = useSharedValue(1);
  const wasClueVisibleRef = useRef(hasClue);
  const palette = resolveTone(tone, theme);

  useEffect(() => {
    if (hasClue && !wasClueVisibleRef.current) {
      flipProgress.value = 0;
      flipProgress.value = withTiming(1, { duration: 420 });
    }

    wasClueVisibleRef.current = hasClue;
  }, [flipProgress, hasClue]);

  useEffect(() => {
    if (tone === 'typing' && !hasClue) {
      emphasisPulse.value = 1;
      emphasisPulse.value = withRepeat(withTiming(0.58, { duration: 540 }), -1, true);
      return;
    }

    emphasisPulse.value = withTiming(1, { duration: 180 });
  }, [emphasisPulse, hasClue, tone]);

  const flipStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 840 }, { rotateY: `${(1 - flipProgress.value) * 90}deg` }],
    opacity: 0.54 + flipProgress.value * 0.46,
  }));

  const emphasisStyle = useAnimatedStyle(() => ({
    opacity: tone === 'typing' && !hasClue ? emphasisPulse.value : 1,
    transform: [{ scale: tone === 'typing' && !hasClue ? 0.98 + emphasisPulse.value * 0.02 : 1 }],
  }));

  return (
    <Animated.View
      style={[
        styles.playerCard,
        flipStyle,
        {
          borderColor: palette.borderColor,
          backgroundColor: palette.cardBg,
          shadowColor: palette.shadowColor,
        },
      ]}>
      <View style={styles.playerTopRow}>
        <View
          style={[
            styles.avatarWrap,
            {
              backgroundColor: palette.avatarBg,
              borderColor: palette.avatarBorder,
            },
          ]}>
          <AvatarSprite avatarId={player.avatarId} size={26} />
        </View>

        <View style={styles.playerMeta}>
          {playerLabel ? (
            <Text style={[styles.playerMetaLabel, { color: theme.semantic.text.muted }]}>{playerLabel}</Text>
          ) : null}
          <Text
            numberOfLines={1}
            style={[
              styles.playerName,
              {
                color: theme.semantic.text.secondary,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {player.name}
          </Text>
        </View>

        <Text
          style={[
            styles.playerStatusInline,
            {
              color: palette.statusText,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {statusLabel}
        </Text>
      </View>

      {emphasisLabel ? (
        <Animated.Text
          style={[
            styles.emphasisLabel,
            emphasisStyle,
            {
              color: palette.emphasisText,
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {emphasisLabel}
        </Animated.Text>
      ) : null}

      {previousClues.length ? (
        <View
          style={[
            styles.historyBlock,
            {
              backgroundColor: palette.historyBg,
              borderColor: palette.historyBorder,
            },
          ]}>
          <Text
            style={[
              styles.historyLabel,
              {
                color: theme.semantic.text.muted,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {historyLabel}
          </Text>
          <View style={styles.historyList}>
            {previousClues.map((oldClue, index) => (
              <View
                key={`${player.id}-history-${index}`}
                style={[
                  styles.historyChip,
                  {
                    backgroundColor: palette.historyChipBg,
                    borderColor: palette.historyChipBorder,
                  },
                ]}>
                <Text
                  style={[
                    styles.historyChipText,
                    {
                      color: theme.semantic.text.secondary,
                      fontFamily: theme.semantic.typography.bodyFamily,
                      fontWeight: theme.semantic.typography.bodyWeight,
                    },
                  ]}>
                  {oldClue}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.player.id === nextProps.player.id &&
    prevProps.player.name === nextProps.player.name &&
    prevProps.player.avatarId === nextProps.player.avatarId &&
    prevProps.clue === nextProps.clue &&
    prevProps.playerLabel === nextProps.playerLabel &&
    prevProps.statusLabel === nextProps.statusLabel &&
    prevProps.emphasisLabel === nextProps.emphasisLabel &&
    prevProps.historyLabel === nextProps.historyLabel &&
    prevProps.tone === nextProps.tone &&
    prevProps.previousClues.length === nextProps.previousClues.length &&
    prevProps.previousClues.every((value, index) => value === nextProps.previousClues[index]) &&
    prevProps.theme === nextProps.theme
  );
});
