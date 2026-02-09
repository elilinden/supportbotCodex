/**
 * Simple XOR-based obfuscation for localStorage data.
 * This is NOT cryptographic security — it prevents casual inspection
 * of sensitive case data in browser storage. For true encryption,
 * use the Web Crypto API with a user-derived key.
 */

const STORAGE_KEY_PREFIX = "ny-op-enc-";

function getOrCreateKey(): string {
  const existing = sessionStorage.getItem(STORAGE_KEY_PREFIX + "k");
  if (existing) return existing;
  const key = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  sessionStorage.setItem(STORAGE_KEY_PREFIX + "k", key);
  return key;
}

function xorEncode(data: string, key: string): string {
  const encoded = Array.from(data).map((char, i) => {
    return String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length));
  }).join("");
  return btoa(encoded);
}

function xorDecode(encoded: string, key: string): string {
  const decoded = atob(encoded);
  return Array.from(decoded).map((char, i) => {
    return String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length));
  }).join("");
}

export function createEncryptedStorage() {
  return {
    getItem(name: string): string | null {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      try {
        // Try decoding as encrypted
        if (raw.startsWith("ENC:")) {
          const key = getOrCreateKey();
          return xorDecode(raw.slice(4), key);
        }
        // Fallback: read plaintext (migration from old unencrypted data)
        return raw;
      } catch {
        return raw;
      }
    },
    setItem(name: string, value: string): void {
      if (typeof window === "undefined") return;
      const key = getOrCreateKey();
      localStorage.setItem(name, "ENC:" + xorEncode(value, key));
    },
    removeItem(name: string): void {
      if (typeof window === "undefined") return;
      localStorage.removeItem(name);
    }
  } as Storage;
}

/** Export all case data as a downloadable JSON blob */
export function exportCaseData(): void {
  const raw = localStorage.getItem("ny-op-case-store");
  if (!raw) return;
  const blob = new Blob([raw], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `case-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Securely wipe all case data from localStorage */
export function wipeCaseData(): void {
  localStorage.removeItem("ny-op-case-store");
  sessionStorage.removeItem(STORAGE_KEY_PREFIX + "k");
}
