const bcrypt = require("bcryptjs");

const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const requireDb = require("../utils/requireDb");
const { signToken } = require("../utils/jwt");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signup = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are both required.", 400);
  }
  if (!EMAIL_RE.test(email)) {
    throw new AppError("That doesn't look like a valid email address.", 400);
  }
  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters.", 400);
  }

  requireDb();

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError("An account with that email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email: normalizedEmail, passwordHash });
  const token = signToken(user._id.toString());

  res.status(201).json({ success: true, data: { token, email: user.email } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are both required.", 400);
  }

  requireDb();

  // Same message for "no such user" and "wrong password" on purpose —
  // don't reveal which one it was to an unauthenticated caller.
  const invalid = () => new AppError("Invalid email or password.", 401);

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw invalid();

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw invalid();

  const token = signToken(user._id.toString());
  res.json({ success: true, data: { token, email: user.email } });
});

const me = asyncHandler(async (req, res) => {
  requireDb();

  const user = await User.findById(req.userId).select("email createdAt");
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  res.json({ success: true, data: { email: user.email, createdAt: user.createdAt } });
});

module.exports = { signup, login, me };
