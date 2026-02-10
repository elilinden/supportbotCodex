"use client";

import { supabase } from "@/lib/supabase";

/**
 * Cloud sync helpers.
 *
 * The `encrypted_data` column stores the SAME encrypted envelope that
 * localStorage holds — the server never sees plaintext case data.
 */

const TABLE = "user_data";
const STORE_KEY = "ny-op-case-store-encrypted";

/** Read the encrypted blob from localStorage (what Zustand persisted). */
function getLocalEncrypted(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORE_KEY);
}

/** Write an encrypted blob to localStorage and trigger Zustand rehydration. */
function setLocalEncrypted(blob: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_KEY, blob);
}

// ---------------------------------------------------------------------------
// Cloud operations
// ---------------------------------------------------------------------------

/** Fetch the user's encrypted data from Supabase. Returns null if none exists. */
export async function cloudLoad(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("encrypted_data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[cloudSync] load failed", error.message);
    return null;
  }

  return data?.encrypted_data ?? null;
}

/** Upsert the user's encrypted data to Supabase. */
export async function cloudSave(userId: string): Promise<{ error: string | null }> {
  const blob = getLocalEncrypted();
  if (!blob) return { error: "No local data to save." };

  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      encrypted_data: blob,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[cloudSync] save failed", error.message);
    return { error: error.message };
  }
  return { error: null };
}

/**
 * Pull cloud data into localStorage, then reload so Zustand re-hydrates
 * from the freshly-written encrypted blob.
 */
export async function cloudRestore(userId: string): Promise<{ error: string | null }> {
  const blob = await cloudLoad(userId);
  if (!blob) return { error: "No cloud backup found for this account." };

  setLocalEncrypted(blob);
  // Reload so Zustand re-hydrates from the updated localStorage
  window.location.reload();
  return { error: null };
}
