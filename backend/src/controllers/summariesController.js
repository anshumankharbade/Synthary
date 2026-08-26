const mongoose = require("mongoose");

const Summary = require("../models/Summary");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const requireDb = require("../utils/requireDb");

// Same field shape the client already knows from POST /api/summarize
// (id, not _id; no userId/__v leaked to the client), plus createdAt
// which the dashboard needs to sort/display history.
function toClientShape(doc, { includeTranscript = false } = {}) {
  return {
    id: doc._id.toString(),
    videoId: doc.videoId,
    videoUrl: doc.videoUrl,
    title: doc.title,
    thumbnailUrl: doc.thumbnailUrl,
    summary: doc.summary,
    bulletPoints: doc.bulletPoints,
    createdAt: doc.createdAt,
    ...(includeTranscript ? { transcript: doc.transcript } : {}),
  };
}

// GET /api/summaries — the signed-in user's history, newest first.
const listSummaries = asyncHandler(async (req, res) => {
  requireDb();

  const summaries = await Summary.find({ userId: req.userId })
    .select("-transcript")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: summaries.map((doc) => toClientShape(doc)) });
});

// GET /api/summaries/:id — one summary, only if it belongs to the caller.
const getSummary = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Summary not found.", 404);
  }

  requireDb();

  const summary = await Summary.findOne({ _id: req.params.id, userId: req.userId });

  // Same 404 whether the id doesn't exist or belongs to someone else —
  // don't reveal which, to avoid leaking that a given id is in use.
  if (!summary) {
    throw new AppError("Summary not found.", 404);
  }

  res.json({ success: true, data: toClientShape(summary, { includeTranscript: true }) });
});

// DELETE /api/summaries/:id — only deletes if it belongs to the caller.
const deleteSummary = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Summary not found.", 404);
  }

  requireDb();

  // findOneAndDelete scopes the delete to this user in the same query
  // that finds it, so there's no separate ownership check to forget.
  const deleted = await Summary.findOneAndDelete({ _id: req.params.id, userId: req.userId });

  if (!deleted) {
    throw new AppError("Summary not found.", 404);
  }

  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = { listSummaries, getSummary, deleteSummary };
