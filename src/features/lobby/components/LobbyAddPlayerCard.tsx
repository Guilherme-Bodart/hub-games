import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export const LobbyAddPlayerCard = memo(function LobbyAddPlayerCard({
  onPress,
  accessibilityLabel,
}: {
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.outer, pressed ? styles.outerPressed : null]}>
      <View style={styles.inner}>
        <View pointerEvents="none" style={styles.innerInsetHighlight} />
        <View style={styles.plusIconWrap}>
          <View style={styles.plusVertical} />
          <View style={styles.plusHorizontal} />
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  outer: {
    minHeight: 112,
    height: '100%',
    width: '100%',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D5E0EF',
    backgroundColor: '#EEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    position: 'relative',
  },
  outerPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  inner: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 16,
    backgroundColor: '#D8E2EF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerInsetHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  plusIconWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusVertical: {
    position: 'absolute',
    width: 6,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#9FAECC',
  },
  plusHorizontal: {
    position: 'absolute',
    width: 28,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#9FAECC',
  },
});
