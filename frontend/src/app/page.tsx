"use client";

import Link from "next/link";
import Summarizer from "@/components/Summarizer";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-20 sm:py-28">
      <div className="w-full max-w-2xl">
        <div className="mb-10 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Synthary
        </div>

        <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          Paste a link.
          <br />
          Get to the point.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          Drop in any YouTube URL and get a clean summary with the key takeaways —
          no watching required.
        </p>

        <div className="mt-12">
          {isLoading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : user ? (
            <>
              <Summarizer />
              <p className="mt-4 text-xs leading-relaxed text-muted">
                Note: transcript fetching can occasionally fail on this hosted demo —
                YouTube rate-limits requests from cloud/datacenter IPs, a known,
                industry-wide constraint that doesn&apos;t affect running this locally.
              </p>
            </>
          ) : (
            <div className="rounded-lg border border-border bg-surface px-6 py-8">
              <p className="text-sm text-muted">
                Create a free account to start summarizing and keep a history of what
                you&apos;ve watched.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/signup"
                  className="rounded-lg bg-accent px-5 py-2.5 font-display text-sm font-semibold text-accent-foreground transition hover:bg-accent/90"
                >
                  Sign up
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg border border-border px-5 py-2.5 text-sm text-foreground transition hover:border-accent hover:text-accent"
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
