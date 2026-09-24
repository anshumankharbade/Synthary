"use client";

import { useEffect, useRef, useState } from "react";
import {
  getChatMessages,
  postChatMessage,
  ApiError,
  type ChatMessage,
  type SourceType,
} from "@/lib/api";

interface ChatPanelProps {
  summaryId: string;
  sourceType?: SourceType;
}

function contentNoun(sourceType?: SourceType): string {
  if (sourceType === "audio") return "recording";
  if (sourceType === "pdf") return "document";
  return "video";
}

export default function ChatPanel({ summaryId, sourceType }: ChatPanelProps) {
  const noun = contentNoun(sourceType);
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getChatMessages(summaryId)
      .then((data) => {
        if (!cancelled) setMessages(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : "Couldn't load the chat.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [summaryId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || isSending) return;

    setSendError(null);
    setInput("");
    setIsSending(true);

    // Optimistic: show the question immediately, before the round trip
    // (embedding + retrieval + generation) resolves.
    const optimisticId = `pending-${Date.now()}`;
    setMessages((prev) => [
      ...(prev ?? []),
      { id: optimisticId, role: "user", content: question, createdAt: new Date().toISOString() },
    ]);

    try {
      const { assistantMessage } = await postChatMessage(summaryId, question);
      setMessages((prev) => (prev ?? []).concat(assistantMessage));
    } catch (err) {
      setSendError(
        err instanceof ApiError ? err.message : "Couldn't get a response. Please try again."
      );
      // Leave the optimistic user message in place — resending would
      // duplicate it, and removing it hides what was actually asked.
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-5 py-3">
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
          Ask about this {noun}
        </h3>
      </div>

      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto px-5 py-4">
        {loadError && (
          <div role="alert" className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
            {loadError}
          </div>
        )}

        {!loadError && messages === null && (
          <p className="text-sm text-muted">Loading chat…</p>
        )}

        {messages !== null && messages.length === 0 && (
          <p className="text-sm text-muted">
            Ask a follow-up question — answers are grounded in this {noun}&apos;s transcript.
          </p>
        )}

        {messages?.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-lg px-4 py-2 text-sm leading-relaxed ${
              m.role === "user"
                ? "self-end bg-accent/15 text-foreground"
                : "self-start bg-background text-foreground"
            }`}
          >
            {m.content}
          </div>
        ))}

        {isSending && (
          <div className="self-start rounded-lg bg-background px-4 py-2 text-sm text-muted">
            Thinking…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {sendError && (
        <div role="alert" className="border-t border-border px-5 py-3 text-sm text-accent">
          {sendError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
          placeholder={`Ask a question about this ${noun}…`}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="rounded-lg bg-accent px-4 py-2 font-display text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
