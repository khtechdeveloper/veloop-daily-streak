const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

/**
 * The ONLY place user identity is established. Every downstream service call
 * uses req.user.id - never a userId pulled from req.body/req.query, which
 * would let User A act as User B (spec #44/#45/#100).
 */
module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "UNAUTHENTICATED", "Please log in to continue."));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    return next(new ApiError(401, "UNAUTHENTICATED", "Please log in to continue."));
  }
};
