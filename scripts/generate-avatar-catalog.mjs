import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const ASSETS_DIR = path.join(ROOT_DIR, 'assets', 'images');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src', 'features', 'lobby', 'avatarCatalog.generated.ts');
const AVATAR_FILE_PATTERN = /^avatar_(\d+)\.webp$/i;

const parseAvatarFiles = async () => {
  const entries = await fs.readdir(ASSETS_DIR, { withFileTypes: true });
  const avatarIds = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .map((fileName) => {
      const match = fileName.match(AVATAR_FILE_PATTERN);
      return match ? Number(match[1]) : null;
    })
    .filter((value) => Number.isInteger(value) && value !== null);

  const uniqueIds = [...new Set(avatarIds)].sort((a, b) => a - b);

  if (uniqueIds.length === 0) {
    throw new Error('No avatar files found. Expected files like avatar_1.webp in assets/images.');
  }

  const highestId = uniqueIds[uniqueIds.length - 1];

  for (let expectedId = 1; expectedId <= highestId; expectedId += 1) {
    if (!uniqueIds.includes(expectedId)) {
      throw new Error(`Missing avatar_${expectedId}.webp. Keep a contiguous sequence: avatar_1.webp ... avatar_${highestId}.webp.`);
    }
  }

  return uniqueIds;
};

const buildOutput = (avatarIds) => {
  const lines = avatarIds.map(
    (avatarId) => `  require('../../../assets/images/avatar_${avatarId}.webp'),`
  );

  return [
    '// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.',
    "// Run: npm run avatars:sync",
    "import { ImageSourcePropType } from 'react-native';",
    '',
    'export const GENERATED_AVATAR_ASSETS: ReadonlyArray<ImageSourcePropType> = [',
    ...lines,
    '];',
    '',
  ].join('\n');
};

const syncAvatarCatalog = async () => {
  const avatarIds = await parseAvatarFiles();
  const output = buildOutput(avatarIds);
  await fs.writeFile(OUTPUT_FILE, output, 'utf8');
  console.log(`Avatar catalog synced with ${avatarIds.length} files.`);
};

syncAvatarCatalog().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
