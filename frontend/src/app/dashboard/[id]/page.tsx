"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getSummaryById, ApiError, type SummaryResponse } from "@/lib/api";
import ChatPanel from "@/components/ChatPanel";

export default function SummaryDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    getSummaryById(params.id)
      .then(setSummary)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Couldn't load this summary.")
      );
  }, [user, params.id]);

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
        <Link
          href="/dashboard"
          className="font-mono text-xs uppercase tracking-widest text-muted transition hover:text-accent"
        >
          ← Back to dashboard
        </Link>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent"
          >
            {error}
          </div>
        )}

        {!error && !summary && <p className="mt-6 text-sm text-muted">Loading…</p>}

        {summary && (
          <>
            <div className="mt-6 flex items-start gap-4">
              {summary.thumbnailUrl && (
                <Image
                  src={summary.thumbnailUrl}
                  alt=""
                  width={128}
                  height={72}
                  className="h-18 w-32 shrink-0 rounded-md object-cover"
                  unoptimized
                />
              )}
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-semibold text-foreground">
                  {summary.title || "Video summary"}
                </h1>
                <a
                  href={summary.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent underline underline-offset-4"
                >
                  Watch on YouTube ↗
                </a>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted">{summary.summary}</p>

            {summary.bulletPoints?.length > 0 && (
              <ul className="mt-5 flex flex-col gap-2">
                {summary.bulletPoints.map((point, i) => (
                  <li
                    key={i}
                    className="border-l-2 border-accent/40 pl-3 text-sm leading-relaxed text-foreground"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8">
              <ChatPanel summaryId={summary.id ?? params.id} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
