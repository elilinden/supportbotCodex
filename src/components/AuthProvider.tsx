"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Initialises the Supabase auth listener once, at the root of the app.
 * Renders nothing visible — just wires up the subscription.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, [init]);

  return <>{children}</>;
}
