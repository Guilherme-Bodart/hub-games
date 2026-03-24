import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { v2Tokens } from '@/src/v2/design-system';

type FloatingDockProps = PropsWithChildren<{
  helperText?: string;
}>;

export function FloatingDock({ helperText, children }: FloatingDockProps) {
  return (
    <View style={styles.wrap}>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: v2Tokens.spacing.md,
    paddingTop: v2Tokens.spacing.sm,
    paddingBottom: v2Tokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: v2Tokens.colors.border,
    backgroundColor: 'rgba(14, 11, 26, 0.95)',
    gap: v2Tokens.spacing.xs,
  },
  helper: {
    color: v2Tokens.colors.textSecondary,
    fontSize: v2Tokens.typography.caption,
    textAlign: 'center',
  },
});
