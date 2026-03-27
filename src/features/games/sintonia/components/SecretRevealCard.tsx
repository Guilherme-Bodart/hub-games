import { Text, View } from 'react-native';

import { SecretRevealInteractiveCard } from '@/src/features/games/sintonia/components/SecretRevealInteractiveCard';
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
  readyProgressLabel: string;
  revealedLabel: string;
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
  isLocalReady,
  isWaitingOthers,
  hasMoreLocalPlayers,
  canAdvance,
  phaseSubtitle,
  holdHintLabel,
  chargingLabel,
  releaseHintLabel,
  waitingLabel,
  readyProgressLabel,
  revealedLabel,
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
        styles.secretStage,
        {
          backgroundColor: 'transparent',
        },
      ]}>
      <View style={styles.secretStageHeader}>
        <View
          style={[
            styles.secretStageProgressBadge,
            {
              borderColor: withAlpha(theme.semantic.border.subtle, 0.76),
              backgroundColor: withAlpha(theme.semantic.bg.surface, 0.9),
            },
          ]}>
          <Text
            style={[
              styles.secretStageProgressText,
              {
                color: theme.semantic.text.secondary,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {readyProgressLabel}
          </Text>
        </View>
      </View>

      <SecretRevealInteractiveCard
        theme={theme}
        player={player}
        isRevealed={isRevealed}
        isLocalReady={isLocalReady}
        waitingLabel={waitingLabel}
        holdHintLabel={holdHintLabel}
        chargingLabel={chargingLabel}
        releaseHintLabel={releaseHintLabel}
        revealedLabel={revealedLabel}
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
          style={styles.secretPrimaryButton}
        />
      ) : null}

      {!isWaitingOthers ? (
        <Text
          style={[
            styles.secretRevealSubHint,
            {
              color: theme.semantic.text.muted,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {phaseSubtitle}
        </Text>
      ) : null}
    </View>
  );
}
