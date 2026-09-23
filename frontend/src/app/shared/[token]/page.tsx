"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSharedSummary, ApiError, type SharedSummary } from "@/lib/api";
import ExportButtons from "@/components/ExportButtons";

export default function SharedSummaryPage() {
  const params = useParams<{ token: string }>();
  const [summary, setSummary] = useState<SharedSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSharedSummary(params.token)
      .then(setSummary)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Couldn't load this shared summary."
        )
      );
  }, [params.token]);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16 sm:py-20">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Shared summary
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent"
          >
            {error}
          </div>
        )}

        {!error && !summary && <p className="text-sm text-muted">Loading…</p>}

        {summary && (
          <>
            <div className="flex items-start gap-4">
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
                  {summary.title || "Summary"}
                </h1>
                {summary.sourceType === "youtube" && summary.videoUrl ? (
                  <a
                    href={summary.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent underline underline-offset-4"
                  >
                    Watch on YouTube ↗
                  </a>
                ) : (
                  <p className="font-mono text-xs uppercase tracking-widest text-muted">
                    {summary.sourceType === "audio" ? "Audio file" : "PDF"}
                  </p>
                )}
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

            <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
              <ExportButtons summary={summary} />
              <p className="font-mono text-xs text-muted">
                Made with{" "}
                <Link href="/" className="text-accent hover:underline">
                  Synthary
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
