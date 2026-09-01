const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    summaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Summary",
      required: true,
      index: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "model"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
