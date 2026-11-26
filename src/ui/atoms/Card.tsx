import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { ELEVATION_STYLES, useTheme } from '@/src/theme';

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
        isElevated ? ELEVATION_STYLES.card : ELEVATION_STYLES.flat,
        {
          backgroundColor:
            variant === 'filled' ? theme.semantic.bg.subtle : theme.semantic.card.bg,
          borderColor: selected ? theme.semantic.border.focus : theme.semantic.border.hairline,
          borderRadius: theme.semantic.card.radius,
          borderWidth: selected ? 2 : 1,
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
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
