# Database Documentation

MongoDB via Mongoose. Seven collections.

## User
| field | type | notes |
|---|---|---|
| name | String | |
| email | String | unique, lowercase |
| passwordHash | String | bcrypt |
| isActive | Boolean | default true |

## Wallet
| field | type | notes |
|---|---|---|
| userId | ObjectId → User | unique (one wallet per user) |
| balances | Map<String, Number> | keyed by currency, e.g. `{ VES: 15, INR: 3 }` |

## StreakReward
The only source of truth for reward values — seeded once via `backend/seed/seedRewards.js`, editable later without touching frontend code.

| field | type | notes |
|---|---|---|
| day | Number | 1–7, unique |
| rewardType | String | `VES` \| `GIFT_CARD` |
| currency | String | `VES` \| `INR` |
| amount | Number | |
| title | String | "Daily Reward" / "Ultimate Reward" |
| subtitle | String | e.g. "Amazon Gift Card" |
| assetType | String | `coin` \| `gift-card` \| `crown` |
| active | Boolean | inactive rewards are excluded from responses |

## StreakCycle
One document per 7-day attempt a user makes.

| field | type | notes |
|---|---|---|
| userId | ObjectId → User | |
| cycleNumber | Number | increments per user |
| status | String | `ACTIVE` \| `COMPLETED` \| `MISSED` |
| startedAt / completedAt | Date | |

Indexes: `(userId, status)`, unique `(userId, cycleNumber)`.

## StreakClaim
One document per successful claim. **This is the anti-cheat backbone.**

| field | type | notes |
|---|---|---|
| userId | ObjectId → User | |
| cycleId | ObjectId → StreakCycle | |
| day | Number | |
| rewardId | ObjectId → StreakReward | |
| status | String | `SUCCESS` |
| claimedAt | Date | |
| transactionId | String | links to WalletTransaction |

**Unique index: `(userId, cycleId, day)`.** This is what makes duplicate claims and concurrent double-claims impossible at the database layer, independent of any application-level check.

## WalletTransaction
Immutable ledger — never updated or deleted, only appended.

| field | type |
|---|---|
| transactionId | String, unique ("STREAK-XXXXXXXX") |
| userId | ObjectId |
| currency | String |
| type | `CREDIT` \| `DEBIT` |
| amount | Number |
| source | String (`DAILY_STREAK`) |
| referenceId | String (StreakClaim `_id`) |
| streakDay | Number |
| balanceBefore / balanceAfter | Number |
| status | `SUCCESS` \| `FAILED` |

## AuditLog
| field | type |
|---|---|
| userId | ObjectId, nullable |
| event | enum: `STREAK_CLAIM_REQUEST`, `STREAK_CLAIM_SUCCESS`, `STREAK_CLAIM_REJECTED`, `STREAK_RESET`, `DUPLICATE_CLAIM`, `INVALID_CLAIM`, `AUTH_LOGIN`, `AUTH_REGISTER` |
| meta | Mixed |

## Traceability

For any successful claim you can always walk:
```
StreakClaim → rewardId → StreakReward
StreakClaim → transactionId → WalletTransaction → balanceBefore/After
```
which is what `docs/TESTING.md`'s "Database Integrity" check relies on.
