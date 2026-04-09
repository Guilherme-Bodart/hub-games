import { Text, View } from 'react-native';

import { roundHeaderStyles as styles } from '@/src/features/games/styles/roundHeaderStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite, IconCircleButton } from '@/src/ui/atoms';

type RoundHeaderPlayer = {
  id: string;
  avatarId: number;
};

type RoundHeaderProps = {
  theme: ThemeTokens;
  title: string;
  roundLabel: string;
  players: RoundHeaderPlayer[];
  playersCountLabel: string;
  onPressInfo: () => void;
  infoLabel: string;
};

const MAX_VISIBLE_PLAYER_BUBBLES = 5;

export function RoundHeader({
  theme,
  title,
  roundLabel,
  players,
  playersCountLabel,
  onPressInfo,
  infoLabel,
}: RoundHeaderProps) {
  const visiblePlayers = players.slice(0, MAX_VISIBLE_PLAYER_BUBBLES);
  const hasOverflow = players.length > MAX_VISIBLE_PLAYER_BUBBLES;

  return (
    <View style={styles.phaseHeader}>
      <View style={styles.phaseHeaderLeft}>
        <Text
          style={[
            styles.roundLabel,
            {
              color: withAlpha(theme.semantic.button.primary.bg, 0.92),
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {roundLabel}
        </Text>
        <Text
          style={[
            styles.gameTitle,
            {
              color: theme.semantic.text.primary,
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {title}
        </Text>
      </View>

      <View style={styles.phaseHeaderRight}>
        <IconCircleButton
          icon="information-circle-outline"
          onPress={onPressInfo}
          accessibilityLabel={infoLabel}
          tone="neutral"
          size={44}
          iconSize={18}
          style={styles.infoButton}
        />

        <View style={styles.playerStack}>
          {visiblePlayers.map((player, index) => (
            <View
              key={player.id}
              style={[
                styles.playerBubble,
                {
                  marginLeft: index === 0 ? 0 : -6,
                  borderColor: withAlpha(theme.semantic.bg.app, 0.95),
                  backgroundColor: withAlpha(theme.semantic.bg.surface, 0.96),
                },
              ]}>
              <AvatarSprite avatarId={player.avatarId} size={16} />
            </View>
          ))}

          {hasOverflow ? (
            <View
              style={[
                styles.playerBubble,
                {
                  borderColor: withAlpha(theme.semantic.bg.app, 0.95),
                  backgroundColor: withAlpha(theme.semantic.bg.elevated, 0.96),
                },
              ]}>
              <Text
                style={[
                  styles.plusBubbleLabel,
                  {
                    color: theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.numberFamily,
                    fontWeight: theme.semantic.typography.numberWeight,
                  },
                ]}>
                +
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          style={[
            styles.playersCountLabel,
            {
              color: withAlpha(theme.semantic.text.secondary, 0.76),
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {playersCountLabel}
        </Text>
      </View>
    </View>
  );
}
