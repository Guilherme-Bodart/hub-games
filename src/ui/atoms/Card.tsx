import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '@/src/theme';

type CardVariant = 'elevated' | 'outlined' | 'filled';

type CardProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  variant?: CardVariant;
  selected?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function Card({
  children,
  title,
  subtitle,
  variant = 'elevated',
  selected = false,
  disabled = false,
  style,
}: CardProps) {
  const { theme } = useTheme();
  const isElevated = variant === 'elevated';
  const showHeader = Boolean(title || subtitle);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            variant === 'filled' ? theme.semantic.bg.elevated : theme.semantic.card.bg,
          borderColor: selected ? theme.semantic.border.focus : theme.semantic.card.border,
          borderRadius: theme.semantic.layout.radius.xl,
          borderWidth: selected
            ? theme.semantic.layout.borderWidth.medium
            : theme.semantic.layout.borderWidth.subtle,
          shadowColor: theme.semantic.shadow.neon,
          shadowOpacity: isElevated ? theme.semantic.elevation.medium.shadowOpacity : 0,
          shadowRadius: isElevated ? theme.semantic.elevation.medium.shadowRadius : 0,
          shadowOffset: { width: 0, height: 0 },
          elevation: isElevated ? theme.semantic.elevation.medium.elevation : 0,
          opacity: disabled ? theme.semantic.motion.feedback.disabledOpacity : 1,
          padding: theme.semantic.layout.spacing.md,
          gap: theme.semantic.layout.spacing.sm,
        },
        style,
      ]}>
      <View
        pointerEvents="none"
        style={[
          styles.topSheen,
          { backgroundColor: `${theme.semantic.button.primary.bg}1c` },
        ]}
      />
      {showHeader ? (
        <View style={styles.header}>
          {title ? (
            <Text
              style={[
                styles.title,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
  },
  topSheen: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 42,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
