"use client";

import { useState } from "react";
import SummarizerForm from "./SummarizerForm";
import ProcessingIndicator from "./ProcessingIndicator";
import SummaryResult from "./SummaryResult";
import { summarizeVideo, ApiError, type SummaryResponse } from "@/lib/api";

type Status = "idle" | "loading" | "error" | "success";

export default function Summarizer() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      const data = await summarizeVideo(url.trim());
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  function handleReset() {
    setUrl("");
    setResult(null);
    setStatus("idle");
    setError(null);
  }

  return (
    <div className="w-full">
      <SummarizerForm
        value={url}
        onChange={setUrl}
        onSubmit={handleSubmit}
        disabled={status === "loading"}
      />

      {status === "loading" && <ProcessingIndicator />}

      {status === "error" && error && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent"
        >
          {error}
        </div>
      )}

      {status === "success" && result && <SummaryResult result={result} onReset={handleReset} />}
    </div>
  );
}
