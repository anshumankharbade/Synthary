const express = require("express");
const { summarizeVideo } = require("../controllers/summarizeController");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// POST /api/summarize  { url: string }  — requires a signed-in user now
// that summaries are saved against an account.
router.post("/summarize", requireAuth, summarizeVideo);

module.exports = router;
