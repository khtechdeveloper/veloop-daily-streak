/**
 * A controlled, user-safe error. Anything thrown as ApiError is shown to the
 * client verbatim (message + code); anything else (MongoServerError,
 * CastError, etc.) is caught by the error middleware and replaced with a
 * generic "server error" message so internals never leak (see spec #92).
 */
class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code; // machine-readable, e.g. "ALREADY_CLAIMED"
    this.isApiError = true;
  }
}

module.exports = ApiError;
