import { StyleSheet } from 'react-native';

export const drawPassStyles = StyleSheet.create({
  scrollContent: {
    gap: 12,
    paddingBottom: 28,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  categoryPillText: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  turnHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  turnHeaderTextWrap: {
    flex: 1,
    gap: 2,
  },
  playerTurnName: {
    fontSize: 17,
    lineHeight: 21,
  },
  turnInstruction: {
    fontSize: 12,
    lineHeight: 16,
  },
  rerollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  rerollBtnText: {
    fontSize: 11,
  },
  promptBanner: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  promptEyebrow: {
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  promptText: {
    fontSize: 19,
    lineHeight: 24,
    textAlign: 'center',
  },
  boardWrapper: {
    gap: 10,
  },
  canvasFrame: {
    width: '100%',
    height: 268,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  canvasCompact: {
    height: 224,
  },
  canvasHint: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 24,
  },
  canvasHintText: {
    fontSize: 13,
    textAlign: 'center',
  },
  toolbarCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  colorDotOuter: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  colorDotInner: {
    width: 24,
    height: 24,
    borderRadius: 999,
  },
  brushToolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  brushGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brushChip: {
    width: 34,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 32,
  },
  clearButtonText: {
    fontSize: 12,
  },
  handoffCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  handoffAvatarRing: {
    padding: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  handoffEyebrow: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  handoffName: {
    fontSize: 26,
    lineHeight: 30,
    textAlign: 'center',
  },
  handoffBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  galleryList: {
    gap: 10,
  },
  comicPanel: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  comicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  comicAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  comicStepNum: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comicStepNumText: {
    fontSize: 11,
  },
  comicPromptBubble: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  comicPromptText: {
    fontSize: 17,
    lineHeight: 23,
    textAlign: 'center',
  },
  comicConnector: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 22,
  },
  rulesText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
