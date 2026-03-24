import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { BentoCard } from '@/src/v2/components/base/BentoCard';
import { v2Tokens } from '@/src/v2/design-system';

type HybridHeaderProps = {
  title: string;
  subtitle?: string;
  showStatusDot?: boolean;
  onPressSettings?: () => void;
};

export function HybridHeader({ title, subtitle, showStatusDot = true, onPressSettings }: HybridHeaderProps) {
  return (
    <BentoCard style={styles.wrap}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.right}>
        {showStatusDot ? <View style={styles.dot} /> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir configuracoes"
          onPress={onPressSettings}
          style={styles.iconButton}>
          <SymbolView
            name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }}
            size={16}
            tintColor={v2Tokens.colors.textSecondary}
          />
        </Pressable>
      </View>
    </BentoCard>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: v2Tokens.spacing.sm,
    paddingHorizontal: v2Tokens.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    paddingRight: v2Tokens.spacing.sm,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: v2Tokens.spacing.xs,
  },
  title: {
    color: v2Tokens.colors.textPrimary,
    fontSize: v2Tokens.typography.title,
    lineHeight: v2Tokens.typography.title + 2,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 2,
    color: v2Tokens.colors.textSecondary,
    fontSize: v2Tokens.typography.caption,
    fontWeight: '600',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: v2Tokens.radius.pill,
    backgroundColor: v2Tokens.colors.success,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: v2Tokens.radius.pill,
    borderWidth: 1,
    borderColor: v2Tokens.colors.border,
    backgroundColor: v2Tokens.colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
