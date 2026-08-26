"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  getToken,
  setToken,
  clearToken,
  getMe,
  login as apiLogin,
  signup as apiSignup,
  type AuthUser,
} from "@/lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Must start as a plain constant, not derived from localStorage — this
  // value is part of the server-rendered HTML too, and the server has no
  // localStorage. Reading it here (even via a lazy initializer) caused a
  // hydration mismatch: server always renders logged-out, but a client
  // with a real stored token would compute a different value on its very
  // first render, before this effect ever gets a chance to run.
  const [isLoading, setIsLoading] = useState(true);

  // Runs only on the client, after hydration — safe to touch localStorage
  // here. If a token is already stored, verify it's still good and fetch
  // the user it belongs to; otherwise treat as logged out.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = getToken();
      if (token) {
        try {
          const me = await getMe();
          if (!cancelled) setUser(me);
        } catch {
          clearToken();
        }
      }
      if (!cancelled) setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    setToken(result.token);
    setUser({ email: result.email });
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const result = await apiSignup(email, password);
    setToken(result.token);
    setUser({ email: result.email });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
