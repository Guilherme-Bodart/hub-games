import { Text, View } from 'react-native';

import { RevealCard } from '@/src/features/games/shared/reveal-card';
import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { SintoniaPlayer } from '@/src/features/games/sintonia/types';
import { getGameAccent } from '@/src/theme';
import { ThemeTokens } from '@/src/theme/types';
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
  const accent = getGameAccent('sintonia');
  const isActionLocked = !isWaitingOthers && !canAdvance;
  const actionLabel = isActionLocked
    ? lockedActionLabel
    : hasMoreLocalPlayers
      ? nextLabel
      : readyLabel;
  const helperLabel = isActionLocked ? null : phaseSubtitle;

  return (
    <View style={styles.secretStage}>
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
              borderColor: theme.semantic.border.hairline,
              backgroundColor: theme.semantic.badge.warningBg,
            },
          ]}>
          <Text
            style={[
              styles.secretWaitingText,
              {
                color: theme.semantic.badge.warningText,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {waitingLabel}
          </Text>
        </View>
      ) : (
        <Button
          label={actionLabel}
          onPress={onAdvance}
          disabled={!canAdvance}
          variant={isActionLocked ? 'secondary' : 'primary'}
          size="lg"
          color={isActionLocked ? undefined : accent.primary}
          plinthColor={isActionLocked ? undefined : accent.plinth}
          textColor={isActionLocked ? undefined : accent.textOnPrimary}
          style={styles.secretPrimaryButton}
        />
      )}

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
