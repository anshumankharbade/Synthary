const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { extractVideoId, getTranscript, getVideoMeta } = require("../services/transcriptService");
const { summarizeTranscript } = require("../services/aiService");
const Summary = require("../models/Summary");

const summarizeVideo = asyncHandler(async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    throw new AppError("Please provide a YouTube URL.", 400);
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new AppError("That doesn't look like a valid YouTube URL.", 400);
  }

  let transcript;
  try {
    transcript = await getTranscript(videoId);
  } catch (err) {
    throw new AppError(
      "Couldn't get a transcript for this video. It may have captions disabled, be private, or be age/region-restricted.",
      422
    );
  }

  if (transcript.split(" ").length < 20) {
    throw new AppError("This video's transcript is too short to summarize.", 422);
  }

  // Title/thumbnail lookup and the AI call don't depend on each other,
  // so run them in parallel to shave a bit off total latency.
  const [meta, aiResult] = await Promise.all([
    getVideoMeta(url),
    summarizeTranscript(transcript),
  ]);

  const record = {
    userId: req.userId,
    videoId,
    videoUrl: url,
    title: meta.title,
    thumbnailUrl: meta.thumbnailUrl,
    transcript,
    summary: aiResult.summary,
    bulletPoints: aiResult.bulletPoints,
  };

  // Persistence is "nice to have" for this request — if Mongo is down,
  // the user should still get the summary they just paid AI tokens for.
  let saved = null;
  try {
    saved = await Summary.create(record);
  } catch (err) {
    console.error("Failed to save summary to MongoDB:", err.message);
  }

  res.status(200).json({
    success: true,
    data: {
      id: saved?._id ?? null,
      videoId,
      videoUrl: url,
      title: meta.title,
      thumbnailUrl: meta.thumbnailUrl,
      summary: aiResult.summary,
      bulletPoints: aiResult.bulletPoints,
      transcriptWordCount: transcript.split(/\s+/).length,
      summaryWordCount: aiResult.summary.split(/\s+/).length,
    },
  });
});

module.exports = { summarizeVideo };
