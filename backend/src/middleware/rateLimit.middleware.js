const rateLimit = require("express-rate-limit");

// Generous general limit, plus a tighter one specifically on the claim
// endpoint since that's the security-critical, double-click-prone action.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const claimLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many attempts. Please slow down and try again.",
  },
});

module.exports = { generalLimiter, claimLimiter };
