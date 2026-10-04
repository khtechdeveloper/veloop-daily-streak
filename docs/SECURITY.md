# Security Documentation

This document maps each "Critical Failure Condition" from the project spec to the mechanism in this codebase that prevents it.

| Attack / failure mode | Prevented by |
|---|---|
| Streak hardcoded in React | `currentStreak`/`currentDay` are never stored as editable numbers — they're recomputed every request in `streak.service.js` from claim history. Changing React DevTools state does nothing because the next re-render pulls from the API again. |
| Rewards hardcoded in React | Reward values live in `StreakReward` (MongoDB), fetched via `GET /daily-streak`. Frontend renders `reward.amount`/`reward.currency` from the response only. |
| Timer controlled by browser clock | `nextClaimAt` is a server-issued ISO timestamp computed from `lastClaim.claimedAt + CLAIM_INTERVAL_HOURS`. The frontend's `useCountdown` hook only subtracts `Date.now()` (device time) from that fixed target for *display*; eligibility is re-verified server-side (`computeStreakState`) using the server's own clock on every `GET /status` and every `POST /claim`. |
| User changes current day from frontend | `POST /claim` runs `sanitizeClaimBody` middleware which discards the entire request body before it reaches the controller. The day claimed is always `state.currentDay` as computed server-side. |
| User changes reward amount | Same — `reward`, `amount`, `currency` in the body are never read. The reward is looked up server-side via `rewardService.getRewardForDay(day)`. |
| User claims a locked day | `claimDay()` throws `409 LOCKED` unless `computeStreakState` says `dayStatus === "AVAILABLE"`. |
| User claims the same day twice | Unique Mongo index `StreakClaim(userId, cycleId, day)`. A second insert throws `E11000`, caught and converted to `409 ALREADY_CLAIMED`. |
| User jumps directly to Day 7 | The day claimed is never taken from client input at all — see above. There's no code path where a client-supplied day reaches the database write. |
| Missed streak does not reset | `computeStreakState` compares `now` against `missedDeadline = nextClaimAt + MISSED_GRACE_HOURS`. If exceeded, the active cycle is marked `MISSED` and a new cycle starts at Day 1 automatically on the user's next `GET`/`POST`. |
| Previous-day validation missing | Sequential claiming is architecturally guaranteed: the "current day" is always `lastClaim.day + 1` (or `1` with no claims), so a claim can never be recorded for a day whose predecessor wasn't claimed. |
| Wallet update only in React | `walletService.creditWallet` performs an atomic `$inc` on the `Wallet` document inside the same Mongo transaction as the claim insert. The frontend only ever displays `GET /daily-streak/wallet`'s response. |
| No MongoDB persistence | Every model above is a persisted Mongoose schema; nothing streak-related lives only in memory. |
| Fake/no APIs | All state changes go through real Express routes backed by MongoDB; there is no mock/static JSON standing in for the API. |
| No authentication | `requireAuth` middleware (JWT) guards every `/daily-streak/*` route; requests without a valid, unexpired token get `401 UNAUTHENTICATED`. |
| Cross-user attack (User A claims for User B) | Identity is derived exclusively from `req.user.id`, set by verifying the JWT's `sub` claim. Nothing in `req.body`/`req.query` can override it (spec #44/#45/#100). |
| UI is only a screenshot | The UI is built from real React components (`RewardCard`, `UltimateReward`, etc.) driven by live API data — not a static image. |
| Production credentials committed | `.env` is gitignored; `.env.example` ships with placeholders only. |

## Concurrency

`POST /claim` opens a MongoDB session and runs the read-check-write sequence inside `session.withTransaction(...)`. Two simultaneous requests for the same day:

1. Both read the same "AVAILABLE" state (benign race on the read).
2. Both attempt to insert a `StreakClaim` with the same `(userId, cycleId, day)`.
3. MongoDB's unique index allows exactly one insert to succeed; the other throws `E11000` inside the transaction, which aborts that transaction cleanly and surfaces as `409 ALREADY_CLAIMED` to the loser.
4. Only the winner's wallet credit and transaction record are committed.

This is what guarantees "+10 VEs, not +20 VEs" under concurrent claims.

## Error hygiene

`error.middleware.js` only ever forwards `message`/`code` for errors explicitly thrown as `ApiError`. Anything else (Mongoose `CastError`, `MongoServerError`, unexpected exceptions) is logged server-side and replaced with a generic `"Unable to process your reward. Please try again."` before it reaches the client — internal stack traces and driver error names are never exposed (spec #92).

## Rate limiting

`express-rate-limit` caps general traffic (300 req/15min per IP) and specifically the claim endpoint (10 req/min per IP) as defense-in-depth against scripted abuse. This is a secondary control — the primary guarantee against duplicate/concurrent rewards is the database unique index + transaction, not the rate limiter.

## Auditing

`AuditLog` records every claim request, success, rejection, duplicate attempt, and reset, plus auth events — enough for the team to reconstruct "what happened" for any account without touching production data.
