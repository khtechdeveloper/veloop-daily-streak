/**
 * Central error handler. Only ApiError messages are ever shown to the user
 * (spec #92) - raw Mongo/Axios/Cast errors are logged server-side and
 * replaced with a generic message.
 */
module.exports = function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err && err.isApiError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  console.error("[unhandled error]", err);

  return res.status(500).json({
    success: false,
    code: "SERVER_ERROR",
    message: "Unable to process your reward. Please try again.",
  });
};
