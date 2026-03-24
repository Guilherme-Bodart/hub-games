import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { v2Tokens } from '@/src/v2/design-system';

type BentoCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  tone?: 'default' | 'accent';
}>;

export function BentoCard({ children, style, tone = 'default' }: BentoCardProps) {
  return (
    <View
      style={[
        styles.base,
        tone === 'accent' ? styles.accent : null,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: v2Tokens.radius.lg,
    borderWidth: 1,
    borderColor: v2Tokens.colors.border,
    backgroundColor: v2Tokens.colors.surface,
    padding: v2Tokens.spacing.md,
    shadowColor: v2Tokens.shadows.bento.shadowColor,
    shadowOpacity: v2Tokens.shadows.bento.shadowOpacity,
    shadowRadius: v2Tokens.shadows.bento.shadowRadius,
    shadowOffset: v2Tokens.shadows.bento.shadowOffset,
    elevation: v2Tokens.shadows.bento.elevation,
  },
  accent: {
    borderColor: v2Tokens.colors.borderStrong,
    backgroundColor: v2Tokens.colors.surfaceStrong,
  },
});
