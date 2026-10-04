const asyncHandler = require("../utils/asyncHandler");
const streakService = require("../services/streak.service");
const walletService = require("../services/wallet.service");

const getStreak = asyncHandler(async (req, res) => {
  const payload = await streakService.getStatusPayload(req.user.id);
  res.json(payload);
});

// Alias kept separate from getStreak so the frontend can poll a lightweight
// "status" check (e.g. when a countdown hits zero) without over-fetching -
// same underlying computation either way, always server-derived.
const getStatus = asyncHandler(async (req, res) => {
  const payload = await streakService.getStatusPayload(req.user.id);
  res.json(payload);
});

const claim = asyncHandler(async (req, res) => {
  const payload = await streakService.claimDay(req.user.id);
  res.json(payload);
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await streakService.getHistory(req.user.id);
  res.json({ success: true, history });
});

const getWallet = asyncHandler(async (req, res) => {
  const wallet = await walletService.getOrCreateWallet(req.user.id);
  res.json({ success: true, balances: Object.fromEntries(wallet.balances) });
});

module.exports = { getStreak, getStatus, claim, getHistory, getWallet };
