const multer = require("multer");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Multer errors (file too large, wrong field name) arrive as
  // MulterError instances, not AppError — they're just as "expected" and
  // safe to show directly, so treat them the same way isOperational does.
  if (err instanceof multer.MulterError) {
    const statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(statusCode).json({ success: false, error: err.message });
  }

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
