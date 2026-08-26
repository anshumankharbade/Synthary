const express = require("express");
const { signup, login, me } = require("../controllers/authController");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/signup  { email, password }
router.post("/signup", signup);

// POST /api/auth/login  { email, password }
router.post("/login", login);

// GET /api/auth/me  (Authorization: Bearer <token>)
router.get("/me", requireAuth, me);

module.exports = router;
