const crypto = require("crypto");
const mongoose = require("mongoose");

const Summary = require("../models/Summary");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const requireDb = require("../utils/requireDb");

function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

// POST /api/summaries/:id/share (owner only)
// Idempotent: returns the existing token if already shared, rather than
// minting a new one and silently invalidating a link someone may have
// already been given.
const createShareLink = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Summary not found.", 404);
  }

  requireDb();

  const summary = await Summary.findOne({ _id: req.params.id, userId: req.userId });
  if (!summary) {
    throw new AppError("Summary not found.", 404);
  }

  if (!summary.shareToken) {
    summary.shareToken = generateToken();
    await summary.save();
  }

  res.status(201).json({ success: true, data: { shareToken: summary.shareToken } });
});

// DELETE /api/summaries/:id/share (owner only) — revokes the link.
const deleteShareLink = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Summary not found.", 404);
  }

  requireDb();

  const summary = await Summary.findOne({ _id: req.params.id, userId: req.userId });
  if (!summary) {
    throw new AppError("Summary not found.", 404);
  }

  summary.shareToken = null;
  await summary.save();

  res.json({ success: true, data: { shared: false } });
});

// GET /api/shared/:token — public, no auth. Only exposes what a viewer
// needs to read the summary: never the transcript, never who owns it.
const getSharedSummary = asyncHandler(async (req, res) => {
  requireDb();

  const summary = await Summary.findOne({ shareToken: req.params.token });
  if (!summary) {
    throw new AppError("This share link doesn't exist or is no longer active.", 404);
  }

  res.json({
    success: true,
    data: {
      sourceType: summary.sourceType,
      sourceFilename: summary.sourceFilename ?? null,
      videoId: summary.videoId,
      videoUrl: summary.videoUrl,
      title: summary.title,
      thumbnailUrl: summary.thumbnailUrl,
      summary: summary.summary,
      bulletPoints: summary.bulletPoints,
      createdAt: summary.createdAt,
    },
  });
});

module.exports = { createShareLink, deleteShareLink, getSharedSummary };
