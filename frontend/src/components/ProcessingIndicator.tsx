"use client";

import { useEffect, useState } from "react";

const STAGES = ["Reading transcript…", "Finding the key moments…", "Condensing to the gist…"];

export default function ProcessingIndicator() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((i) => (i + 1) % STAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-6 rounded-lg border border-border bg-surface px-4 py-4"
    >
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-border">
        <div className="animate-scan absolute inset-y-0 w-1/4 rounded-full bg-accent" />
      </div>
      <p className="mt-3 font-mono text-xs text-muted">{STAGES[stageIndex]}</p>
    </div>
  );
}
