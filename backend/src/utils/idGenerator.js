const crypto = require("crypto");

function generateTransactionId() {
  return `STREAK-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

module.exports = { generateTransactionId };
