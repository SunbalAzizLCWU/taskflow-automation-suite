// Wraps async route handlers so thrown errors are forwarded to Express'
// error middleware instead of crashing the process or hanging the request.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
