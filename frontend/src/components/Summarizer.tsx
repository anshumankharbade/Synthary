"use client";

import { useState } from "react";
import SummarizerForm from "./SummarizerForm";
import FileUploadForm from "./FileUploadForm";
import ProcessingIndicator from "./ProcessingIndicator";
import SummaryResult from "./SummaryResult";
import { summarizeVideo, uploadFile, ApiError, type SummaryResponse } from "@/lib/api";

type Status = "idle" | "loading" | "error" | "success";
type Mode = "url" | "upload";

export default function Summarizer() {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResponse | null>(null);

  async function handleUrlSubmit(e: React.FormEvent) {
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

  async function handleFileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      const data = await uploadFile(file);
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  function handleReset() {
    setUrl("");
    setFile(null);
    setResult(null);
    setStatus("idle");
    setError(null);
  }

  function switchMode(next: Mode) {
    if (status === "loading") return;
    setMode(next);
    setError(null);
  }

  return (
    <div className="w-full">
      {status !== "success" && (
        <div className="mb-4 flex gap-1 font-mono text-xs uppercase tracking-widest">
          <button
            type="button"
            onClick={() => switchMode("url")}
            className={`rounded-md px-3 py-1.5 transition ${
              mode === "url" ? "bg-accent/15 text-accent" : "text-muted hover:text-foreground"
            }`}
          >
            YouTube URL
          </button>
          <button
            type="button"
            onClick={() => switchMode("upload")}
            className={`rounded-md px-3 py-1.5 transition ${
              mode === "upload" ? "bg-accent/15 text-accent" : "text-muted hover:text-foreground"
            }`}
          >
            Upload file
          </button>
        </div>
      )}

      {status !== "success" && mode === "url" && (
        <SummarizerForm
          value={url}
          onChange={setUrl}
          onSubmit={handleUrlSubmit}
          disabled={status === "loading"}
        />
      )}

      {status !== "success" && mode === "upload" && (
        <FileUploadForm
          file={file}
          onChange={setFile}
          onSubmit={handleFileSubmit}
          disabled={status === "loading"}
        />
      )}

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
