interface SummarizerFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}

export default function SummarizerForm({
  value,
  onChange,
  onSubmit,
  disabled,
}: SummarizerFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <label
        htmlFor="youtube-url"
        className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted"
      >
        Video URL
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            <PlayIcon />
          </span>
          <input
            id="youtube-url"
            name="url"
            type="url"
            required
            inputMode="url"
            autoComplete="off"
            placeholder="https://youtube.com/watch?v=..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full rounded-lg border border-border bg-surface py-4 pl-12 pr-4 font-mono text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={disabled}
          className="shrink-0 rounded-lg bg-accent px-6 py-4 font-display text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Summarizing…" : "Summarize"}
        </button>
      </div>
    </form>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 1.5v11l10-5.5-10-5.5z" fill="currentColor" />
    </svg>
  );
}
