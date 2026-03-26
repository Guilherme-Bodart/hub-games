import { StyleSheet } from 'react-native';

import { CATALOG_UI } from '@/src/features/catalog/catalog.constants';
import type { CatalogButtonTone, CatalogTileTone } from '@/src/features/catalog/catalog.types';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  pageFrame: {
    backgroundColor: 'rgba(255,255,255,0.80)',
  },
  backgroundMilkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  cardsContent: {
    paddingBottom: 120,
  },
  gameTile: {
    borderColor: 'rgba(255,255,255,0.48)',
  },
  tileTextureOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.72,
  },
  tileActionButton: {
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tileActionPressed: {
    transform: [{ scale: 0.98 }],
  },
  codeButton: {
    width: '100%',
  },
  codeModalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  codeModalInput: {
    borderColor: 'rgba(61,57,100,0.35)',
    fontFamily: 'Nunito_800ExtraBold',
  },
  codeModalInputError: {
    borderColor: '#D6456B',
  },
  codeModalConfirmButton: {
    borderRadius: 16,
  },
  modeButtonDisabled: {
    opacity: 0.5,
  },
});

export const resolveTileBackgroundStyle = (tone: CatalogTileTone) => {
  switch (tone) {
    case 'purple':
      return { backgroundColor: CATALOG_UI.cardPurple };
    case 'cyan':
      return { backgroundColor: CATALOG_UI.cardCyan };
    case 'pink':
      return { backgroundColor: CATALOG_UI.cardPink };
    case 'blue':
    default:
      return { backgroundColor: CATALOG_UI.cardBlue };
  }
};

export const resolveActionBackgroundStyle = (tone: CatalogButtonTone) =>
  tone === 'orange' ? { backgroundColor: CATALOG_UI.clayOrange } : { backgroundColor: CATALOG_UI.clayBlue };
