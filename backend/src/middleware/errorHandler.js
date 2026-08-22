// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Only "operational" (expected) errors get their message shown to the
  // user. Anything else is a bug — log it, but don't leak internals.
  if (!err.isOperational) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: err.isOperational ? err.message : "Something went wrong on our end. Please try again.",
  });
}

module.exports = errorHandler;
