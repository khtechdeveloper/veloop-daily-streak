# API Documentation — VELoop Daily Streak

Base URL (local): `http://localhost:5000/api`

All `/daily-streak/*` routes require:
```
Authorization: Bearer <jwt>
```

---

## Auth

### POST `/auth/register`
```json
{ "name": "Kd", "email": "kd@example.com", "password": "secret123" }
```
**201**
```json
{ "success": true, "token": "<jwt>", "user": { "id": "...", "name": "Kd", "email": "kd@example.com" } }
```

### POST `/auth/login`
```json
{ "email": "kd@example.com", "password": "secret123" }
```
**200** — same shape as register.

### GET `/auth/me` *(auth required)*
Returns the authenticated user's profile.

---

## Daily Streak

### GET `/daily-streak`
Full status + per-day reward cards. Equivalent alias: `GET /daily-streak/status`.

**200**
```json
{
  "success": true,
  "serverTime": "2026-09-23T12:00:00.000Z",
  "streak": {
    "currentStreak": 1,
    "currentDay": 2,
    "checkedIn": 1,
    "totalRewards": 7,
    "status": "LOCKED",
    "wasReset": false,
    "nextClaimAt": "2026-09-24T12:00:00.000Z"
  },
  "nextReward": { "day": 2, "amount": 10, "currency": "VES", "rewardType": "VES" },
  "rewards": [
    {
      "day": 1,
      "status": "CLAIMED",
      "isToday": false,
      "nextClaimAt": null,
      "reward": { "rewardType": "VES", "currency": "VES", "amount": 5, "title": "Daily Reward", "subtitle": "5 VEs", "assetType": "coin" }
    },
    {
      "day": 2,
      "status": "LOCKED",
      "isToday": true,
      "nextClaimAt": "2026-09-24T12:00:00.000Z",
      "reward": { "rewardType": "VES", "currency": "VES", "amount": 10, "title": "Daily Reward", "subtitle": "10 VEs", "assetType": "coin" }
    }
  ]
}
```

`streak.status` is `AVAILABLE` or `LOCKED` for the *current* day slot. Individual `rewards[].status` is one of `LOCKED | AVAILABLE | TODAY-implied-by-isToday | CLAIMED | MISSED`.

### GET `/daily-streak/status`
Identical payload to the above — kept as a separate, lightweight-feeling endpoint for the frontend to call after a countdown reaches zero.

### POST `/daily-streak/claim`
Body is ignored (send `{}`). The server derives the eligible day, reward, and user entirely from the JWT and stored history.

**200 (success)** — same shape as `GET /daily-streak`, now reflecting the claim.

**409 `LOCKED`**
```json
{ "success": false, "code": "LOCKED", "message": "Your next reward is not available yet." }
```

**409 `ALREADY_CLAIMED`**
```json
{ "success": false, "code": "ALREADY_CLAIMED", "message": "This reward has already been claimed." }
```

**401 `UNAUTHENTICATED`**
```json
{ "success": false, "code": "UNAUTHENTICATED", "message": "Please log in to continue." }
```

**429 `RATE_LIMITED`** — too many claim attempts in a short window.

**500 `SERVER_ERROR`** — generic; internal error detail is never leaked (see SECURITY.md).

### GET `/daily-streak/history`
```json
{ "success": true, "history": [ { "day": 1, "claimedAt": "...", "transactionId": "STREAK-AB12CD34", "status": "SUCCESS", "cycleId": "..." } ] }
```

### GET `/daily-streak/wallet`
```json
{ "success": true, "balances": { "VES": 15, "INR": 3 } }
```

---

## Error shape (all endpoints)

```json
{ "success": false, "code": "MACHINE_READABLE_CODE", "message": "Human-readable, user-safe message." }
```
