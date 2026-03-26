# Firebase Setup

## 1) Enable Anonymous Auth
1. Firebase Console -> `Build` -> `Authentication`.
2. Open `Sign-in method`.
3. Enable provider `Anonymous`.

## 2) Apply Realtime Database Rules
1. Firebase Console -> `Build` -> `Realtime Database`.
2. Open tab `Rules`.
3. Replace current rules with the contents of `database.rules.json`.
4. Publish rules.

## Notes
- These rules require authenticated users (`auth != null`) and membership in the room.
- Room creation is allowed only when the creating user inserts itself in `lobby.members`.
- Device updates are restricted to the owner (`ownerUid`).

## 3) Auto-clean inactive rooms (30 min)
This project now includes a scheduled Cloud Function that deletes rooms with no activity for 30 minutes.

1. Install Firebase CLI and login:
   - `npm i -g firebase-tools`
   - `firebase login`
2. In `backend/functions`, install dependencies:
   - `cd backend/functions`
   - `npm install`
3. Back to project root, deploy the cleanup function:
   - `firebase deploy --only functions:cleanupInactiveRooms`

Implementation details:
- Room activity is tracked in `rooms/{roomCode}/lobby/lastActivityAt`.
- The function runs every 15 minutes and deletes stale rooms.
