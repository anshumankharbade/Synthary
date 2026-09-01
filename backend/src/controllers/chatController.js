const mongoose = require("mongoose");

const Summary = require("../models/Summary");
const ChatMessage = require("../models/ChatMessage");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const requireDb = require("../utils/requireDb");
const { answerQuestion } = require("../services/chatService");

function toClientMessage(doc) {
  return {
    id: doc._id.toString(),
    role: doc.role,
    content: doc.content,
    createdAt: doc.createdAt,
  };
}

// GET /api/summaries/:id/chat
const getMessages = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Summary not found.", 404);
  }

  requireDb();

  const summary = await Summary.findOne({ _id: req.params.id, userId: req.userId });
  if (!summary) {
    throw new AppError("Summary not found.", 404);
  }

  const messages = await ChatMessage.find({ summaryId: req.params.id }).sort({ createdAt: 1 });
  res.json({ success: true, data: messages.map(toClientMessage) });
});

// POST /api/summaries/:id/chat  { message: string }
const postMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string" || !message.trim()) {
    throw new AppError("A message is required.", 400);
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Summary not found.", 404);
  }

  requireDb();

  const summary = await Summary.findOne({ _id: req.params.id, userId: req.userId });
  if (!summary) {
    throw new AppError("Summary not found.", 404);
  }

  const priorMessages = await ChatMessage.find({ summaryId: req.params.id }).sort({
    createdAt: 1,
  });
  const history = priorMessages.map((m) => ({ role: m.role, content: m.content }));

  const answer = await answerQuestion({
    summaryId: req.params.id,
    userId: req.userId,
    transcript: summary.transcript,
    question: message.trim(),
    history,
  });

  const [userMsg, modelMsg] = await ChatMessage.create([
    { summaryId: req.params.id, userId: req.userId, role: "user", content: message.trim() },
    { summaryId: req.params.id, userId: req.userId, role: "model", content: answer },
  ]);

  res.status(201).json({
    success: true,
    data: {
      userMessage: toClientMessage(userMsg),
      assistantMessage: toClientMessage(modelMsg),
    },
  });
});

module.exports = { getMessages, postMessage };
