import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#DDE4EE',
  },
  page: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
    gap: 14,
  },
  languageCard: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  languageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageAccent: {
    width: 6,
    height: 20,
    borderRadius: 999,
    backgroundColor: '#776AE8',
  },
  languageTitle: {
    color: '#222552',
    fontSize: 24,
    lineHeight: 26,
    letterSpacing: 0.6,
    fontStyle: 'italic',
    fontFamily: 'Baloo2_700Bold',
    
  },
  languageSubtitle: {
    color: '#8A95AB',
    fontSize: 13,
    lineHeight: 17,
    fontFamily: 'Nunito_700Bold',
    
  },
  optionStack: {
    gap: 10,
    marginTop: 6,

  },
  languageButton: {
    width: '100%',
  },
});
