import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import {
  RevealCardContent,
  RevealCardVisualTokens,
} from '@/src/features/games/shared/reveal-card/types/revealCard.types';
import { revealCardStyles as styles } from '@/src/features/games/shared/reveal-card/styles/revealCardStyles';
import { ThemeTokens } from '@/src/theme/types';

type RevealCardBackContentProps = {
  content: RevealCardContent;
  theme: ThemeTokens;
  visuals: RevealCardVisualTokens;
};

export function RevealCardBackContent({
  content,
  theme,
  visuals,
}: RevealCardBackContentProps) {
  const value = String(content.value);

  if (content.mode === 'impostor') {
    return (
      <View
        style={[
          styles.revealSurface,
          styles.impostorSurface,
          {
            backgroundColor: visuals.revealSurfaceBackgroundColor,
            borderColor: visuals.revealSurfaceBorderColor,
          },
        ]}>
        <LinearGradient
          colors={visuals.paperEffect.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.paperGradient}
        />
        <View
          pointerEvents="none"
          style={[styles.paperToneFrame, { borderColor: visuals.paperEffect.frameBorderColor }]}
        />
        <View
          pointerEvents="none"
          style={[styles.paperToneFrameInner, { borderColor: visuals.paperEffect.innerBorderColor }]}
        />
        <View
          pointerEvents="none"
          style={[styles.paperTextureLineTop, { backgroundColor: visuals.paperEffect.textureColor }]}
        />
        <View
          pointerEvents="none"
          style={[styles.paperTextureLineBottom, { backgroundColor: visuals.paperEffect.textureColor }]}
        />
        <View
          pointerEvents="none"
          style={[styles.paperAccentLine, { backgroundColor: visuals.paperEffect.accentLineColor }]}
        />
        <Text
          style={[
            styles.impostorWordmark,
            {
              color: visuals.revealTextColor,
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          IMPOSTOR
        </Text>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          numberOfLines={2}
          style={[
            styles.impostorHintValue,
            {
              color: visuals.revealTextColor,
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {value}
        </Text>
      </View>
    );
  }

  if (content.mode === 'secret') {
    return (
      <View
        style={[
          styles.revealSurface,
          styles.secretSurface,
          {
            backgroundColor: visuals.revealSurfaceBackgroundColor,
            borderColor: visuals.revealSurfaceBorderColor,
          },
        ]}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          numberOfLines={2}
          style={[
            styles.secretText,
            {
              color: visuals.revealTextColor,
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {value}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.revealSurface,
        {
          backgroundColor: visuals.revealSurfaceBackgroundColor,
          borderColor: visuals.revealSurfaceBorderColor,
        },
      ]}>
      <Text
        style={[
          styles.numberText,
          {
            color: visuals.revealTextColor,
            fontFamily: theme.semantic.typography.numberFamily,
            fontWeight: theme.semantic.typography.numberWeight,
          },
        ]}>
        {value}
      </Text>
    </View>
  );
}
