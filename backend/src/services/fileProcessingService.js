const { AssemblyAI } = require("assemblyai");
const { PDFParse } = require("pdf-parse");

const AppError = require("../utils/AppError");

let assemblyClient = null;
function getAssemblyClient() {
  if (!assemblyClient) {
    if (!process.env.ASSEMBLYAI_API_KEY) {
      throw new AppError(
        "ASSEMBLYAI_API_KEY is missing on the server. Add a free key from assemblyai.com to backend/.env, then restart.",
        500
      );
    }
    assemblyClient = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
  }
  return assemblyClient;
}

/**
 * Transcribes an audio file buffer via AssemblyAI. Blocks until the job
 * completes (or fails) — AssemblyAI's own transcribe() polls internally.
 * Bounded to 5 minutes so a stuck job can't hang the request forever.
 */
async function transcribeAudio(buffer) {
  const client = getAssemblyClient();

  let transcript;
  try {
    transcript = await client.transcripts.transcribe(
      { audio: buffer },
      { pollingTimeout: 5 * 60 * 1000 }
    );
  } catch (err) {
    console.error("AssemblyAI request failed:", err?.message || err);
    throw new AppError(`Transcription request failed: ${err?.message || "unknown error"}.`, 502);
  }

  if (transcript.status === "error") {
    console.error("AssemblyAI transcription failed:", transcript.error);
    throw new AppError(`Transcription failed: ${transcript.error || "unknown reason"}.`, 422);
  }

  const text = transcript.text?.trim();
  if (!text) {
    throw new AppError("No speech was detected in that audio file.", 422);
  }

  return text;
}

/**
 * Extracts text from a PDF buffer locally — no external API, since a PDF
 * already contains text rather than needing speech-to-text.
 */
async function extractPdfText(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const text = result.text?.trim();

    if (!text) {
      throw new AppError(
        "Couldn't find any text in that PDF — it may be a scanned image without an OCR text layer.",
        422
      );
    }

    return text;
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("PDF parsing failed:", err?.message || err);
    throw new AppError("Couldn't read that PDF. Make sure it's a valid, unencrypted PDF file.", 422);
  } finally {
    // pdf-parse wraps pdfjs-dist, which holds worker/WASM resources that
    // need explicit cleanup — otherwise they leak across requests.
    await parser.destroy();
  }
}

module.exports = { transcribeAudio, extractPdfText };
