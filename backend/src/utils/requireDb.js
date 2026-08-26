const mongoose = require("mongoose");
const AppError = require("./AppError");

// Auth (signup/login/me) and history need a real DB connection, unlike
// /api/summarize which degrades gracefully without one. Call this first
// in any handler that reads/writes Mongo directly.
function requireDb() {
  if (mongoose.connection.readyState !== 1) {
    throw new AppError(
      "The database isn't connected right now, so accounts and history aren't available. " +
        "Make sure MONGODB_URI is set on the server and try again shortly.",
      503
    );
  }
}

module.exports = requireDb;
