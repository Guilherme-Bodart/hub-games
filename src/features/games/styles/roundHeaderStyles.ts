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
    gap: 1,
  },
  roundLabel: {
    fontSize: 10,
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  gameTitle: {
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: -0.6,
    textTransform: 'uppercase',
  },
  phaseHeaderRight: {
    alignItems: 'flex-end',
    gap: 5,
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
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  infoButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rulesText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
