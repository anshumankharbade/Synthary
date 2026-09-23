"use client";

import { useState } from "react";
import { createShareLink, deleteShareLink, ApiError } from "@/lib/api";

interface ShareButtonProps {
  summaryId: string;
  initialShareToken?: string | null;
}

export default function ShareButton({ summaryId, initialShareToken }: ShareButtonProps) {
  const [shareToken, setShareToken] = useState<string | null>(initialShareToken ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    shareToken && typeof window !== "undefined"
      ? `${window.location.origin}/shared/${shareToken}`
      : null;

  async function handleShare() {
    setError(null);
    setIsLoading(true);
    try {
      const { shareToken: token } = await createShareLink(summaryId);
      setShareToken(token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create a share link.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStopSharing() {
    setError(null);
    setIsLoading(true);
    try {
      await deleteShareLink(summaryId);
      setShareToken(null);
      setCopied(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't stop sharing.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy — you can select and copy the link manually.");
    }
  }

  if (!shareToken) {
    return (
      <div>
        <button
          type="button"
          onClick={handleShare}
          disabled={isLoading}
          className="font-mono text-xs uppercase tracking-widest text-muted transition hover:text-accent disabled:opacity-50"
        >
          {isLoading ? "Creating link…" : "Share"}
        </button>
        {error && <p className="mt-2 text-xs text-accent">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background px-4 py-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={shareUrl ?? ""}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 truncate rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-xs text-foreground"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs text-foreground transition hover:border-accent hover:text-accent"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <button
        type="button"
        onClick={handleStopSharing}
        disabled={isLoading}
        className="self-start font-mono text-xs uppercase tracking-widest text-muted transition hover:text-accent disabled:opacity-50"
      >
        {isLoading ? "Working…" : "Stop sharing"}
      </button>
      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  );
}
