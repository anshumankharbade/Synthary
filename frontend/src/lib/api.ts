const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const TOKEN_KEY = "synthary_token";

export interface SummaryResponse {
  id: string | null;
  videoId: string;
  videoUrl: string;
  title: string | null;
  thumbnailUrl: string | null;
  summary: string;
  bulletPoints: string[];
  transcriptWordCount?: number;
  summaryWordCount?: number;
  createdAt?: string;
  transcript?: string;
}

export interface AuthUser {
  email: string;
  createdAt?: string;
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

// --- token storage (plain localStorage — fine for a decoupled SPA+API
// setup like this one; see README for the tradeoff vs httpOnly cookies) ---
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authRequired = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (authRequired) {
    const token = getToken();
    if (!token) {
      throw new ApiError("You need to be signed in to do that.", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  // Without this, a slow/unreachable backend means every page's auth
  // check (which runs on load, before anything else can render) just
  // hangs forever instead of failing — worth guarding against directly.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError("Couldn't reach the server. Is the backend running?");
  } finally {
    clearTimeout(timeoutId);
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok || !payload?.success) {
    throw new ApiError(payload?.error || "Something went wrong. Please try again.", res.status);
  }

  return payload.data as T;
}

export async function signup(email: string, password: string) {
  return request<{ token: string; email: string }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string) {
  return request<{ token: string; email: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return request<AuthUser>("/api/auth/me", {}, true);
}

export async function summarizeVideo(url: string) {
  return request<SummaryResponse>(
    "/api/summarize",
    { method: "POST", body: JSON.stringify({ url }) },
    true
  );
}

export async function getSummaries() {
  return request<SummaryResponse[]>("/api/summaries", {}, true);
}

export async function getSummaryById(id: string) {
  return request<SummaryResponse>(`/api/summaries/${id}`, {}, true);
}

export async function deleteSummary(id: string) {
  return request<{ id: string }>(`/api/summaries/${id}`, { method: "DELETE" }, true);
}
