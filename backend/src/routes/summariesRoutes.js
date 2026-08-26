const express = require("express");
const { listSummaries, getSummary, deleteSummary } = require("../controllers/summariesController");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// GET /api/summaries
router.get("/summaries", requireAuth, listSummaries);

// GET /api/summaries/:id
router.get("/summaries/:id", requireAuth, getSummary);

// DELETE /api/summaries/:id
router.delete("/summaries/:id", requireAuth, deleteSummary);

module.exports = router;
