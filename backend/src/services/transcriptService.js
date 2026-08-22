const { YoutubeTranscript } = require("youtube-transcript");

const HTML_ENTITIES = {
  "&amp;": "&",
  "&#39;": "'",
  "&quot;": '"',
  "&lt;": "<",
  "&gt;": ">",
};

function decodeEntities(text) {
  return text.replace(/&amp;|&#39;|&quot;|&lt;|&gt;/g, (match) => HTML_ENTITIES[match]);
}

/**
 * Pulls the 11-character video ID out of the common YouTube URL shapes:
 * watch?v=, youtu.be/, /shorts/, /embed/, /live/.
 * Returns null if the URL isn't recognized as a YouTube video URL.
 */
function extractVideoId(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");

  if (host === "youtu.be") {
    return parsed.pathname.slice(1).split("/")[0] || null;
  }

  if (host === "youtube.com" || host === "music.youtube.com") {
    if (parsed.pathname === "/watch") {
      return parsed.searchParams.get("v");
    }
    const match = parsed.pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/);
    if (match) return match[2];
  }

  return null;
}

/**
 * Fetches the transcript via the unofficial timedtext endpoint (through
 * the `youtube-transcript` package) and flattens it into plain text.
 * This endpoint isn't officially supported by YouTube, so it can break
 * or return nothing for videos with captions disabled — callers should
 * treat failures as expected, not fatal.
 */
async function getTranscript(videoId) {
  const segments = await YoutubeTranscript.fetchTranscript(videoId);

  if (!segments || segments.length === 0) {
    throw new Error("No transcript segments returned.");
  }

  return decodeEntities(segments.map((segment) => segment.text).join(" "))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Best-effort title/thumbnail lookup via YouTube's public oEmbed
 * endpoint. No API key required. Never throws — a failure here
 * shouldn't block the user from getting their summary.
 */
async function getVideoMeta(videoUrl) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`
    );
    if (!res.ok) return { title: null, thumbnailUrl: null };

    const data = await res.json();
    return {
      title: data.title ?? null,
      thumbnailUrl: data.thumbnail_url ?? null,
    };
  } catch {
    return { title: null, thumbnailUrl: null };
  }
}

module.exports = { extractVideoId, getTranscript, getVideoMeta };
