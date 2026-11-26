import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  pillTrack: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    gap: 6,
    marginTop: 4,
  },
  pillOptionPlinth: {
    flex: 1,
    borderRadius: 12,
  },
  pillOptionFace: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pillShortCode: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  pillLabel: {
    fontSize: 15,
    lineHeight: 19,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
  },
  prefRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  prefIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  prefCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  prefLabel: {
    fontSize: 16,
    lineHeight: 20,
  },
  prefDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
  motionSection: {
    gap: 10,
    paddingTop: 6,
  },
  segmentedTrack: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segmentedButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  segmentedLabel: {
    fontSize: 13,
    lineHeight: 17,
  },
});
