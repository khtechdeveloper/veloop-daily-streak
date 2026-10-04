const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "EMAIL_IN_USE", "An account with this email already exists.");
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

  await AuditLog.create({ userId: user._id, event: "AUTH_REGISTER", meta: {} });

  const token = signToken(user._id);
  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  await AuditLog.create({ userId: user._id, event: "AUTH_LOGIN", meta: {} });

  const token = signToken(user._id);
  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("name email createdAt");
  res.json({ success: true, user });
});

module.exports = { register, login, me };
