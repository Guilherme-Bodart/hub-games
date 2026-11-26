import { StyleSheet } from 'react-native';

const ORDERING_GRID_ROW_GAP = 10;
const ORDERING_GRID_COLUMN_GAP = 10;

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorStrip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
  },
  voiceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  voiceNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  hostHintStrip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hostHintText: {
    fontSize: 12,
    lineHeight: 16,
  },
  playersMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  playersSectionTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  cardsViewport: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  emptyCardsState: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  emptyCardsText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  secretStage: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  secretWaitingWrap: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secretWaitingText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  secretPrimaryButton: {
    width: '100%',
  },
  secretRevealSubHint: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  orderingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: ORDERING_GRID_ROW_GAP,
    columnGap: ORDERING_GRID_COLUMN_GAP,
    paddingBottom: 8,
  },
  orderingCard: {
    width: '48.2%',
    minHeight: 80,
    position: 'relative',
  },
  flipShell: {
    minHeight: 74,
    position: 'relative',
  },
  flipFace: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backfaceVisibility: 'hidden',
  },
  flipBackFace: {
    ...StyleSheet.absoluteFill,
  },
  cornerBadgeWrap: {
    position: 'absolute',
    right: 8,
    top: 8,
    alignItems: 'center',
    gap: 5,
    zIndex: 6,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orderBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  orderBadgeText: {
    fontSize: 12,
    lineHeight: 14,
  },
  dragHandleWrap: {
    minWidth: 22,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cardMeta: {
    flex: 1,
    gap: 3,
    paddingRight: 28,
  },
  playerName: {
    fontSize: 15,
    lineHeight: 19,
  },
  playerHint: {
    fontSize: 11,
    lineHeight: 15,
  },
  revealedNumber: {
    fontSize: 22,
    lineHeight: 24,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  resultIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTextCol: {
    flex: 1,
    gap: 2,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  resultTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 22,
  },
  resultSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  rulesIntroText: {
    fontSize: 14,
    lineHeight: 20,
  },
  rulesStepsWrap: {
    gap: 10,
  },
  rulesStepCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 6,
  },
  rulesStepPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  rulesStepNumber: {
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  rulesStepText: {
    fontSize: 14,
    lineHeight: 19,
  },
});
