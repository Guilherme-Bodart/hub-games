import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type LobbyAddPlayerCardProps = {
  onPress: () => void;
  accessibilityLabel: string;
};

export const LobbyAddPlayerCard = memo(function LobbyAddPlayerCard({
  onPress,
  accessibilityLabel,
}: LobbyAddPlayerCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.outer}>
      <View style={styles.inner}>
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.08)',
            'rgba(0,0,0,0.04)',
            'rgba(0,0,0,0.02)',
            'rgba(0,0,0,0.04)',
            'rgba(0,0,0,0.08)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.innerShadow}
        />
        <View pointerEvents="none" style={styles.innerInsetHighlight} />
        <View pointerEvents="none" style={styles.plusIconWrap}>
          <View style={styles.plusVertical} />
          <View style={styles.plusHorizontal} />
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  outer: {
    minHeight: 106,
    width: '100%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D5E0EF',
    backgroundColor: '#EEF3FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  inner: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 12,
    backgroundColor: '#D8E2EF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  innerInsetHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.78)',
    borderRightColor: 'rgba(255,255,255,0.78)',
  },
  plusIconWrap: {
    width: 40,
    height: 40,
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
