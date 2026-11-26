import { StyleSheet } from 'react-native';

export const redGreenFlagStyles = StyleSheet.create({
  scrollContent: {
    gap: 12,
    paddingBottom: 28,
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
    lineHeight: 16,
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
  singleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
  },
  singleBannerTexts: {
    flex: 1,
    gap: 2,
  },
  singleRoleLabel: {
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  singleName: {
    fontSize: 18,
    lineHeight: 22,
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
  handoffCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
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
    fontSize: 24,
    lineHeight: 28,
    textAlign: 'center',
  },
  handoffBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  cardsColumn: {
    gap: 10,
  },
  flagCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  flagCardStrip: {
    width: 6,
  },
  flagCardBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  flagCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectIndicator: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagOptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  pitchCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  pitchCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pitchTitle: {
    fontSize: 13,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  pitchFlagBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  pitchFlagText: {
    fontSize: 14,
    lineHeight: 20,
  },
  resultHeroCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 14,
  },
  matchAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  matchHeartBadge: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerCupidName: {
    fontSize: 20,
    lineHeight: 25,
    textAlign: 'center',
  },
  resultFlagsWrap: {
    width: '100%',
    gap: 8,
  },
  rulesText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
