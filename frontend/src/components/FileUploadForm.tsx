"use client";

import { useRef } from "react";

interface FileUploadFormProps {
  file: File | null;
  onChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}

export default function FileUploadForm({
  file,
  onChange,
  onSubmit,
  disabled,
}: FileUploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={onSubmit}>
      <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted">
        Audio or PDF file
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex flex-1 items-center gap-3 rounded-lg border border-border bg-surface px-4 py-4 text-left font-mono text-sm text-foreground outline-none transition hover:border-accent/60 disabled:opacity-50"
        >
          <UploadIcon />
          <span className={file ? "truncate text-foreground" : "text-muted/60"}>
            {file ? file.name : "Choose an audio file or PDF…"}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,application/pdf,.mp3,.wav,.m4a,.pdf"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          disabled={disabled}
          className="hidden"
        />
        <button
          type="submit"
          disabled={disabled || !file}
          className="shrink-0 rounded-lg bg-accent px-6 py-4 font-display text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Processing…" : "Summarize"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        Audio is transcribed, PDFs have their text extracted directly. Max 50MB.
      </p>
    </form>
  );
}

function UploadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M8 11V2M8 2L4.5 5.5M8 2l3.5 3.5M2.5 11v1.5A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V11"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
