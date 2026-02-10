// src/lib/encryption.ts
import CryptoJS from "crypto-js";
import type { StateStorage } from "zustand/middleware";

/**
 * Versioned envelope encryption for Zustand persisted storage.
 * - AES-CBC with random IV
 * - PBKDF2-derived keys (enc + mac)
 * - HMAC-SHA256 for tamper detection
 *
 * NOTE: Client-side encryption cannot protect data from a compromised browser/device.
 */

const ENV_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY;

// Allow fallback only for dev to avoid breaking local setup
const FALLBACK_KEY = "dev-fallback-secret-key-change-me";

const SECRET_KEY =
  ENV_KEY ||
  (process.env.NODE_ENV === "production"
    ? (() => {
        console.error(
          "[encryption] NEXT_PUBLIC_STORAGE_KEY is missing in production. Using fallback is insecure."
        );
        return FALLBACK_KEY;
      })()
    : FALLBACK_KEY);

const VERSION = 1;

// Tunables
const PBKDF2_ITERATIONS = 200_000;
const SALT_BYTES = 16;
const IV_BYTES = 16;

type EnvelopeV1 = {
  v: 1;
  alg: "AES-CBC+HMAC";
  it: number;
  s: string;   // base64 salt
  iv: string;  // base64 iv
  ct: string;  // base64 ciphertext
  mac: string; // hex HMAC over payload
};

// The MAC payload does NOT need `alg`; keep it stable and minimal.
type MacPayloadInput = Pick<EnvelopeV1, "v" | "it" | "s" | "iv" | "ct">;

function b64(wordArray: CryptoJS.lib.WordArray): string {
  return CryptoJS.enc.Base64.stringify(wordArray);
}

function fromB64(b64str: string): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Base64.parse(b64str);
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function deriveKeys(secret: string, salt: CryptoJS.lib.WordArray, iterations: number) {
  // Derive 64 bytes total; split into encKey (32) + macKey (32)
  const dk = CryptoJS.PBKDF2(secret, salt, {
    keySize: 64 / 4, // CryptoJS keySize is in 32-bit words
    iterations,
    hasher: CryptoJS.algo.SHA256
  });

  const encKey = CryptoJS.lib.WordArray.create(dk.words.slice(0, 8), 32);
  const macKey = CryptoJS.lib.WordArray.create(dk.words.slice(8, 16), 32);

  return { encKey, macKey };
}

function buildMacPayload(env: MacPayloadInput): string {
  // Stable string for MAC computation (do NOT change order)
  return `${env.v}|${env.it}|${env.s}|${env.iv}|${env.ct}`;
}

function computeMac(macKey: CryptoJS.lib.WordArray, payload: string): string {
  return CryptoJS.HmacSHA256(payload, macKey).toString(CryptoJS.enc.Hex);
}

// Best-effort constant-time compare for hex strings (reduces timing leaks a bit)
function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function encrypt(value: string): string {
  // If it's already an envelope, return as-is
  const maybeEnv = safeJsonParse<EnvelopeV1>(value);
  if (maybeEnv?.v === 1 && maybeEnv?.ct && maybeEnv?.mac) return value;

  try {
    const salt = CryptoJS.lib.WordArray.random(SALT_BYTES);
    const iv = CryptoJS.lib.WordArray.random(IV_BYTES);

    const { encKey, macKey } = deriveKeys(SECRET_KEY, salt, PBKDF2_ITERATIONS);

    const encrypted = CryptoJS.AES.encrypt(value, encKey, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const envNoMac: Omit<EnvelopeV1, "mac"> = {
      v: VERSION,
      alg: "AES-CBC+HMAC",
      it: PBKDF2_ITERATIONS,
      s: b64(salt),
      iv: b64(iv),
      ct: b64(encrypted.ciphertext)
    };

    const macPayload = buildMacPayload({
      v: envNoMac.v,
      it: envNoMac.it,
      s: envNoMac.s,
      iv: envNoMac.iv,
      ct: envNoMac.ct
    });

    const mac = computeMac(macKey, macPayload);
    const envelope: EnvelopeV1 = { ...envNoMac, mac };

    return JSON.stringify(envelope);
  } catch (e) {
    console.error("[encryption] encrypt failed", e);
    // Fail open to avoid bricking the app
    return value;
  }
}

export function decrypt(stored: string): string {
  // Backwards compatibility: if not JSON envelope, return as-is
  const env = safeJsonParse<EnvelopeV1>(stored);
  if (!env || env.v !== 1 || !env.s || !env.iv || !env.ct || !env.mac) {
    return stored;
  }

  try {
    const salt = fromB64(env.s);
    const iv = fromB64(env.iv);
    const ciphertext = fromB64(env.ct);

    const { encKey, macKey } = deriveKeys(SECRET_KEY, salt, env.it || PBKDF2_ITERATIONS);

    // Verify MAC first
    const macPayload = buildMacPayload({
      v: env.v,
      it: env.it,
      s: env.s,
      iv: env.iv,
      ct: env.ct
    });

    const expectedMac = computeMac(macKey, macPayload);

    if (!safeEqualHex(expectedMac, env.mac)) {
      console.warn("[encryption] MAC mismatch (data may be tampered).");
      return "";
    }

    const decrypted = CryptoJS.AES.decrypt({ ciphertext } as CryptoJS.lib.CipherParams, encKey, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    return plaintext || "";
  } catch (e) {
    console.error("[encryption] decrypt failed", e);
    return "";
  }
}

// Zustand storage engine (sync)
export const encryptedStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const value = window.localStorage.getItem(name);
    if (!value) return null;

    const out = decrypt(value);
    return out ? out : null;
  },

  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, encrypt(value));
    } catch (e) {
      console.error("[encryption] setItem failed", e);
      // Fail open
      try {
        window.localStorage.setItem(name, value);
      } catch {}
    }
  },

  removeItem: (name) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
  }
};