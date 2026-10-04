const mongoose = require("mongoose");

/**
 * One wallet per user. Balances are keyed by currency so we can support
 * point-style currencies (VES) alongside monetary gift-card values (INR)
 * without inventing a fake shared unit.
 */
const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balances: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

walletSchema.methods.getBalance = function (currency) {
  return this.balances.get(currency) || 0;
};

module.exports = mongoose.model("Wallet", walletSchema);
