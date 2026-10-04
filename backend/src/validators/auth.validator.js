const ApiError = require("../utils/ApiError");

function validateRegister(req, res, next) {
  const { name, email, password } = req.body || {};
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return next(new ApiError(400, "VALIDATION_ERROR", "Please provide a valid name."));
  }
  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return next(new ApiError(400, "VALIDATION_ERROR", "Please provide a valid email."));
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return next(new ApiError(400, "VALIDATION_ERROR", "Password must be at least 6 characters."));
  }
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return next(new ApiError(400, "VALIDATION_ERROR", "Email and password are required."));
  }
  next();
}

module.exports = { validateRegister, validateLogin };
