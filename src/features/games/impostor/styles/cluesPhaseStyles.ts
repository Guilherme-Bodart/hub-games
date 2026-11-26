import { StyleSheet } from 'react-native';

export const cluesPhaseStyles = StyleSheet.create({
  section: {
    gap: 18,
  },
  heroPanel: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
    overflow: 'visible',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroEyebrow: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  heroHint: {
    fontSize: 13,
    lineHeight: 19,
  },
  progressBadge: {
    minHeight: 34,
    minWidth: 64,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBadgeText: {
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 12,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressStepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 2,
  },
  progressStepItem: {
    width: 60,
    alignItems: 'center',
    gap: 6,
  },
  progressStepAvatarFocus: {
    width: 56,
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepAvatarSide: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepTextFocus: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  progressStepTextSide: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  heroBody: {
    paddingTop: 2,
  },
  composerStage: {
    paddingTop: 2,
  },
  composerCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  composerHelper: {
    fontSize: 13,
    lineHeight: 19,
  },
  composerInput: {
    marginTop: 0,
  },
  actionButton: {
    width: '100%',
  },
  passiveDockPill: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  passiveDockPillText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  rosterSection: {
    gap: 10,
  },
  rosterHeader: {
    gap: 2,
    paddingHorizontal: 4,
  },
  rosterEyebrow: {
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  rosterTitle: {
    fontSize: 17,
    lineHeight: 23,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardCell: {
    minWidth: 0,
  },
  playerCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    overflow: 'visible',
  },
  playerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  playerMeta: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  playerMetaLabel: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  playerName: {
    fontSize: 16,
    lineHeight: 21,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  playerStatusInline: {
    fontSize: 11,
    lineHeight: 14,
  },
  emphasisLabel: {
    fontSize: 19,
    lineHeight: 25,
    minHeight: 26,
  },
  historyBlock: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  historyLabel: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  historyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  historyChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  historyChipText: {
    fontSize: 11,
    lineHeight: 15,
  },
});
