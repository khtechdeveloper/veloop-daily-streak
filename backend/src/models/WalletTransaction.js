const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true }, // "STREAK-XXXXXXXX"
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    currency: { type: String, enum: ["VES", "INR"], required: true },
    type: { type: String, enum: ["CREDIT", "DEBIT"], default: "CREDIT" },
    amount: { type: Number, required: true },
    source: { type: String, default: "DAILY_STREAK" },
    referenceId: { type: String, required: true }, // links back to the StreakClaim
    streakDay: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    status: { type: String, enum: ["SUCCESS", "FAILED"], default: "SUCCESS" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
