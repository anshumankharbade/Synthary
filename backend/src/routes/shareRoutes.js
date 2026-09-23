const express = require("express");
const {
  createShareLink,
  deleteShareLink,
  getSharedSummary,
} = require("../controllers/shareController");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Owner-only — creating/revoking a share link requires being signed in
// and owning the summary.
router.post("/summaries/:id/share", requireAuth, createShareLink);
router.delete("/summaries/:id/share", requireAuth, deleteShareLink);

// Public — anyone with the token, no auth required.
router.get("/shared/:token", getSharedSummary);

module.exports = router;
