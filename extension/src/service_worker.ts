/**
 * service_worker.ts
 * - Receives CHAT_EVENT from content_script
 * - Calls the local server (AI) to get DRAFT / NEEDS_USER / WAITING
 * - Stores result so popup can show it
 * - If Autopilot is ON: sends INSERT_AND_SEND to the tab
 */

import type { ChatEvent, ServerResult } from "./types";

const SERVER = "http://localhost:8787";

const lastAnalyze = new Map<number, number>();
const lastHash = new Map<number, string>();
const draftCache = new Map<string, { draft: string; timestamp: number }>();

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function callServerWithRetry(
  msg: Record<string, unknown>,
  retries = 3
): Promise<ServerResult> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const resp = await fetch(`${SERVER}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!resp.ok) throw new Error(`Server status ${resp.status}`);
      return (await resp.json()) as ServerResult;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error("Exhausted retries");
}

chrome.runtime.onMessage.addListener((msg: ChatEvent, sender) => {
  if (!msg || msg.type !== "CHAT_EVENT") return;

  (async () => {
    const tabId = sender?.tab?.id;
    if (!tabId) return;

    const now = Date.now();

    // Throttle: only analyze every 3 seconds per tab
    if (now - (lastAnalyze.get(tabId) || 0) < 3000) return;
    lastAnalyze.set(tabId, now);

    // Hash check: if transcript hasn't changed, ignore
    const currentHash = await sha256(msg.transcript || "");
    if (lastHash.get(tabId) === currentHash) return;
    lastHash.set(tabId, currentHash);

    // Check cache
    const cached = draftCache.get(currentHash);
    if (cached && now - cached.timestamp < 60000) {
      await chrome.storage.local.set({
        lastResult: {
          action: "DRAFT",
          draft: cached.draft,
          meta: { capturedAt: new Date().toISOString() },
        },
      });
      await chrome.action.setBadgeText({ text: "" });
      return;
    }

    const { autopilotEnabled, userContext } = await chrome.storage.local.get([
      "autopilotEnabled",
      "userContext",
    ]);

    try {
      const data = await callServerWithRetry({
        ...msg,
        userContext: (userContext as string) || "",
      });

      if (data.action === "WAITING") {
        await chrome.action.setBadgeText({ text: "..." });
        await chrome.action.setBadgeBackgroundColor({ color: "#9E9E9E" });
        await chrome.storage.local.set({ lastResult: data });
        return;
      }

      if (data.action === "NEEDS_USER") {
        await chrome.action.setBadgeText({ text: "!" });
        await chrome.action.setBadgeBackgroundColor({ color: "#ff9800" });
        await chrome.storage.local.set({ lastResult: data });
        return;
      }

      await chrome.storage.local.set({
        lastResult: { ...data, meta: { capturedAt: new Date().toISOString() } },
      });
      await chrome.action.setBadgeText({ text: "" });

      if (data.action === "DRAFT" && data.draft) {
        draftCache.set(currentHash, { draft: data.draft, timestamp: now });
      }

      if (autopilotEnabled && data.action === "DRAFT" && data.draft) {
        try {
          chrome.tabs.sendMessage(tabId, { type: "INSERT_AND_SEND", text: data.draft });
        } catch (insertErr) {
          console.warn("Autopilot: Could not send draft to content script.", insertErr);
        }
      }
    } catch (e) {
      const err = e as Error;
      const isNetworkError = err.name === "AbortError" || e instanceof TypeError;

      if (isNetworkError) {
        console.warn("Support Bot Server is offline.");
        await chrome.action.setBadgeText({ text: "OFF" });
        await chrome.action.setBadgeBackgroundColor({ color: "#999" });
      } else {
        console.error("Support Bot Error:", e);
        await chrome.action.setBadgeText({ text: "ERR" });
        await chrome.action.setBadgeBackgroundColor({ color: "#F44336" });
      }

      await chrome.storage.local.set({
        lastResult: { action: "ERROR", error: String(err.message || e) },
      });
    }
  })();
});
