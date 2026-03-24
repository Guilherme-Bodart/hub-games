import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { v2Tokens } from '@/src/v2/design-system';

type GlassPanelProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function GlassPanel({ children, style }: GlassPanelProps) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: v2Tokens.radius.xl,
    borderWidth: 1,
    borderColor: v2Tokens.colors.glassBorder,
    backgroundColor: v2Tokens.colors.glassBg,
    padding: v2Tokens.spacing.md,
    shadowColor: v2Tokens.shadows.glass.shadowColor,
    shadowOpacity: v2Tokens.shadows.glass.shadowOpacity,
    shadowRadius: v2Tokens.shadows.glass.shadowRadius,
    shadowOffset: v2Tokens.shadows.glass.shadowOffset,
    elevation: v2Tokens.shadows.glass.elevation,
    overflow: 'hidden',
  },
});
