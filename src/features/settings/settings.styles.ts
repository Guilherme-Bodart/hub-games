import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  backgroundMilkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },
  glassCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    borderColor: 'rgba(255,255,255,0.86)',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitleMarker: {
    width: 7,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#7F72E8',
  },
  sectionTitle: {
    color: '#2B2A46',
    fontSize: 44,
    lineHeight: 44,
    fontFamily: 'Baloo2_700Bold',
    letterSpacing: 0.6,
  },
  sectionSubtitle: {
    color: '#8A95AF',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Nunito_700Bold',
    marginTop: 2,
  },
  optionStack: {
    gap: 10,
    marginTop: 6,
  },
  languageButton: {
    width: '100%',
    alignSelf: 'stretch',
  },
});
