const AppError = require("../utils/AppError");
const { verifyToken } = require("../utils/jwt");

// Verifying a JWT is stateless (no DB needed) — only signup/login/me
// touch Mongo directly. This middleware just checks the signature.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new AppError("You need to be signed in to do that.", 401));
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch (err) {
    next(new AppError("Your session has expired or is invalid. Please sign in again.", 401));
  }
}

module.exports = requireAuth;
