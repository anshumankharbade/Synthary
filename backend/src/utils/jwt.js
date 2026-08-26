const jwt = require("jsonwebtoken");

const EXPIRES_IN = "7d";

function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set on the server.");
  }
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: EXPIRES_IN });
}

// Throws jsonwebtoken's own errors (TokenExpiredError, JsonWebTokenError)
// on invalid/expired tokens — callers should catch these.
function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set on the server.");
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
