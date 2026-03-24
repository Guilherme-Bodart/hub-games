import { StyleSheet, Text, View } from 'react-native';

import { v2Tokens } from '@/src/v2/design-system';

type HybridBadgeProps = {
  label: string;
  tone?: 'neutral' | 'success' | 'info' | 'warning' | 'danger';
};

export function HybridBadge({ label, tone = 'neutral' }: HybridBadgeProps) {
  const palette =
    tone === 'success'
      ? { bg: 'rgba(22, 213, 154, 0.16)', border: 'rgba(22, 213, 154, 0.4)', text: v2Tokens.colors.success }
      : tone === 'info'
      ? { bg: 'rgba(34, 211, 238, 0.16)', border: 'rgba(34, 211, 238, 0.4)', text: v2Tokens.colors.neonSecondary }
      : tone === 'warning'
      ? { bg: 'rgba(244, 201, 78, 0.16)', border: 'rgba(244, 201, 78, 0.4)', text: v2Tokens.colors.warning }
      : tone === 'danger'
      ? { bg: 'rgba(255, 94, 126, 0.16)', border: 'rgba(255, 94, 126, 0.42)', text: v2Tokens.colors.danger }
      : { bg: 'rgba(148, 137, 178, 0.18)', border: 'rgba(148, 137, 178, 0.36)', text: v2Tokens.colors.textSecondary };

  return (
    <View style={[styles.base, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: v2Tokens.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    fontSize: v2Tokens.typography.chip,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
});
