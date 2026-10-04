const Wallet = require("../models/Wallet");

async function getOrCreateWallet(userId, session = null) {
  let wallet = await Wallet.findOne({ userId }).session(session);
  if (!wallet) {
    const created = await Wallet.create([{ userId, balances: {} }], { session });
    wallet = created[0];
  }
  return wallet;
}

/**
 * Atomically credits a wallet and returns {balanceBefore, balanceAfter}.
 * Uses $inc so two concurrent credits can never clobber each other -
 * MongoDB serializes the increment at the document level.
 */
async function creditWallet(userId, currency, amount, session) {
  const wallet = await getOrCreateWallet(userId, session);
  const balanceBefore = wallet.getBalance(currency);

  const updated = await Wallet.findOneAndUpdate(
    { userId },
    { $inc: { [`balances.${currency}`]: amount } },
    { new: true, session }
  );

  const balanceAfter = updated.balances.get(currency) || 0;
  return { balanceBefore, balanceAfter };
}

module.exports = { getOrCreateWallet, creditWallet };
