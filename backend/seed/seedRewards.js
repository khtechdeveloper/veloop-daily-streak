/**
 * Seeds the StreakReward collection with the exact 7-day reward table from
 * the VELoop design. Run with: npm run seed
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const StreakReward = require("../src/models/StreakReward");

const REWARDS = [
  { day: 1, rewardType: "VES", currency: "VES", amount: 5, title: "Daily Reward", subtitle: "5 VEs", assetType: "coin" },
  { day: 2, rewardType: "VES", currency: "VES", amount: 10, title: "Daily Reward", subtitle: "10 VEs", assetType: "coin" },
  { day: 3, rewardType: "VES", currency: "VES", amount: 15, title: "Daily Reward", subtitle: "15 VEs", assetType: "coin" },
  { day: 4, rewardType: "GIFT_CARD", currency: "INR", amount: 1, title: "Daily Reward", subtitle: "Amazon Gift Card", assetType: "gift-card" },
  { day: 5, rewardType: "GIFT_CARD", currency: "INR", amount: 2, title: "Daily Reward", subtitle: "Amazon Gift Card", assetType: "gift-card" },
  { day: 6, rewardType: "VES", currency: "VES", amount: 30, title: "Daily Reward", subtitle: "30 VEs", assetType: "coin" },
  { day: 7, rewardType: "GIFT_CARD", currency: "INR", amount: 5, title: "Ultimate Reward", subtitle: "Amazon Gift Card", assetType: "crown" },
];

(async () => {
  try {
    await connectDB();

    for (const reward of REWARDS) {
      await StreakReward.findOneAndUpdate(
        { day: reward.day },
        { ...reward, active: true },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[seed] upserted Day ${reward.day} reward`);
    }

    console.log("[seed] done.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("[seed] failed:", err);
    process.exit(1);
  }
})();
