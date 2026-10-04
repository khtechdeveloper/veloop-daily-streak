const WalletTransaction = require("../models/WalletTransaction");
const { generateTransactionId } = require("../utils/idGenerator");

async function recordTransaction(
  { userId, currency, amount, streakDay, referenceId, balanceBefore, balanceAfter },
  session
) {
  const transactionId = generateTransactionId();
  const [txn] = await WalletTransaction.create(
    [
      {
        transactionId,
        userId,
        currency,
        type: "CREDIT",
        amount,
        source: "DAILY_STREAK",
        referenceId,
        streakDay,
        balanceBefore,
        balanceAfter,
        status: "SUCCESS",
      },
    ],
    { session }
  );
  return txn;
}

module.exports = { recordTransaction };
