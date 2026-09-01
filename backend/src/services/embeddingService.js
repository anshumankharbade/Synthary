const { GoogleGenAI } = require("@google/genai");
const AppError = require("../utils/AppError");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// text-embedding-004 (deprecated Jan 2026) -> gemini-embedding-001 is the
// current model as of writing. Check https://ai.google.dev/gemini-api/docs/embeddings
// if this ever needs to change again.
const EMBEDDING_MODEL = "gemini-embedding-001";

/**
 * Embeds one or more texts. Returns vectors in the same order as the input.
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
async function embedTexts(texts) {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError(
      "GEMINI_API_KEY is missing on the server. Add a real key to backend/.env, then restart.",
      500
    );
  }
  if (!texts || texts.length === 0) return [];

  try {
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: texts,
    });

    const embeddings = response.embeddings ?? [];
    if (embeddings.length !== texts.length) {
      throw new AppError(
        `Expected ${texts.length} embeddings back but got ${embeddings.length}.`,
        502
      );
    }

    return embeddings.map((e) => e.values ?? []);
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("Gemini embedding call failed:", err?.message || err);
    throw new AppError(
      `Embedding call failed: ${err?.message || "unknown error"}. Check that GEMINI_API_KEY is valid.`,
      502
    );
  }
}

async function embedText(text) {
  const [vector] = await embedTexts([text]);
  return vector;
}

module.exports = { embedTexts, embedText, EMBEDDING_MODEL };
