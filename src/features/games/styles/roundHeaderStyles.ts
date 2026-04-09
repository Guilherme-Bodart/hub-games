import { StyleSheet } from 'react-native';

export const roundHeaderStyles = StyleSheet.create({
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  phaseHeaderLeft: {
    flex: 1,
    gap: 3,
  },
  roundLabel: {
    fontSize: 13,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.7,
  },
  gameTitle: {
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -0.4,
    textTransform: 'uppercase',
  },
  phaseHeaderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  playerStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerBubble: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
    marginLeft: -6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  plusBubbleLabel: {
    fontSize: 12,
    lineHeight: 12,
  },
  playersCountLabel: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  infoButton: {
    marginBottom: 2,
  },
  rulesText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
