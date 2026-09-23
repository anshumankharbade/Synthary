const path = require("path");

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { transcribeAudio, extractPdfText } = require("../services/fileProcessingService");
const { summarizeTranscript } = require("../services/aiService");
const Summary = require("../models/Summary");

function titleFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename));
  const cleaned = base.replace(/[_-]+/g, " ").trim();
  return cleaned || "Uploaded file";
}

const uploadAndSummarize = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No file was uploaded.", 400);
  }

  const { buffer, mimetype, originalname } = req.file;
  const sourceType = mimetype.startsWith("audio/") ? "audio" : "pdf";

  const transcript =
    sourceType === "audio" ? await transcribeAudio(buffer) : await extractPdfText(buffer);

  if (transcript.split(/\s+/).length < 20) {
    throw new AppError(
      `This ${sourceType === "audio" ? "recording" : "document"} is too short to summarize.`,
      422
    );
  }

  const aiResult = await summarizeTranscript(transcript);
  const title = titleFromFilename(originalname);

  const record = {
    userId: req.userId,
    sourceType,
    sourceFilename: originalname,
    title,
    transcript,
    summary: aiResult.summary,
    bulletPoints: aiResult.bulletPoints,
  };

  // Same "persistence is nice to have" policy as the YouTube flow — if
  // Mongo is down, the user still gets the summary they just paid AI
  // tokens (and, for audio, transcription cost) for.
  let saved = null;
  try {
    saved = await Summary.create(record);
  } catch (err) {
    console.error("Failed to save uploaded summary to MongoDB:", err.message);
  }

  res.status(200).json({
    success: true,
    data: {
      id: saved?._id ?? null,
      sourceType,
      sourceFilename: originalname,
      videoId: null,
      videoUrl: null,
      title,
      thumbnailUrl: null,
      summary: aiResult.summary,
      bulletPoints: aiResult.bulletPoints,
      transcriptWordCount: transcript.split(/\s+/).length,
      summaryWordCount: aiResult.summary.split(/\s+/).length,
      shareToken: null,
    },
  });
});

module.exports = { uploadAndSummarize };
