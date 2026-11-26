import { StyleSheet } from 'react-native';

export const revealPhaseStyles = StyleSheet.create({
  singleCardStage: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  progressPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  progressPillText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  headerBlock: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  passLabel: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  playerName: {
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
  },
  playerHint: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 320,
  },
  actionPanel: {
    gap: 10,
    width: '100%',
    paddingTop: 4,
  },
  actionButton: {
    width: '100%',
  },
  actionPanelHint: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  emptyState: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
