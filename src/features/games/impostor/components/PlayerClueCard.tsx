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
import { ELEVATION_STYLES, GameAccentPalette, getGameAccent } from '@/src/theme';
import { ThemeTokens } from '@/src/theme/types';
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

const resolveTone = (tone: PlayerClueCardTone, theme: ThemeTokens, accent: GameAccentPalette) => {
  if (tone === 'submitted') {
    return {
      borderColor: theme.semantic.status.success,
      avatarBg: theme.semantic.badge.successBg,
      avatarBorder: theme.semantic.status.success,
      statusBg: theme.semantic.badge.successBg,
      statusBorder: theme.semantic.status.success,
      statusText: theme.semantic.badge.successText,
      emphasisText: theme.semantic.text.primary,
    };
  }

  if (tone === 'typing') {
    return {
      borderColor: accent.primary,
      avatarBg: accent.tint,
      avatarBorder: accent.primary,
      statusBg: accent.tint,
      statusBorder: accent.primary,
      statusText: accent.plinth,
      emphasisText: accent.primary,
    };
  }

  return {
    borderColor: theme.semantic.border.hairline,
    avatarBg: theme.semantic.bg.subtle,
    avatarBorder: theme.semantic.border.hairline,
    statusBg: theme.semantic.bg.subtle,
    statusBorder: theme.semantic.border.hairline,
    statusText: theme.semantic.text.muted,
    emphasisText: theme.semantic.text.secondary,
  };
};

export const PlayerClueCard = memo(
  function PlayerClueCard({
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
    const accent = getGameAccent('impostor-neon');
    const hasClue = Boolean(clue);
    const flipProgress = useSharedValue(1);
    const emphasisPulse = useSharedValue(1);
    const wasClueVisibleRef = useRef(hasClue);
    const palette = resolveTone(tone, theme, accent);

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
        emphasisPulse.value = withRepeat(withTiming(0.62, { duration: 540 }), -1, true);
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
          ELEVATION_STYLES.card,
          flipStyle,
          {
            borderColor: palette.borderColor,
            backgroundColor: theme.semantic.bg.surface,
          },
        ]}>
        <View style={styles.playerTopRow}>
          <View
            style={[
              styles.avatarWrap,
              { backgroundColor: palette.avatarBg, borderColor: palette.avatarBorder },
            ]}>
            <AvatarSprite avatarId={player.avatarId} size={26} />
          </View>

          <View style={styles.playerMeta}>
            {playerLabel ? (
              <Text style={[styles.playerMetaLabel, { color: theme.semantic.text.muted }]}>
                {playerLabel}
              </Text>
            ) : null}
            <Text
              numberOfLines={1}
              style={[
                styles.playerName,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {player.name}
            </Text>
          </View>

          <View
            style={[
              styles.statusPill,
              { backgroundColor: palette.statusBg, borderColor: palette.statusBorder },
            ]}>
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
                backgroundColor: theme.semantic.bg.subtle,
                borderColor: theme.semantic.border.hairline,
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
                      backgroundColor: theme.semantic.bg.surface,
                      borderColor: theme.semantic.border.hairline,
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
  },
  (prevProps, nextProps) =>
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
