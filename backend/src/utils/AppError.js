// An "expected" error with a status code and a message that's safe to
// show the user directly (e.g. "invalid URL"). Anything that is NOT an
// AppError is treated as a bug and gets a generic message instead, so
// internals never leak to the client. See middleware/errorHandler.js.
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

module.exports = AppError;
