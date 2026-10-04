const mongoose = require("mongoose");
const StreakCycle = require("../models/StreakCycle");
const StreakClaim = require("../models/StreakClaim");
const AuditLog = require("../models/AuditLog");
const streakConfig = require("../config/streakConfig");
const rewardService = require("./reward.service");
const walletService = require("./wallet.service");
const transactionService = require("./transaction.service");
const ApiError = require("../utils/ApiError");

const HOUR_MS = 60 * 60 * 1000;

async function logAudit(userId, event, meta = {}) {
  try {
    await AuditLog.create({ userId, event, meta });
  } catch (e) {
    // Auditing must never break the main flow.
    console.error("[audit] failed to write audit log", e.message);
  }
}

/** Finds the user's ACTIVE cycle, creating cycle #1 if this is their first visit. */
async function getOrCreateActiveCycle(userId, session = null) {
  let cycle = await StreakCycle.findOne({ userId, status: "ACTIVE" }).session(session);
  if (!cycle) {
    const lastCycle = await StreakCycle.findOne({ userId }).sort({ cycleNumber: -1 }).session(session);
    const nextCycleNumber = lastCycle ? lastCycle.cycleNumber + 1 : 1;
    const created = await StreakCycle.create(
      [{ userId, cycleNumber: nextCycleNumber, status: "ACTIVE", startedAt: new Date() }],
      { session }
    );
    cycle = created[0];
  }
  return cycle;
}

/**
 * The single source of truth for "where is this user right now". Everything
 * else (GET /status, POST /claim) calls this and trusts nothing the client
 * sent. Returns a plain object describing server-computed reality.
 */
async function computeStreakState(userId, session = null) {
  const now = new Date();
  let cycle = await getOrCreateActiveCycle(userId, session);
  let claims = await StreakClaim.find({ userId, cycleId: cycle._id }).sort({ day: 1 }).session(session);

  const lastClaim = claims.length ? claims[claims.length - 1] : null;

  if (!lastClaim) {
    // Brand new cycle - Day 1 is immediately claimable.
    return {
      cycle,
      claims,
      currentDay: 1,
      currentStreak: 0,
      checkedIn: 0,
      dayStatus: "AVAILABLE",
      nextClaimAt: now,
      wasReset: false,
    };
  }

  if (lastClaim.day >= streakConfig.CYCLE_LENGTH) {
    // Cycle fully completed. Mark it and start a fresh one lazily.
    if (cycle.status === "ACTIVE") {
      cycle.status = "COMPLETED";
      cycle.completedAt = now;
      await cycle.save({ session });
    }
    const newCycle = await getOrCreateActiveCycle(userId, session); // creates cycle N+1
    return {
      cycle: newCycle,
      claims: [],
      currentDay: 1,
      currentStreak: 0,
      checkedIn: 0,
      dayStatus: "AVAILABLE",
      nextClaimAt: now,
      wasReset: false,
      cycleCompleted: true,
    };
  }

  const nextClaimAt = new Date(lastClaim.claimedAt.getTime() + streakConfig.CLAIM_INTERVAL_HOURS * HOUR_MS);
  const missedDeadline = new Date(nextClaimAt.getTime() + streakConfig.MISSED_GRACE_HOURS * HOUR_MS);

  if (now > missedDeadline) {
    // Missed the window entirely -> close this cycle as MISSED and reset.
    cycle.status = "MISSED";
    cycle.completedAt = now;
    await cycle.save({ session });
    await logAudit(userId, "STREAK_RESET", { cycleId: cycle._id, lastClaimedDay: lastClaim.day });

    const newCycle = await getOrCreateActiveCycle(userId, session);
    return {
      cycle: newCycle,
      claims: [],
      currentDay: 1,
      currentStreak: 0,
      checkedIn: 0,
      dayStatus: "AVAILABLE",
      nextClaimAt: now,
      wasReset: true,
    };
  }

  if (now < nextClaimAt) {
    // Still locked, waiting for the 24h window.
    return {
      cycle,
      claims,
      currentDay: lastClaim.day + 1,
      currentStreak: lastClaim.day,
      checkedIn: claims.length,
      dayStatus: "LOCKED",
      nextClaimAt,
      wasReset: false,
    };
  }

  // Within the claim window and not missed -> today's reward is available.
  return {
    cycle,
    claims,
    currentDay: lastClaim.day + 1,
    currentStreak: lastClaim.day,
    checkedIn: claims.length,
    dayStatus: "AVAILABLE",
    nextClaimAt,
    wasReset: false,
  };
}

/** Builds the full per-day card list (1..CYCLE_LENGTH) with backend-decided states. */
async function buildDayCards(userId, state) {
  const rewards = await rewardService.getAllRewards();
  const claimedDays = new Set(state.claims.map((c) => c.day));

  return rewards.map((reward) => {
    let status;
    if (claimedDays.has(reward.day)) {
      status = "CLAIMED";
    } else if (reward.day === state.currentDay) {
      status = state.dayStatus; // AVAILABLE or LOCKED (today's slot)
    } else if (reward.day < state.currentDay) {
      status = "MISSED"; // shouldn't normally happen given sequential claiming, but defensive
    } else {
      status = "LOCKED";
    }

    return {
      day: reward.day,
      status,
      isToday: reward.day === state.currentDay,
      nextClaimAt: reward.day === state.currentDay && status === "LOCKED" ? state.nextClaimAt : null,
      reward: {
        rewardType: reward.rewardType,
        currency: reward.currency,
        amount: reward.amount,
        title: reward.title,
        subtitle: reward.subtitle,
        assetType: reward.assetType,
      },
    };
  });
}

async function getStatusPayload(userId) {
  const state = await computeStreakState(userId);
  const totalRewards = await rewardService.getTotalRewards();
  const nextReward = await rewardService.getRewardForDay(
    Math.min(state.currentDay, streakConfig.CYCLE_LENGTH)
  );
  const rewards = await buildDayCards(userId, state);

  return {
    success: true,
    serverTime: new Date().toISOString(),
    streak: {
      currentStreak: state.currentStreak,
      currentDay: state.currentDay,
      checkedIn: state.checkedIn,
      totalRewards,
      status: state.dayStatus, // AVAILABLE | LOCKED
      wasReset: !!state.wasReset,
      nextClaimAt: state.dayStatus === "LOCKED" ? state.nextClaimAt.toISOString() : null,
    },
    nextReward: nextReward
      ? {
          day: nextReward.day,
          amount: nextReward.amount,
          currency: nextReward.currency,
          rewardType: nextReward.rewardType,
        }
      : null,
    rewards,
  };
}

/**
 * The claim endpoint's brain. Everything the client sends (day, reward,
 * amount, currency, userId) is IGNORED for business decisions - only
 * `req.user.id` (from the verified JWT) is trusted for identity, and the
 * server independently recomputes which day is actually eligible.
 *
 * Concurrency & idempotency: relies on the unique (userId, cycleId, day)
 * index on StreakClaim. A session + transaction batches the claim insert,
 * the reward credit and the wallet transaction into one atomic unit; if two
 * requests race, the loser's insert throws E11000 and is treated as an
 * "already claimed" response rather than a duplicate reward.
 */
async function claimDay(userId) {
  await logAudit(userId, "STREAK_CLAIM_REQUEST", {});

  const session = await mongoose.startSession();
  try {
    let resultPayload;

    await session.withTransaction(async () => {
      const state = await computeStreakState(userId, session);

      if (state.dayStatus !== "AVAILABLE") {
        await logAudit(userId, "STREAK_CLAIM_REJECTED", { reason: "LOCKED", day: state.currentDay });
        throw new ApiError(409, "LOCKED", "Your next reward is not available yet.");
      }

      const day = state.currentDay;
      const reward = await rewardService.getRewardForDay(day);
      if (!reward) {
        throw new ApiError(500, "REWARD_CONFIG_MISSING", "Unable to process your reward. Please try again.");
      }

      // Insert the claim FIRST inside the transaction. The unique index does
      // the real anti-duplicate / anti-concurrency enforcement here.
      let claimDoc;
      try {
        const created = await StreakClaim.create(
          [
            {
              userId,
              cycleId: state.cycle._id,
              day,
              rewardId: reward._id,
              status: "SUCCESS",
              claimedAt: new Date(),
              transactionId: "PENDING", // filled in right after
            },
          ],
          { session }
        );
        claimDoc = created[0];
      } catch (err) {
        if (err && err.code === 11000) {
          await logAudit(userId, "DUPLICATE_CLAIM", { day });
          throw new ApiError(409, "ALREADY_CLAIMED", "This reward has already been claimed.");
        }
        throw err;
      }

      const { balanceBefore, balanceAfter } = await walletService.creditWallet(
        userId,
        reward.currency,
        reward.amount,
        session
      );

      const txn = await transactionService.recordTransaction(
        {
          userId,
          currency: reward.currency,
          amount: reward.amount,
          streakDay: day,
          referenceId: String(claimDoc._id),
          balanceBefore,
          balanceAfter,
        },
        session
      );

      claimDoc.transactionId = txn.transactionId;
      await claimDoc.save({ session });

      if (day >= streakConfig.CYCLE_LENGTH) {
        state.cycle.status = "COMPLETED";
        state.cycle.completedAt = new Date();
        await state.cycle.save({ session });
      }

      await logAudit(userId, "STREAK_CLAIM_SUCCESS", { day, transactionId: txn.transactionId });

      resultPayload = { day, reward, transaction: txn };
    });

    // Return the fresh, fully recomputed status (never hand-assembled from
    // the request) so the frontend re-renders from truth, not assumptions.
    return getStatusPayload(userId);
  } finally {
    session.endSession();
  }
}

async function getHistory(userId) {
  const claims = await StreakClaim.find({ userId }).sort({ claimedAt: -1 }).limit(100).lean();
  return claims.map((c) => ({
    day: c.day,
    claimedAt: c.claimedAt,
    transactionId: c.transactionId,
    status: c.status,
    cycleId: c.cycleId,
  }));
}

module.exports = {
  computeStreakState,
  getStatusPayload,
  claimDay,
  getHistory,
};
