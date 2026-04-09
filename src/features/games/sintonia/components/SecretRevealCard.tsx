import { Text, View } from 'react-native';

import { RevealCard } from '@/src/features/games/shared/reveal-card';
import { SintoniaPlayer } from '@/src/features/games/sintonia/types';
import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { Button } from '@/src/ui/atoms';

type SintoniaSecretRevealCardProps = {
  theme: ThemeTokens;
  player: SintoniaPlayer | null;
  isRevealed: boolean;
  isLocalReady: boolean;
  isWaitingOthers: boolean;
  hasMoreLocalPlayers: boolean;
  canAdvance: boolean;
  phaseSubtitle: string;
  holdHintLabel: string;
  chargingLabel: string;
  releaseHintLabel: string;
  waitingLabel: string;
  revealedLabel: string;
  nextLabel: string;
  readyLabel: string;
  lockedActionLabel: string;
  onPressIn: () => void;
  onPressOut: () => void;
  onAdvance: () => void;
};

export function SintoniaSecretRevealCard({
  theme,
  player,
  isRevealed,
  isLocalReady,
  isWaitingOthers,
  hasMoreLocalPlayers,
  canAdvance,
  phaseSubtitle,
  holdHintLabel,
  chargingLabel,
  releaseHintLabel,
  waitingLabel,
  revealedLabel,
  nextLabel,
  readyLabel,
  lockedActionLabel,
  onPressIn,
  onPressOut,
  onAdvance,
}: SintoniaSecretRevealCardProps) {
  const isActionLocked = !isWaitingOthers && !canAdvance;
  const actionLabel = isActionLocked
    ? lockedActionLabel
    : hasMoreLocalPlayers
      ? nextLabel
      : readyLabel;
  const helperLabel = isActionLocked ? null : phaseSubtitle;

  return (
    <View
      style={[
        styles.secretStage,
        {
          backgroundColor: 'transparent',
        },
      ]}>
      <RevealCard
        accessibilityLabel={player ? `Carta secreta de ${player.name}` : waitingLabel}
        content={{
          mode: 'number',
          revealedLabel,
          value: player?.secretNumber ?? '',
        }}
        copy={{
          chargingLabel,
          holdHintLabel,
          releaseHintLabel,
          waitingLabel,
        }}
        theme={theme}
        player={player}
        isRevealed={isRevealed}
        isLocalReady={isLocalReady}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      />

      {isWaitingOthers ? (
        <View
          style={[
            styles.secretWaitingWrap,
            {
              borderColor: withAlpha(theme.semantic.status.warning, 0.44),
              backgroundColor: withAlpha(theme.semantic.status.warning, 0.11),
            },
          ]}>
          <Text
            style={[
              styles.secretWaitingText,
              {
                color: theme.semantic.status.warning,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {waitingLabel}
          </Text>
        </View>
      ) : null}

      {!isWaitingOthers ? (
        <Button
          label={actionLabel}
          onPress={onAdvance}
          disabled={!canAdvance}
          size="lg"
          color={isActionLocked ? withAlpha(theme.semantic.bg.elevated, 0.98) : undefined}
          textColor={isActionLocked ? withAlpha(theme.semantic.text.secondary, 0.78) : undefined}
          style={[styles.secretPrimaryButton, isActionLocked ? styles.secretPrimaryButtonLocked : null]}
        />
      ) : null}

      {!isWaitingOthers && helperLabel ? (
        <Text
          style={[
            styles.secretRevealSubHint,
            {
              color: theme.semantic.text.muted,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {helperLabel}
        </Text>
      ) : null}
    </View>
  );
}
