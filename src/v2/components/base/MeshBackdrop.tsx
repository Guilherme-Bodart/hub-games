import { StyleSheet, View } from 'react-native';

import { v2Tokens } from '@/src/v2/design-system';

export function MeshBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbCenter]} />
      <View style={[styles.orb, styles.orbBottom]} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: v2Tokens.radius.pill,
  },
  orbTop: {
    width: 300,
    height: 300,
    top: -120,
    left: -100,
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
  },
  orbCenter: {
    width: 440,
    height: 440,
    alignSelf: 'center',
    top: '25%',
    backgroundColor: 'rgba(34, 211, 238, 0.09)',
  },
  orbBottom: {
    width: 280,
    height: 280,
    right: -100,
    bottom: -100,
    backgroundColor: 'rgba(255, 109, 141, 0.11)',
  },
});
