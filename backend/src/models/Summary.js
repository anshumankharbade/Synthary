const mongoose = require("mongoose");

// NOTE: no `user` field yet — that gets added in Phase 2 once JWT auth
// is in place, so the dashboard can scope history per account.
const summarySchema = new mongoose.Schema(
  {
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
