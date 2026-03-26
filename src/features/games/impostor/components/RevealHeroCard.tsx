import { Text, View } from 'react-native';

import { ImpostorRound } from '@/src/features/games/impostor/types';
import { styles } from '@/src/features/games/impostor/styles/impostorStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite } from '@/src/ui/atoms';

type RevealHeroCardProps = {
  revealedPlayer: ImpostorRound['players'][number];
  revealedPrompt: string;
  revealedIsImpostor: boolean;
  copy: Record<string, string>;
  theme: ThemeTokens;
};

export function ImpostorRevealHeroCard({
  revealedPlayer,
  revealedPrompt,
  revealedIsImpostor,
  copy,
  theme,
}: RevealHeroCardProps) {
  return (
    <View
      style={[
        styles.revealHeroCard,
        {
          borderColor: withAlpha(theme.semantic.button.primary.bg, 0.86),
          backgroundColor: withAlpha(theme.semantic.bg.surface, 0.92),
          shadowColor: theme.semantic.button.primary.bg,
        },
      ]}>
      <View style={[styles.revealHeroFrame, { borderColor: withAlpha(theme.semantic.text.primary, 0.14) }]} />
      <View
        style={[styles.revealHeroFrameInner, { borderColor: withAlpha(theme.semantic.text.primary, 0.1) }]}
      />
      <AvatarSprite avatarId={revealedPlayer.avatarId} size={80} />
      <Text
        numberOfLines={1}
        style={[
          styles.revealHeroName,
          {
            color: theme.semantic.text.primary,
            fontFamily: theme.semantic.typography.titleFamily,
            fontWeight: theme.semantic.typography.titleWeight,
          },
        ]}>
        {revealedPlayer.name}
      </Text>
      <Text
        style={[
          styles.revealHeroSecret,
          {
            color: revealedIsImpostor ? theme.semantic.status.error : theme.semantic.button.primary.bg,
          },
        ]}>
        {revealedPrompt}
      </Text>
      <Text style={[styles.revealHeroHint, { color: theme.semantic.text.secondary }]}>{copy.releaseRevealHint}</Text>
    </View>
  );
}
