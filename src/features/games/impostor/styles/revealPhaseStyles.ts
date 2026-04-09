import { StyleSheet } from 'react-native';

export const revealPhaseStyles = StyleSheet.create({
  actionPanel: {
    gap: 10,
    width: '100%',
  },
  actionButton: {
    width: '100%',
  },
  actionPanelHint: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  emptyStateText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  passLabel: {
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  playerHint: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  playerName: {
    fontSize: 34,
    lineHeight: 38,
    textAlign: 'center',
  },
  singleCardStage: {
    gap: 14,
    alignItems: 'center',
  },
});
