import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function AppStartupLoadingScreen() {
  return (
    <View style={styles.root}>
      <LinearGradient
        pointerEvents="none"
        colors={['#EFF4FA', '#E7EEF7', '#DDE6F1']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.overlay} />
      <View style={styles.card}>
        <Text style={styles.title}>FESTA HUB</Text>
        <ActivityIndicator size="small" color="#5B69D8" />
        <Text style={styles.subtitle}>Carregando jogos...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DDE4EE',
    paddingHorizontal: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#DCE2EC',
    backgroundColor: '#F6F8FC',
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    color: '#23254D',
    fontFamily: 'Baloo2_700Bold',
    fontSize: 36,
    lineHeight: 36,
    letterSpacing: 0.8,
  },
  subtitle: {
    color: '#5A5C79',
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    lineHeight: 18,
  },
});
