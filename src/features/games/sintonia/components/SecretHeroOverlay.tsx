import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { SintoniaPlayer } from '@/src/features/games/sintonia/types';
import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite } from '@/src/ui/atoms';

type SintoniaSecretHeroOverlayProps = {
  activeSecretPlayer: SintoniaPlayer;
  releaseHintLabel: string;
  theme: ThemeTokens;
};

export function SintoniaSecretHeroOverlay({
  activeSecretPlayer,
  releaseHintLabel,
  theme,
}: SintoniaSecretHeroOverlayProps) {
  return (
    <Animated.View
      style={[
        styles.secretHeroOverlay,
        {
          borderColor: withAlpha(theme.semantic.button.primary.bg, 0.82),
          backgroundColor: withAlpha(theme.semantic.bg.surface, 0.9),
          shadowColor: theme.semantic.button.primary.bg,
        },
      ]}>
      <View
        style={[
          styles.secretHeroFrame,
          { borderColor: withAlpha(theme.semantic.text.primary, 0.14) },
        ]}
      />
      <View
        style={[
          styles.secretHeroFrameInner,
          { borderColor: withAlpha(theme.semantic.text.primary, 0.1) },
        ]}
      />
      <AvatarSprite avatarId={activeSecretPlayer.avatarId} size={78} />
      <Text
        numberOfLines={1}
        style={[
          styles.secretHeroName,
          {
            color: theme.semantic.text.primary,
            fontFamily: theme.semantic.typography.titleFamily,
            fontWeight: theme.semantic.typography.titleWeight,
          },
        ]}>
        {activeSecretPlayer.name}
      </Text>
      <Text
        style={[
          styles.secretHeroNumber,
          {
            color: theme.semantic.button.primary.bg,
            fontFamily: theme.semantic.typography.numberFamily,
            fontWeight: theme.semantic.typography.numberWeight,
          },
        ]}>
        {activeSecretPlayer.secretNumber}
      </Text>
      <Text
        style={[
          styles.secretHeroHint,
          {
            color: theme.semantic.text.secondary,
            fontFamily: theme.semantic.typography.bodyFamily,
            fontWeight: theme.semantic.typography.bodyWeight,
          },
        ]}>
        {releaseHintLabel}
      </Text>
    </Animated.View>
  );
}
