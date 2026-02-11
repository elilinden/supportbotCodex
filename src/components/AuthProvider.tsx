"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCaseStore } from "@/store/useCaseStore";
import { cloudSave, cloudRestore } from "@/lib/cloudSync";

const AUTO_SAVE_DELAY = 3_000; // 3-second debounce

/**
 * Initialises Supabase auth, auto-loads cloud data on sign-in,
 * and auto-saves the encrypted store to Supabase on every change.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);
  const user = useAuthStore((s) => s.user);
  const prevUserRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Wire up Supabase auth listener
  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, [init]);

  // 2. On sign-in: load cloud data into local store
  useEffect(() => {
    const currentId = user?.id ?? null;
    const previousId = prevUserRef.current;
    prevUserRef.current = currentId;

    // Only trigger on a *new* sign-in (null -> userId).
    // sessionStorage guard prevents re-triggering after page refresh
    // (refs reset on reload, but sessionStorage persists within the tab).
    if (currentId && !previousId) {
      const restoreKey = `cloud-restored-${currentId}`;
      if (!sessionStorage.getItem(restoreKey)) {
        sessionStorage.setItem(restoreKey, "1");
        cloudRestore(currentId).catch(() => {
          // No cloud data yet — first-time user, that's fine
        });
      }
    }
  }, [user]);

  // 3. Auto-save on store changes (debounced)
  useEffect(() => {
    if (!user) return;

    const unsub = useCaseStore.subscribe(() => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(() => {
        cloudSave(user.id).catch((err) =>
          console.error("[AuthProvider] auto-save failed", err)
        );
      }, AUTO_SAVE_DELAY);
    });

    return () => {
      unsub();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [user]);

  return <>{children}</>;
}
