"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4 sm:px-10">
      <Link href="/" className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Synthary
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        {isLoading ? null : user ? (
          <>
            <Link href="/dashboard" className="text-muted transition hover:text-foreground">
              Dashboard
            </Link>
            <span className="hidden text-muted sm:inline">{user.email}</span>
            <button
              onClick={logout}
              className="rounded-lg border border-border px-3 py-1.5 text-foreground transition hover:border-accent hover:text-accent"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-muted transition hover:text-foreground">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-border px-3 py-1.5 text-foreground transition hover:border-accent hover:text-accent"
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
