import { StyleSheet } from 'react-native';

export const forbiddenWordStyles = StyleSheet.create({
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
  cardContainer: {
    gap: 12,
  },
  tabooCard: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  timerStrip: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 8,
  },
  timerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  timerValuePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  timerValueText: {
    fontSize: 13,
  },
  timerTrack: {
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 999,
  },
  mainWordBanner: {
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 4,
  },
  mainWordSubLabel: {
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  mainWordTitle: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  forbiddenSection: {
    padding: 16,
    gap: 10,
  },
  forbiddenHeader: {
    fontSize: 11,
    letterSpacing: 0.9,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  forbiddenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  forbiddenChip: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  forbiddenWordText: {
    fontSize: 15,
    flexShrink: 1,
    textAlign: 'center',
  },
  buzzerPlinth: {
    borderRadius: 16,
    paddingBottom: 4,
  },
  buzzerFace: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  buzzerText: {
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.6,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    gap: 12,
  },
  summaryTitle: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  summaryStatsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  summaryStatTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 2,
  },
  summaryStatValue: {
    fontSize: 26,
    lineHeight: 30,
  },
  summaryStatLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scoreboardList: {
    gap: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  scorePlayerName: {
    flex: 1,
    fontSize: 15,
  },
  scorePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreValue: {
    fontSize: 14,
  },
  rulesText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
