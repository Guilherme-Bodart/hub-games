import { Text, View } from 'react-native';

import { SintoniaPlayer } from '@/src/features/games/sintonia/types';
import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite } from '@/src/ui/atoms';

type OrderingCardContentProps = {
  index: number;
  player: SintoniaPlayer;
  secondaryLabel: string;
  secondaryColor: string;
  isRevealedValue: boolean;
  theme: ThemeTokens;
};

export function OrderingCardContent({
  index,
  player,
  secondaryLabel,
  secondaryColor,
  isRevealedValue,
  theme,
}: OrderingCardContentProps) {
  return (
    <>
      <View style={styles.cornerBadgeWrap}>
        <View
          style={[
            styles.orderBadge,
            {
              borderColor: withAlpha(theme.semantic.button.primary.bg, 0.95),
              backgroundColor: withAlpha(theme.semantic.button.primary.bg, 0.22),
            },
          ]}>
          <Text
            style={[
              styles.orderBadgeText,
              {
                color: theme.semantic.button.primary.bg,
                fontFamily: theme.semantic.typography.numberFamily,
                fontWeight: theme.semantic.typography.numberWeight,
              },
            ]}>
            {index + 1}
          </Text>
        </View>
      </View>
      <View style={styles.cardMainRow}>
        <View
          style={[
            styles.avatarWrap,
            {
              borderColor: theme.semantic.border.subtle,
              backgroundColor: theme.semantic.bg.elevated,
            },
          ]}>
          <AvatarSprite avatarId={player.avatarId} size={44} />
        </View>
        <View style={styles.cardMeta}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
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
          <Text
            style={[
              isRevealedValue ? styles.revealedNumber : styles.playerHint,
              {
                color: secondaryColor,
                fontFamily: isRevealedValue
                  ? theme.semantic.typography.numberFamily
                  : theme.semantic.typography.bodyFamily,
                fontWeight: isRevealedValue
                  ? theme.semantic.typography.numberWeight
                  : theme.semantic.typography.bodyWeight,
              },
            ]}>
            {secondaryLabel}
          </Text>
        </View>
      </View>
    </>
  );
}
