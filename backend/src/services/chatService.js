const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");

const TranscriptChunk = require("../models/TranscriptChunk");
const AppError = require("../utils/AppError");
const { chunkTranscript } = require("../utils/chunkTranscript");
const { embedTexts, embedText } = require("./embeddingService");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const CHAT_MODEL = "gemini-3.6-flash";

// Must match the Atlas Vector Search index name exactly — see README for
// the index definition this depends on.
const VECTOR_INDEX_NAME = "transcript_chunks_vector_index";
const TOP_K = 4;

/**
 * Chunks + embeds a transcript on first use for a given summary, and
 * stores the chunks. A no-op if chunks already exist (idempotent, so it's
 * safe to call this on every chat message without worrying about duplicates).
 */
async function ensureChunksExist(summaryId, userId, transcript) {
  const existing = await TranscriptChunk.countDocuments({ summaryId });
  if (existing > 0) return;

  const chunks = chunkTranscript(transcript);
  if (chunks.length === 0) {
    throw new AppError("This summary has no transcript to chat about.", 422);
  }

  const vectors = await embedTexts(chunks);

  await TranscriptChunk.insertMany(
    chunks.map((text, i) => ({
      summaryId,
      userId,
      chunkIndex: i,
      text,
      embedding: vectors[i],
    }))
  );
}

/**
 * Runs Atlas Vector Search, scoped to one summary, and returns the top
 * matching chunk texts ordered by relevance.
 */
async function retrieveRelevantChunks(summaryId, questionVector) {
  const results = await TranscriptChunk.aggregate([
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: "embedding",
        queryVector: questionVector,
        filter: { summaryId: new mongoose.Types.ObjectId(summaryId) },
        numCandidates: 100,
        limit: TOP_K,
      },
    },
    {
      $project: {
        _id: 0,
        text: 1,
        chunkIndex: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  return results.sort((a, b) => a.chunkIndex - b.chunkIndex).map((r) => r.text);
}

/**
 * Full RAG flow: ensure chunks exist, embed the question, retrieve the
 * relevant excerpts, and generate an answer grounded in only those
 * excerpts plus the prior conversation for this summary.
 *
 * @param {object} params
 * @param {string} params.summaryId
 * @param {string} params.userId
 * @param {string} params.transcript - full transcript, for lazy chunking
 * @param {string} params.question
 * @param {{role: "user"|"model", content: string}[]} params.history - prior turns, oldest first
 */
async function answerQuestion({ summaryId, userId, transcript, question, history }) {
  await ensureChunksExist(summaryId, userId, transcript);

  const questionVector = await embedText(question);

  let relevantChunks;
  try {
    relevantChunks = await retrieveRelevantChunks(summaryId, questionVector);
  } catch (err) {
    console.error("Vector search failed:", err?.message || err);
    throw new AppError(
      `Vector search failed: ${err?.message || "unknown error"}. ` +
        `This usually means the Atlas Vector Search index "${VECTOR_INDEX_NAME}" ` +
        "doesn't exist yet, or is still building — see the README for setup steps.",
      502
    );
  }

  if (relevantChunks.length === 0) {
    throw new AppError(
      "Couldn't find anything relevant in the transcript to answer that.",
      422
    );
  }

  const systemInstruction = `You answer questions about a YouTube video, using ONLY the transcript excerpts below — never outside knowledge.
If the excerpts don't contain the answer, say so plainly rather than guessing.
Keep answers conversational and reasonably brief.

TRANSCRIPT EXCERPTS (most relevant first is not guaranteed — read them all):
"""
${relevantChunks.join("\n---\n")}
"""`;

  const contents = [
    ...history.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.content }],
    })),
    { role: "user", parts: [{ text: question }] },
  ];

  let response;
  try {
    response = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents,
      config: { systemInstruction },
    });
  } catch (err) {
    console.error("Gemini chat call failed:", err?.message || err);
    throw new AppError(
      `Chat request failed: ${err?.message || "unknown error"}.`,
      502
    );
  }

  const answer = response.text;
  if (!answer) {
    throw new AppError("The AI returned an empty response. Try again.", 502);
  }

  return answer;
}

module.exports = { answerQuestion, ensureChunksExist, retrieveRelevantChunks };
