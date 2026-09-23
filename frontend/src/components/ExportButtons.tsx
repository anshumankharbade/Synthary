"use client";

import { exportSummaryAsTxt, exportSummaryAsPdf, type ExportableSummary } from "@/lib/export";

export default function ExportButtons({ summary }: { summary: ExportableSummary }) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => exportSummaryAsTxt(summary)}
        className="font-mono text-xs uppercase tracking-widest text-muted transition hover:text-accent"
      >
        Export .txt
      </button>
      <button
        type="button"
        onClick={() => exportSummaryAsPdf(summary)}
        className="font-mono text-xs uppercase tracking-widest text-muted transition hover:text-accent"
      >
        Export .pdf
      </button>
    </div>
  );
}
