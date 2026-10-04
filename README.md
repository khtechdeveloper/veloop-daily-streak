# VELoop Rewards — Daily Streak System

A full-stack MERN implementation of a backend-authoritative Daily Streak & Rewards feature, built to the VELoop Rewards internship spec.

**The fundamental rule this whole codebase follows: React controls the presentation. The backend controls the streak.**

## Architecture

```
React (Vite) Frontend
        ↓
Express.js REST API
        ↓
Node.js
        ↓
MongoDB (Mongoose)
```

Every value that matters for security or fairness — current streak, current day, claim eligibility, reward amount/type, countdown timestamps, missed-day detection, streak reset, wallet balance — is computed and validated **only** on the backend. The frontend never holds any of this in local state as the source of truth; it always renders whatever the API just returned and re-fetches after every claim.

## Repository layout

```
veloop-daily-streak/
├── backend/            Express + MongoDB API
├── frontend/           React (Vite) + Bootstrap + CSS Modules
├── docs/               API, database, security & testing docs
├── postman/            Postman collection
└── README.md           (this file)
```

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI (Atlas) and JWT_SECRET
npm install
npm run seed               # loads the 7-day reward configuration
npm run dev                # starts on http://localhost:5000
```

> **MongoDB Atlas note:** claims run inside a Mongo session transaction (`session.withTransaction`), which requires a replica set. A standard Atlas free-tier cluster is already a replica set, so this works out of the box; a bare standalone `mongod` will not.

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # starts on http://localhost:5173
```

Register an account on the login screen, then you'll land on `/daily-streak`.

## Database schema

See [`docs/DATABASE.md`](docs/DATABASE.md) for full model details. In short:

| Model | Purpose |
|---|---|
| `User` | Auth identity |
| `Wallet` | Per-user balances by currency (VES points, INR gift-card value) |
| `StreakReward` | The 7-day reward configuration (never hardcoded in React) |
| `StreakCycle` | One 7-day attempt; ACTIVE / COMPLETED / MISSED |
| `StreakClaim` | One doc per successful claim; unique `(userId, cycleId, day)` index is the anti-duplicate/anti-concurrency guarantee |
| `WalletTransaction` | Immutable ledger entry for every credit |
| `AuditLog` | Security event trail |

## Streak & timer logic

There is no stored `currentStreak` integer that could be edited directly. Instead, `backend/src/services/streak.service.js` **derives** the user's state on every request from:

1. The user's `ACTIVE` `StreakCycle`
2. Every `StreakClaim` in that cycle
3. The current server time (`Date.now()`), never a client-supplied time

From that it computes `currentDay`, `currentStreak`, lock/available status, `nextClaimAt`, and whether the streak has been missed and needs resetting — see `docs/API_DOCUMENTATION.md` for the exact response shape.

The frontend's countdown (`useCountdown` hook) is cosmetic: it just counts down to the server-issued `nextClaimAt` ISO timestamp. When it hits zero, it triggers a fresh `GET /daily-streak/status` call rather than assuming the day unlocked — so a manipulated device clock cannot unlock a claim early.

## Security measures

Full detail in [`docs/SECURITY.md`](docs/SECURITY.md). Highlights:

- JWT auth on every streak route; user identity always comes from the verified token, never `req.body.userId`.
- The claim endpoint (`POST /api/daily-streak/claim`) **discards** any `day`, `reward`, `amount`, `currency`, or `streak` field the client sends (see `sanitizeClaimBody` middleware) and derives everything server-side.
- Duplicate/concurrent claims are blocked at the database level via a unique compound index on `StreakClaim(userId, cycleId, day)`, combined with a Mongo session transaction — the loser of a race gets a clean "already claimed" response, not a crash or a double reward.
- Wallet credits use atomic `$inc` updates.
- All Mongo/Axios/internal errors are caught by a central error middleware and replaced with safe, generic messages before reaching the client.
- Rate limiting on the claim endpoint as a defense-in-depth layer (not the primary anti-cheat mechanism — the transaction + unique index is).

## Testing

See [`docs/TESTING.md`](docs/TESTING.md) for the full test matrix (normal claim, duplicate claim, concurrent claim, locked day, fake day/reward/streak/user, timer manipulation, missed day, reset, refresh, multiple tabs) and how each was verified.

## Known limitations / what's left as a placeholder

- **CPA/ad integration** is a polished placeholder (`CpaDemo` component) per spec §7/§68 — no real ad network is wired in, by design.
- **Design assets**: the supplied VELoop artwork (coins, gift box, crown illustrations) isn't embedded in this codebase since only a PDF description was available — `lucide-react` icons stand in for now. Drop the real assets from the project's Drive folder into `frontend/src/assets/` and swap them into `RewardCard.jsx` / `UltimateReward.jsx`.
- **Asset animation** (Google Flow / After Effects subtle motion on the Day 4/Day 7 art) is not implemented — it depends on the real static assets above.
- **Amazon gift card fulfillment** is modeled as a wallet-ledger credit in INR value only; actual gift-card code issuance is out of scope and would be a separate fulfillment service.
- Tablet breakpoints (768–1024px) get a 3-column grid via CSS; a bespoke tablet layout beyond that wasn't built out further.

## Deployment

- **Frontend** → Vercel/Netlify (`npm run build`, publish `frontend/dist`)
- **Backend** → Render/Railway (`npm start`, set the env vars from `.env.example`)
- **Database** → MongoDB Atlas (your own dev cluster — never share production credentials, per spec §105)
