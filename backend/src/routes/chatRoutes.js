const express = require("express");
const { getMessages, postMessage } = require("../controllers/chatController");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// GET /api/summaries/:id/chat
router.get("/summaries/:id/chat", requireAuth, getMessages);

// POST /api/summaries/:id/chat
router.post("/summaries/:id/chat", requireAuth, postMessage);

module.exports = router;
