const express = require("express");
const { uploadAndSummarize } = require("../controllers/uploadController");
const requireAuth = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// POST /api/upload  (multipart/form-data, field name "file")
router.post("/upload", requireAuth, upload.single("file"), uploadAndSummarize);

module.exports = router;
