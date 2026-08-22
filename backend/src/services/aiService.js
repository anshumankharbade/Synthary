const { GoogleGenAI, Type } = require("@google/genai");
const AppError = require("../utils/AppError");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Gemini Flash has a huge context window, so almost every transcript
// fits without chunking. This cap just guards against an outlier
// (multi-hour livestream) blowing up latency/cost on a demo project.
const MAX_TRANSCRIPT_CHARS = 100_000;

const SYSTEM_PROMPT = `You are an expert at distilling long-form video transcripts into their essential points for someone who hasn't watched the video.

Given a raw transcript, respond with:
- "summary": a single paragraph, about 100 words, that captures the video's main narrative or argument in plain language.
- "bulletPoints": exactly 5 bullet points, each one distinct, concrete takeaway (not restatements of each other).

Rules:
- Base everything only on the transcript text provided. Don't invent details.
- Write in plain, direct language — no filler like "this video is about".
- Don't reference timestamps, speaker labels, or the fact that this came from a transcript.`;

function stripCodeFence(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "")
    .trim();
}

/**
 * Sends a transcript to Gemini and returns { summary, bulletPoints }.
 * Throws on network/parsing failure — the controller decides how to
 * surface that to the client.
 */
async function summarizeTranscript(transcript) {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError(
      "GEMINI_API_KEY is missing on the server. Add a real key to backend/.env (free at https://aistudio.google.com/apikey), then restart `npm run dev`.",
      500
    );
  }

  const truncated =
    transcript.length > MAX_TRANSCRIPT_CHARS
      ? `${transcript.slice(0, MAX_TRANSCRIPT_CHARS)}\n\n[transcript truncated for length]`
      : transcript;

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: truncated,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            bulletPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["summary", "bulletPoints"],
        },
      },
    });
  } catch (err) {
    // Surface Gemini's actual error (bad key, quota, region block, etc.)
    // instead of letting it fall through to a generic 500.
    console.error("Gemini API call failed:", err?.message || err);
    throw new AppError(
      `Gemini API call failed: ${err?.message || "unknown error"}. Check that GEMINI_API_KEY in backend/.env is a valid, active key.`,
      502
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(stripCodeFence(response.text));
  } catch {
    throw new AppError("The AI returned a response that couldn't be parsed as JSON. Try again.", 502);
  }

  if (!parsed.summary || !Array.isArray(parsed.bulletPoints)) {
    throw new AppError("The AI response was missing expected fields. Try again.", 502);
  }

  return parsed;
}

module.exports = { summarizeTranscript };
