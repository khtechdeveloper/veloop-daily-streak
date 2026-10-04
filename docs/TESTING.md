# Testing Documentation

Manual + Postman test matrix. Import `postman/VELoop-Daily-Streak.postman_collection.json`, run `Register` or `Login` first (the collection auto-saves the returned token into a collection variable used by every other request).

| # | Test | Steps | Expected result |
|---|---|---|---|
| 1 | Normal claim | Login → `GET /daily-streak` (Day 1 AVAILABLE) → `POST /claim` | 200, Day 1 becomes `CLAIMED`, wallet balance increases by the seeded Day 1 amount |
| 2 | Duplicate claim | Repeat `POST /claim` immediately after test 1 | `409 ALREADY_CLAIMED` |
| 3 | Concurrent claim | Fire two `POST /claim` requests back-to-back (e.g. Postman Runner with 0ms delay, or `Promise.all` in a quick script) while Day 2 is available | Exactly one `200`, the other `409 ALREADY_CLAIMED`; wallet increases by only one reward's amount |
| 4 | Locked day | Claim Day 1, then immediately `POST /claim` again before 24h pass | `409 LOCKED` |
| 5 | Fake day | `POST /claim` with body `{ "day": 7 }` while only Day 2 is eligible | Body is ignored entirely; Day 2 (the real eligible day) is claimed, not Day 7 |
| 6 | Fake reward | `POST /claim` with body `{ "day": 2, "reward": 1000000, "currency": "VES" }` | Ignored; actual configured reward for the real eligible day is granted |
| 7 | Fake streak | Attempt to influence `currentStreak` via any client input | No endpoint accepts a streak value from the client; state is always recomputed server-side |
| 8 | Fake user | `POST /claim` with body `{ "userId": "<anotherUserId>" }` while authenticated as User A | Ignored; the claim is recorded under User A (from the JWT), never User B |
| 9 | Timer manipulation | Change your device/system clock forward 24h without waiting for real time to pass, then hit `POST /claim` | Still `409 LOCKED` if the *server's* clock says the window hasn't opened (test via server, not by trusting a manually-set frontend countdown) |
| 10 | Missed day | Claim Day 1 and Day 2. Do not claim Day 3 within `CLAIM_INTERVAL_HOURS + MISSED_GRACE_HOURS`. For dev testing, temporarily lower `STREAK_MISSED_GRACE_HOURS`/`STREAK_CLAIM_INTERVAL_HOURS` in `.env` to minutes, or manually backdate a `StreakClaim.claimedAt` in MongoDB Atlas for a fast repro. | Next `GET /daily-streak` reports `wasReset: true`, `currentDay: 1`, `currentStreak: 0`; the old cycle is marked `MISSED` in `StreakCycle` |
| 11 | Streak reset correctness | Continuing from test 10 | A fresh `StreakCycle` document exists with `cycleNumber` incremented; Day 1 is `AVAILABLE` again |
| 12 | Refresh state | Claim a day, then reload the frontend page | Claimed day still shows `CLAIMED`, next day still shows the correct locked/available state — nothing resets to "Claim Now" just because React remounted |
| 13 | Multiple tabs | Open the Daily Streak page in two tabs, claim in Tab A | Tab B's next `GET`/claim attempt reflects the already-claimed state; it cannot also successfully claim |
| 14 | Unauthorized request | Call any `/daily-streak/*` route with no `Authorization` header, or an expired/invalid token | `401 UNAUTHENTICATED` |
| 15 | Database integrity | After test 1 | In MongoDB Atlas, confirm a `StreakClaim` doc exists whose `transactionId` matches a `WalletTransaction` doc, whose `balanceAfter` matches the current `Wallet.balances` value |

## Notes on reproducing time-based tests quickly

The cleanest way to test missed-day/reset logic without waiting 24–48 real hours is to temporarily set, in your local `.env`:
```
STREAK_CLAIM_INTERVAL_HOURS=0.02   # ~72 seconds
STREAK_MISSED_GRACE_HOURS=0.02
```
restart the backend, and walk through the claim → wait → claim / claim → wait past grace → check-reset flow in real (short) time. Revert before demoing normally.

## What "PASS" looks like end-to-end

- Streak in DevTools → editing local component state has zero effect after the next refetch.
- Fake reward/day/user payloads → always ignored, never reflected in the database.
- Duplicate/concurrent claims → exactly one reward granted, verified in `WalletTransaction`.
- Genuine missed streak → resets correctly to Day 1 on the user's next visit.
- Claim/reward transaction → visible and traceable in MongoDB.
