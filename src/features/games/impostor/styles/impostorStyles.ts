import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 28,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorStrip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 17,
  },
  root: {
    gap: 14,
  },
  safeArea: {
    flex: 1,
  },
  screenBackdrop: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
