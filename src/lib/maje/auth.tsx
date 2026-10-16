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
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface MajeAuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
}

const MajeAuthContext = createContext<MajeAuthContextValue | null>(null);

export function MajeAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    try {
      const supabase = createSupabaseBrowserClient();
      supabase.auth.getUser().then(({ data }) => {
        if (active) {
          setUser(data.user);
          setLoading(false);
        }
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      });
      return () => {
        active = false;
        listener.subscription.unsubscribe();
      };
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (active) setLoading(false);
      return undefined;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({ email, password });
      return error ? error.message : null;
    } catch {
      return "Service d'authentification indisponible. Réessayez plus tard.";
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? "E-mail ou mot de passe incorrect." : null;
    } catch {
      return "Service d'authentification indisponible. Réessayez plus tard.";
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // déconnexion locale silencieuse
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<string | null> => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/fr/compte/connexion`,
      });
      return error ? error.message : null;
    } catch {
      return "Service d'authentification indisponible. Réessayez plus tard.";
    }
  }, []);

  const value = useMemo<MajeAuthContextValue>(
    () => ({ user, loading, signUp, signIn, signOut, resetPassword }),
    [user, loading, signUp, signIn, signOut, resetPassword],
  );

  return <MajeAuthContext.Provider value={value}>{children}</MajeAuthContext.Provider>;
}

export function useMajeAuth(): MajeAuthContextValue {
  const ctx = useContext(MajeAuthContext);
  if (!ctx) throw new Error("useMajeAuth doit être utilisé dans <MajeAuthProvider>");
  return ctx;
}
