import type { SummaryResponse } from "@/lib/api";

interface SummaryResultProps {
  result: SummaryResponse;
  onReset: () => void;
}

export default function SummaryResult({ result, onReset }: SummaryResultProps) {
  const compression =
    result.transcriptWordCount > 0
      ? Math.round((1 - result.summaryWordCount / result.transcriptWordCount) * 100)
      : null;

  return (
    <div className="mt-8">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-semibold text-foreground">
            {result.title || "Video summary"}
          </h2>
          <a
            href={result.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-muted transition hover:text-accent"
          >
            {result.videoUrl}
          </a>
        </div>

        {compression !== null && compression > 0 && (
          <span className="shrink-0 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 font-mono text-xs text-amber">
            {result.transcriptWordCount.toLocaleString()} → {result.summaryWordCount.toLocaleString()} words
          </span>
        )}
      </div>

      <p className="mt-5 text-[15px] leading-relaxed text-foreground/90">{result.summary}</p>

      <ul className="mt-5 space-y-3">
        {result.bulletPoints.map((point, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 shrink-0 font-mono text-xs text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-sm leading-relaxed text-foreground/90">{point}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onReset}
        className="mt-8 font-mono text-xs uppercase tracking-widest text-muted transition hover:text-accent"
      >
        ← Summarize another video
      </button>
    </div>
  );
}
