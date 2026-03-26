import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { SintoniaPlayer } from '@/src/features/games/sintonia/types';
import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite, Button } from '@/src/ui/atoms';

type SintoniaSecretRevealCardProps = {
  theme: ThemeTokens;
  player: SintoniaPlayer | null;
  isRevealed: boolean;
  isViewed: boolean;
  isLocalReady: boolean;
  isWaitingOthers: boolean;
  hasMoreLocalPlayers: boolean;
  canAdvance: boolean;
  holdHintLabel: string;
  releaseHintLabel: string;
  waitingLabel: string;
  readyProgressLabel: string;
  nextLabel: string;
  readyLabel: string;
  onPressIn: () => void;
  onPressOut: () => void;
  onAdvance: () => void;
};

export function SintoniaSecretRevealCard({
  theme,
  player,
  isRevealed,
  isViewed,
  isLocalReady,
  isWaitingOthers,
  hasMoreLocalPlayers,
  canAdvance,
  holdHintLabel,
  releaseHintLabel,
  waitingLabel,
  readyProgressLabel,
  nextLabel,
  readyLabel,
  onPressIn,
  onPressOut,
  onAdvance,
}: SintoniaSecretRevealCardProps) {
  const actionLabel = hasMoreLocalPlayers ? nextLabel : readyLabel;
  return (
    <View
      style={[
        styles.secretCardStage,
        {
          borderColor: withAlpha(theme.semantic.border.subtle, 0.75),
          backgroundColor: withAlpha(theme.semantic.bg.surface, 0.5),
        },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !player || isLocalReady }}
        accessibilityLabel={player ? `Carta secreta de ${player.name}` : waitingLabel}
        disabled={!player || isLocalReady}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.secretRevealCard,
          {
            borderColor: withAlpha(theme.semantic.button.primary.bg, 0.88),
            backgroundColor: withAlpha(theme.semantic.bg.surface, 0.88),
            shadowColor: theme.semantic.button.primary.bg,
          },
        ]}>
        <View
          pointerEvents="none"
          style={[
            styles.secretRevealFrame,
            { borderColor: withAlpha(theme.semantic.text.primary, 0.13) },
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.secretRevealFrameInner,
            { borderColor: withAlpha(theme.semantic.text.primary, 0.08) },
          ]}
        />

        {player ? (
          <>
            {player.isHost ? (
              <View style={styles.secretRevealHostBadge}>
                <SymbolView
                  name={{ ios: 'crown.fill', android: 'crown', web: 'crown' }}
                  size={13}
                  tintColor="#D7A63D"
                />
              </View>
            ) : null}

            <AvatarSprite avatarId={player.avatarId} size={84} />
            <Text
              numberOfLines={1}
              style={[
                styles.secretRevealPlayerName,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {player.name}
            </Text>

            <Text
              style={[
                styles.secretRevealHint,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {isRevealed ? releaseHintLabel : holdHintLabel}
            </Text>

            <View
              style={[
                styles.secretRevealNumberWrap,
                {
                  borderColor: withAlpha(theme.semantic.border.subtle, 0.95),
                  backgroundColor: withAlpha(theme.semantic.bg.elevated, 0.86),
                },
              ]}>
              <Text
                style={[
                  styles.secretRevealNumber,
                  {
                    color: isRevealed ? theme.semantic.button.primary.bg : theme.semantic.text.muted,
                    fontFamily: theme.semantic.typography.numberFamily,
                    fontWeight: theme.semantic.typography.numberWeight,
                  },
                ]}>
                {isRevealed ? player.secretNumber : '??'}
              </Text>
            </View>
          </>
        ) : (
          <Text
            style={[
              styles.secretRevealHint,
              {
                color: theme.semantic.text.secondary,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {waitingLabel}
          </Text>
        )}
      </Pressable>

      <View
        style={[
          styles.secretRevealStatus,
          {
            borderColor: withAlpha(theme.semantic.border.subtle, 0.9),
            backgroundColor: withAlpha(theme.semantic.bg.surface, 0.72),
          },
        ]}>
        <Text
          style={[
            styles.secretRevealStatusText,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
            {readyProgressLabel}
          </Text>
      </View>

      {isWaitingOthers ? (
        <Text
          style={[
            styles.secretRevealWaitingLabel,
            {
              color: theme.semantic.status.warning,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {waitingLabel}
        </Text>
      ) : null}

      <Button
        label={actionLabel}
        onPress={onAdvance}
        disabled={!canAdvance || isWaitingOthers}
        size="lg"
        style={styles.secretRevealActionButton}
      />

      {!isViewed && !isLocalReady ? (
        <Text
          style={[
            styles.secretRevealSubHint,
            {
              color: theme.semantic.text.muted,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {holdHintLabel}
        </Text>
      ) : null}
    </View>
  );
}
