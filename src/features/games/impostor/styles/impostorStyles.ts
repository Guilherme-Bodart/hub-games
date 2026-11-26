import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  cluesContent: {
    paddingBottom: 40,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyActions: {
    gap: 10,
    marginTop: 6,
  },
  errorStrip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 19,
  },
  root: {
    gap: 14,
  },
  safeArea: {
    flex: 1,
  },
});
