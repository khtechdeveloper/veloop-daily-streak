// Wraps an async route/controller so thrown errors reach Express's error
// middleware instead of crashing the process or hanging the request.
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
