"use client";

import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { requireSupabase } from "@/lib/supabase";

export type AuthStoreState = {
  user: User | null;
  session: Session | null;
  loading: boolean;

  /** Called once on mount to pick up existing session + subscribe to changes. */
  init: () => () => void;

  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
};

export const useAuthStore = create<AuthStoreState>()((set, get) => ({
  user: null,
  session: null,
  loading: true,

  init: () => {
    // Grab the current session (may exist from a refresh)
    requireSupabase().auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, loading: false });
    });

    // Subscribe to future auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = requireSupabase().auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
    });

    return () => subscription.unsubscribe();
  },

  signUp: async (email, password) => {
    const { error } = await requireSupabase().auth.signUp({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  },

  signIn: async (email, password) => {
    const { error } = await requireSupabase().auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  },

  signOut: async () => {
    await requireSupabase().auth.signOut();
    set({ user: null, session: null });
  },

  resetPassword: async (email) => {
    const { error } = await requireSupabase().auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    return { error: null };
  },
}));
