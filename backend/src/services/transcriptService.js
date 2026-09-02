const { Innertube } = require("youtubei.js");

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

// Session creation does some setup work (deciphering config, etc.) — cache
// it across requests instead of re-creating it every call.
let clientPromise = null;
function getClient() {
  if (!clientPromise) {
    clientPromise = Innertube.create({
      generate_session_locally: true,
      // We only need transcript text, never a playable stream, so skip
      // fetching/parsing the JS player — faster init, one fewer request.
      retrieve_player: false,
    });
  }
  return clientPromise;
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
 * Fetches the transcript via youtubei.js, which talks to YouTube's
 * InnerTube API (the same one the youtube.com website itself uses)
 * rather than scraping the unofficial timedtext endpoint. Neither
 * approach is officially supported by YouTube, and both can be rate
 * limited or blocked — especially from cloud/datacenter IPs, a known,
 * widely-documented issue as of 2026. Callers should treat failures as
 * expected, not fatal.
 */
async function getTranscript(videoId) {
  const yt = await getClient();
  const info = await yt.getInfo(videoId);
  const transcriptData = await info.getTranscript();

  const segments = transcriptData?.transcript?.content?.body?.initial_segments ?? [];

  const text = segments
    .map((seg) => seg?.snippet?.toString?.())
    .filter(Boolean)
    .join(" ");

  if (!text) {
    throw new Error("No transcript segments returned.");
  }

  return decodeEntities(text).replace(/\s+/g, " ").trim();
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
