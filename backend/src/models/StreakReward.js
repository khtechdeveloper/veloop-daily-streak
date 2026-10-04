const mongoose = require("mongoose");

/**
 * StreakReward is the ONLY authority on what each day of the cycle is worth.
 * The React frontend must never hardcode these values - it renders whatever
 * this collection (via the API) says.
 */
const streakRewardSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, min: 1 }, // 1..CYCLE_LENGTH
    rewardType: { type: String, enum: ["VES", "GIFT_CARD"], required: true },
    currency: { type: String, enum: ["VES", "INR"], required: true },
    amount: { type: Number, required: true, min: 0 },
    title: { type: String, required: true }, // "Daily Reward" / "Ultimate Reward"
    subtitle: { type: String, default: "" }, // e.g. "Amazon Gift Card"
    assetType: { type: String, enum: ["coin", "gift-card", "crown"], default: "coin" },
    badge: { type: String, default: null }, // "Today" / "VIP" handled client-side from status, not here
    active: { type: Boolean, default: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

streakRewardSchema.index({ day: 1 }, { unique: true });

module.exports = mongoose.model("StreakReward", streakRewardSchema);
