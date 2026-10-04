const mongoose = require("mongoose");

/**
 * Each 7-day attempt is a "cycle". A user has at most one ACTIVE cycle at a
 * time. Missing the claim window closes the cycle as MISSED and a fresh one
 * is opened - this is what "resetting the streak" actually means under the
 * hood, without ever mutating a single "currentStreak" integer the client
 * could race against.
 */
const streakCycleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cycleNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "MISSED"],
      default: "ACTIVE",
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

streakCycleSchema.index({ userId: 1, status: 1 });
streakCycleSchema.index({ userId: 1, cycleNumber: 1 }, { unique: true });

module.exports = mongoose.model("StreakCycle", streakCycleSchema);
