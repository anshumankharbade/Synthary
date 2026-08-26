const mongoose = require("mongoose");

// Every summary now belongs to the user who created it — /api/summarize
// is gated behind requireAuth, so this is always populated on write.
const summarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    videoId: { type: String, required: true, index: true },
    videoUrl: { type: String, required: true },
    title: { type: String, default: null },
    thumbnailUrl: { type: String, default: null },

    // Kept in full (not just the summary) because Phase 2's
    // "Chat with the Content" feature re-sends this transcript to the
    // model alongside follow-up questions.
    transcript: { type: String, required: true },

    summary: { type: String, required: true },
    bulletPoints: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Summary", summarySchema);
