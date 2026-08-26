"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await signup(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Synthary
      </div>

      <h1 className="font-display text-3xl font-semibold text-foreground">
        {isSignup ? "Create an account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {isSignup
          ? "Sign up to start summarizing and keep a history of what you've watched."
          : "Sign in to get back to your summaries."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={isSignup ? 8 : undefined}
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
            placeholder={isSignup ? "At least 8 characters" : "••••••••"}
          />
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-lg bg-accent px-6 py-3 font-display text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "One moment…" : isSignup ? "Sign up" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {isSignup ? "Already have an account? " : "Don't have an account? "}
        <Link href={isSignup ? "/login" : "/signup"} className="text-foreground underline underline-offset-4 hover:text-accent">
          {isSignup ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
