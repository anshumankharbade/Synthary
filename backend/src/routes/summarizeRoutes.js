const express = require("express");
const { summarizeVideo } = require("../controllers/summarizeController");

const router = express.Router();

// POST /api/summarize  { url: string }
router.post("/summarize", summarizeVideo);

// Phase 2 adds GET /api/summaries (history) once JWT auth exists to
// scope results per user — intentionally left out for now.

module.exports = router;
