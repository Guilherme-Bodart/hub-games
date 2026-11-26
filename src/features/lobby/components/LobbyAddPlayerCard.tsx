import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type GameAccentPalette, useTheme } from '@/src/theme';

type LobbyAddPlayerCardProps = {
  label: string;
  gameAccent: GameAccentPalette;
  onPress: () => void;
  accessibilityLabel: string;
};

export const LobbyAddPlayerCard = memo(function LobbyAddPlayerCard({
  label,
  gameAccent,
  onPress,
  accessibilityLabel,
}: LobbyAddPlayerCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.semantic.bg.surface,
          borderColor: theme.semantic.border.strong,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: gameAccent.tint,
            borderColor: theme.semantic.border.hairline,
          },
        ]}>
        <Ionicons name="add" size={26} color={gameAccent.primary} />
      </View>
      <Text
        numberOfLines={2}
        style={[
          styles.label,
          {
            color: theme.semantic.text.primary,
            fontFamily: theme.semantic.typography.titleFamily,
            fontWeight: theme.semantic.typography.titleWeight,
          },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    minHeight: 164,
    width: '100%',
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingHorizontal: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
});
