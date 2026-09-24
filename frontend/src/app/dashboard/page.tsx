"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getSummaries, deleteSummary, ApiError, type SummaryResponse } from "@/lib/api";

function chatLinkLabel(sourceType: SummaryResponse["sourceType"]): string {
  if (sourceType === "audio") return "Ask about this recording";
  if (sourceType === "pdf") return "Ask about this document";
  return "Ask about this video";
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [summaries, setSummaries] = useState<SummaryResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    getSummaries()
      .then(setSummaries)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Couldn't load your history.")
      );
  }, [user]);

  async function handleDelete(id: string | null) {
    if (!id) return;
    setDeleteError(null);
    setDeletingId(id);

    try {
      await deleteSummary(id);
      setSummaries((prev) => prev?.filter((item) => item.id !== id) ?? prev);
      setConfirmingId(null);
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : "Couldn't delete that. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading || !user) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <p className="text-sm text-muted">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16 sm:py-20">
      <div className="w-full max-w-2xl">
        <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Dashboard
        </div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Your history</h1>
        <p className="mt-2 text-sm text-muted">Everything you&apos;ve summarized, newest first.</p>

        <div className="mt-10 flex flex-col gap-4">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent"
            >
              {error}
            </div>
          )}

          {deleteError && (
            <div
              role="alert"
              className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent"
            >
              {deleteError}
            </div>
          )}

          {!error && summaries === null && (
            <p className="text-sm text-muted">Loading your history…</p>
          )}

          {summaries !== null && summaries.length === 0 && (
            <div className="rounded-lg border border-border bg-surface px-6 py-10 text-center">
              <p className="text-sm text-muted">
                Nothing here yet.{" "}
                <Link
                  href="/"
                  className="text-foreground underline underline-offset-4 hover:text-accent"
                >
                  Summarize your first video
                </Link>
                .
              </p>
            </div>
          )}

          {summaries?.map((item) => (
            <article key={item.id} className="rounded-lg border border-border bg-surface p-5">
              <div className="flex gap-4">
                {item.thumbnailUrl && (
                  <Image
                    src={item.thumbnailUrl}
                    alt=""
                    width={112}
                    height={64}
                    className="h-16 w-28 shrink-0 rounded-md object-cover"
                    unoptimized
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/dashboard/${item.id}`} className="min-w-0 truncate">
                      <h2 className="truncate font-display text-base font-semibold text-foreground hover:text-accent">
                        {item.title || item.sourceFilename || item.videoId || "Untitled"}
                      </h2>
                    </Link>
                    {item.createdAt && (
                      <time className="shrink-0 font-mono text-xs text-muted">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </time>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      {item.sourceType === "youtube" && item.videoUrl ? (
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs text-accent underline underline-offset-4"
                        >
                          Watch on YouTube ↗
                        </a>
                      ) : (
                        <span className="font-mono text-xs uppercase tracking-widest text-muted">
                          {item.sourceType === "audio" ? "Audio" : "PDF"}
                        </span>
                      )}
                      <Link
                        href={`/dashboard/${item.id}`}
                        className="inline-block text-xs text-muted underline underline-offset-4 hover:text-accent"
                      >
                        {chatLinkLabel(item.sourceType)}
                      </Link>
                    </div>

                    {confirmingId === item.id ? (
                      <div className="flex shrink-0 items-center gap-3 font-mono text-xs uppercase tracking-widest">
                        <span className="text-muted">Delete this?</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="text-accent transition hover:underline disabled:opacity-50"
                        >
                          {deletingId === item.id ? "Deleting…" : "Yes, delete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          disabled={deletingId === item.id}
                          className="text-muted transition hover:text-foreground disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingId(item.id)}
                        className="shrink-0 font-mono text-xs uppercase tracking-widest text-muted transition hover:text-accent"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
