const mongoose = require("mongoose");

// Every summary now belongs to the user who created it — /api/summarize
// is gated behind requireAuth, so this is always populated on write.
const summarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // "youtube" keeps videoId/videoUrl populated as before. "audio" and
    // "pdf" (uploaded files) leave those null and populate
    // sourceFilename instead — there's no external URL to link back to.
    sourceType: {
      type: String,
      enum: ["youtube", "audio", "pdf"],
      default: "youtube",
      required: true,
    },
    videoId: { type: String, default: null, index: true },
    videoUrl: { type: String, default: null },
    sourceFilename: { type: String, default: null },

    title: { type: String, default: null },
    thumbnailUrl: { type: String, default: null },

    // Kept in full (not just the summary) because Phase 2's
    // "Chat with the Content" feature re-sends this transcript to the
    // model alongside follow-up questions.
    transcript: { type: String, required: true },

    summary: { type: String, required: true },
    bulletPoints: { type: [String], default: [] },

    // Null until the owner explicitly shares this summary. A separate
    // random token (not the Mongo _id) so a public link can't be derived
    // from anything else, and can be revoked independently by clearing it.
    shareToken: { type: String, default: null, unique: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Summary", summarySchema);
