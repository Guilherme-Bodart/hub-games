import { Pressable, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { SintoniaPlayer } from '@/src/features/games/sintonia/types';
import { secretPhaseStyles as styles } from '@/src/features/games/sintonia/styles/secretPhaseStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite } from '@/src/ui/atoms';

type SecretPhaseHeaderProps = {
  theme: ThemeTokens;
  title: string;
  roundLabel: string;
  players: SintoniaPlayer[];
  playersCountLabel: string;
  onPressInfo: () => void;
  infoLabel: string;
};

const MAX_VISIBLE_PLAYER_BUBBLES = 5;

export function SecretPhaseHeader({
  theme,
  title,
  roundLabel,
  players,
  playersCountLabel,
  onPressInfo,
  infoLabel,
}: SecretPhaseHeaderProps) {
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={infoLabel}
          onPress={onPressInfo}
          style={[
            styles.infoButton,
            {
              borderColor: withAlpha(theme.semantic.border.subtle, 0.96),
              backgroundColor: withAlpha(theme.semantic.bg.surface, 0.96),
            },
          ]}>
          <SymbolView
            name={{ ios: 'info.circle', android: 'info', web: 'info' }}
            size={16}
            tintColor={withAlpha(theme.semantic.text.secondary, 0.92)}
          />
        </Pressable>

        <View style={styles.playerStack}>
          {visiblePlayers.map((player, index) => (
            <View
              key={player.id}
              style={[
                styles.playerBubble,
                {
                  marginLeft: index === 0 ? 0 : -8,
                  borderColor: withAlpha(theme.semantic.bg.app, 0.95),
                  backgroundColor: withAlpha(theme.semantic.bg.surface, 0.96),
                },
              ]}>
              <AvatarSprite avatarId={player.avatarId} size={20} />
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
