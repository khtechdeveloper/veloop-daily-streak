const mongoose = require("mongoose");

/**
 * One document per successfully claimed day. The unique compound index on
 * (userId, cycleId, day) is the database-level guarantee that:
 *   - the same day can never be claimed twice (duplicate-claim test)
 *   - two concurrent requests for the same day can only ever insert once
 *     (concurrent-claim test) - the loser gets a duplicate-key error (11000)
 *     which the service layer treats as "already claimed", not a crash.
 */
const streakClaimSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cycleId: { type: mongoose.Schema.Types.ObjectId, ref: "StreakCycle", required: true },
    day: { type: Number, required: true },
    rewardId: { type: mongoose.Schema.Types.ObjectId, ref: "StreakReward", required: true },
    status: { type: String, enum: ["SUCCESS"], default: "SUCCESS" },
    claimedAt: { type: Date, default: Date.now },
    transactionId: { type: String, required: true },
  },
  { timestamps: true }
);

streakClaimSchema.index({ userId: 1, cycleId: 1, day: 1 }, { unique: true });

module.exports = mongoose.model("StreakClaim", streakClaimSchema);
