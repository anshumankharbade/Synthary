import type { SummaryResponse } from "@/lib/api";
import ChatPanel from "./ChatPanel";
import ExportButtons from "./ExportButtons";
import ShareButton from "./ShareButton";

interface SummaryResultProps {
  result: SummaryResponse;
  onReset: () => void;
}

export default function SummaryResult({ result, onReset }: SummaryResultProps) {
  const { transcriptWordCount, summaryWordCount } = result;

  return (
    <div className="mt-8">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-semibold text-foreground">
            {result.title || "Summary"}
          </h2>
          {result.sourceType === "youtube" && result.videoUrl ? (
            <a
              href={result.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-muted transition hover:text-accent"
            >
              {result.videoUrl}
            </a>
          ) : (
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {result.sourceType === "audio" ? "Audio file" : "PDF"}
              {result.sourceFilename ? ` · ${result.sourceFilename}` : ""}
            </p>
          )}
        </div>

        {typeof transcriptWordCount === "number" &&
          typeof summaryWordCount === "number" &&
          transcriptWordCount > 0 &&
          summaryWordCount < transcriptWordCount && (
            <span className="shrink-0 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 font-mono text-xs text-amber">
              {transcriptWordCount.toLocaleString()} → {summaryWordCount.toLocaleString()} words
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

      {result.id && (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <ExportButtons summary={result} />
            <ShareButton summaryId={result.id} initialShareToken={result.shareToken} />
          </div>

          <div className="mt-8">
            <ChatPanel summaryId={result.id} sourceType={result.sourceType} />
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onReset}
        className="mt-8 font-mono text-xs uppercase tracking-widest text-muted transition hover:text-accent"
      >
        ← Summarize something else
      </button>
    </div>
  );
}
