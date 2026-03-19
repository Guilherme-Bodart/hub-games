import { Image, ImageSourcePropType } from 'react-native';

import { gameCatalog } from '@/src/features/catalog';
import { GENERATED_AVATAR_ASSETS } from '@/src/features/lobby/avatarCatalog.generated';
import { preloadSfxCues } from '@/src/ui/audio';
import { SfxCueId } from '@/src/ui/audio';

const preloadImageSource = async (source: ImageSourcePropType): Promise<void> => {
  const resolveAssetSourceFn =
    typeof Image.resolveAssetSource === 'function' ? Image.resolveAssetSource.bind(Image) : null;

  let resolvedUri: string | undefined;

  if (resolveAssetSourceFn) {
    try {
      const resolved = resolveAssetSourceFn(source);
      resolvedUri = resolved?.uri;
    } catch {
      resolvedUri = undefined;
    }
  }

  if (!resolvedUri && source && typeof source === 'object' && !Array.isArray(source) && 'uri' in source) {
    const directUri = source.uri;
    resolvedUri = typeof directUri === 'string' ? directUri : undefined;
  }

  if (!resolvedUri) {
    return;
  }

  try {
    await Image.prefetch(resolvedUri);
  } catch {
    // Non-critical asset: best effort preload only.
  }
};

const getCatalogCoverAssets = (): ImageSourcePropType[] =>
  gameCatalog
    .map((game) => game.coverImage)
    .filter((cover): cover is ImageSourcePropType => Boolean(cover));

// The project does not yet bundle SFX assets; these cue ids are reserved for the audio stage.
export const CRITICAL_SFX_CUES = [
  'sfx_reveal',
  'sfx_submit',
  'sfx_vote',
  'sfx_result',
  'sfx_warning',
  'sfx_reconnect',
  'sfx_confirm',
  'sfx_error',
] as const satisfies readonly SfxCueId[];

export const preloadWarmBootAssets = async (): Promise<void> => {
  const imageSources: ImageSourcePropType[] = [
    ...GENERATED_AVATAR_ASSETS,
    ...getCatalogCoverAssets(),
  ];

  await Promise.all([
    Promise.all(imageSources.map((source) => preloadImageSource(source))),
    preloadSfxCues(CRITICAL_SFX_CUES),
  ]);
};
