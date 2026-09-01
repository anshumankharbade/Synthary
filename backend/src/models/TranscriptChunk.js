const mongoose = require("mongoose");

// One document per transcript chunk. `embedding` holds the 3072-dim
// vector from Gemini's embedding model — Atlas Vector Search indexes
// this field directly (see the vector search index setup in the README).
const transcriptChunkSchema = new mongoose.Schema({
  summaryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Summary",
    required: true,
    index: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  chunkIndex: { type: Number, required: true },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
});

module.exports = mongoose.model("TranscriptChunk", transcriptChunkSchema);
