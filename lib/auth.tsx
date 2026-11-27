"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface User {
  name: string;
}

interface AuthContextValue {
  user: User | null;
  login: (u: User | null) => void;
  signOut: () => void;
}

const STORAGE_KEY = "av_user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Read the saved session only after mount to avoid hydration mismatches.
  useEffect(() => {
    let saved: User | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as User | null) : null;
      if (parsed && typeof parsed.name === "string") saved = parsed;
    } catch {}
    if (!saved) return;
    // Deferred so setState is not called synchronously in the effect body.
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setUser(saved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((u: User | null) => {
    setUser(u);
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const value = useMemo(
    () => ({ user, login, signOut }),
    [user, login, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
