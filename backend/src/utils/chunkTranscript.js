const WORDS_PER_CHUNK = 220;
const OVERLAP_WORDS = 40;

/**
 * Splits a transcript into overlapping word-count-based chunks.
 * Overlap keeps a sentence that straddles a chunk boundary from losing
 * context in whichever chunk it lands in.
 *
 * @param {string} text
 * @returns {string[]} chunk texts, in order
 */
function chunkTranscript(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return [];
  if (words.length <= WORDS_PER_CHUNK) return [words.join(" ")];

  const chunks = [];
  const step = WORDS_PER_CHUNK - OVERLAP_WORDS;

  for (let start = 0; start < words.length; start += step) {
    const slice = words.slice(start, start + WORDS_PER_CHUNK);
    if (slice.length === 0) break;
    chunks.push(slice.join(" "));
    if (start + WORDS_PER_CHUNK >= words.length) break;
  }

  return chunks;
}

module.exports = { chunkTranscript, WORDS_PER_CHUNK, OVERLAP_WORDS };
