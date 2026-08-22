const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface SummaryResponse {
  id: string | null;
  videoId: string;
  videoUrl: string;
  title: string | null;
  thumbnailUrl: string | null;
  summary: string;
  bulletPoints: string[];
  transcriptWordCount: number;
  summaryWordCount: number;
}

export class ApiError extends Error {}

export async function summarizeVideo(url: string): Promise<SummaryResponse> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}/api/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    throw new ApiError("Couldn't reach the server. Is the backend running?");
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok || !payload?.success) {
    throw new ApiError(payload?.error || "Something went wrong. Please try again.");
  }

  return payload.data as SummaryResponse;
}
