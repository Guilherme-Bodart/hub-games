import { StyleSheet } from 'react-native';

export const secretPhaseStyles = StyleSheet.create({
  headerWrap: {
    gap: 8,
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 2,
  },
  playerStack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  playerBubble: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  plusBubbleLabel: {
    fontSize: 11,
    lineHeight: 13,
  },
  scaleCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  scaleHeaderRow: {
    alignItems: 'center',
  },
  scaleTitlePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  scaleTitle: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  scaleAxisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scaleEdgeLabel: {
    fontSize: 15,
    lineHeight: 19,
    flexShrink: 0,
    textTransform: 'uppercase',
  },
  scaleTrackWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  scaleTrack: {
    height: 6,
    borderRadius: 999,
    position: 'relative',
    overflow: 'visible',
  },
  scaleTrackGradient: {
    ...StyleSheet.absoluteFill,
    borderRadius: 999,
  },
  scaleDotHalo: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    top: -6,
    left: '50%',
    marginLeft: -9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  scaleThemeText: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
