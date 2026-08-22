import Summarizer from "@/components/Summarizer";

export default function Home() {
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
          <Summarizer />
        </div>
      </div>
    </main>
  );
}
