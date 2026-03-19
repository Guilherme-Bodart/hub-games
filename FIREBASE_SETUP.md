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
