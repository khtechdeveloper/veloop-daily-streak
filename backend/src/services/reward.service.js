const StreakReward = require("../models/StreakReward");
const streakConfig = require("../config/streakConfig");

let rewardCache = null;
let rewardCacheAt = 0;
const CACHE_TTL_MS = 30_000;

/** All active rewards, keyed by day. Cached briefly since this data changes rarely. */
async function getAllRewards() {
  const now = Date.now();
  if (rewardCache && now - rewardCacheAt < CACHE_TTL_MS) return rewardCache;

  const rewards = await StreakReward.find({ active: true }).sort({ day: 1 }).lean();
  rewardCache = rewards;
  rewardCacheAt = now;
  return rewards;
}

async function getRewardForDay(day) {
  const rewards = await getAllRewards();
  const reward = rewards.find((r) => r.day === day);
  if (!reward) return null;
  return reward;
}

function invalidateCache() {
  rewardCache = null;
}

async function getTotalRewards() {
  const rewards = await getAllRewards();
  return rewards.length || streakConfig.CYCLE_LENGTH;
}

module.exports = { getAllRewards, getRewardForDay, invalidateCache, getTotalRewards };
