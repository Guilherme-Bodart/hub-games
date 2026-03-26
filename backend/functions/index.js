const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const ROOM_IDLE_TTL_MS = 30 * 60 * 1000;
const BATCH_SIZE = 500;
const MAX_BATCH_LOOPS = 20;

function resolveLastActivity(roomValue) {
  if (!roomValue || typeof roomValue !== 'object') {
    return 0;
  }

  const lobbyLastActivity = roomValue?.lobby?.lastActivityAt;
  if (typeof lobbyLastActivity === 'number' && Number.isFinite(lobbyLastActivity)) {
    return lobbyLastActivity;
  }

  const createdAt = roomValue?.createdAt;
  if (typeof createdAt === 'number' && Number.isFinite(createdAt)) {
    return createdAt;
  }

  return 0;
}

exports.cleanupInactiveRooms = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: 'Etc/UTC',
    region: 'southamerica-east1',
    timeoutSeconds: 180,
    memory: '256MiB',
  },
  async () => {
    const db = admin.database();
    const cutoff = Date.now() - ROOM_IDLE_TTL_MS;
    let totalDeleted = 0;
    let totalChecked = 0;

    for (let loop = 0; loop < MAX_BATCH_LOOPS; loop += 1) {
      const snapshot = await db
        .ref('rooms')
        .orderByChild('lobby/lastActivityAt')
        .endAt(cutoff)
        .limitToFirst(BATCH_SIZE)
        .get();

      if (!snapshot.exists()) {
        break;
      }

      const updates = {};

      snapshot.forEach((roomSnapshot) => {
        totalChecked += 1;
        const roomCode = roomSnapshot.key;
        const roomValue = roomSnapshot.val();
        const lastActivityAt = resolveLastActivity(roomValue);

        if (roomCode && lastActivityAt > 0 && lastActivityAt <= cutoff) {
          updates[roomCode] = null;
        }
      });

      const roomsToDelete = Object.keys(updates).length;

      if (roomsToDelete === 0) {
        break;
      }

      await db.ref('rooms').update(updates);
      totalDeleted += roomsToDelete;

      if (roomsToDelete < BATCH_SIZE) {
        break;
      }
    }

    logger.info('cleanupInactiveRooms finished', {
      cutoff,
      totalChecked,
      totalDeleted,
      ttlMinutes: 30,
    });
  }
);
