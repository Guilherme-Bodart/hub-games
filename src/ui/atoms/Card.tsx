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
          shadowColor: '#000000',
          shadowOpacity: isElevated ? theme.semantic.elevation.medium.shadowOpacity : 0,
          shadowRadius: isElevated ? theme.semantic.elevation.medium.shadowRadius : 0,
          shadowOffset: { width: 0, height: 6 },
          elevation: isElevated ? theme.semantic.elevation.medium.elevation : 0,
          opacity: disabled ? theme.semantic.motion.feedback.disabledOpacity : 1,
          padding: theme.semantic.layout.spacing.md,
          gap: theme.semantic.layout.spacing.sm,
        },
        style,
      ]}>
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
    overflow: 'visible',
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
