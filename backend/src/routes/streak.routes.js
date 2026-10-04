const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth.middleware");
const { claimLimiter } = require("../middleware/rateLimit.middleware");
const { sanitizeClaimBody } = require("../validators/streak.validator");
const { getStreak, getStatus, claim, getHistory, getWallet } = require("../controllers/streak.controller");

// All daily-streak routes require a valid JWT - see spec #43.
router.use(requireAuth);

router.get("/", getStreak);
router.get("/status", getStatus);
router.get("/history", getHistory);
router.get("/wallet", getWallet);
router.post("/claim", claimLimiter, sanitizeClaimBody, claim);

module.exports = router;
