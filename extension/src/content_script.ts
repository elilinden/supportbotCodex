/**
 * content_script.ts
 * 1. Capture Mode (transcript scraping)
 * 2. Text Insertion (Insert Draft)
 * 3. Visual Feedback (ghost text)
 */

import type { InsertMessage } from "./types";

const DEBOUNCE_MS = 1000;

function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: unknown, ...args: unknown[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  } as unknown as T;
}

function detectProvider(): "zendesk" | "intercom" | "generic" {
  const url = window.location.href;
  if (url.includes("zendesk") || document.querySelector('[data-test-id="chat-widget"]'))
    return "zendesk";
  if (url.includes("intercom") || document.querySelector(".intercom-conversation"))
    return "intercom";
  return "generic";
}

function showGhostText(text: string | null): void {
  const existing = document.getElementById("bot-ghost");
  if (existing) existing.remove();
  if (!text) return;

  const active = document.activeElement as HTMLElement | null;
  const rect = active?.getBoundingClientRect() ?? { left: 100, top: 100 };

  const div = document.createElement("div");
  div.id = "bot-ghost";
  div.innerText = text;
  Object.assign(div.style, {
    position: "fixed",
    left: rect.left + "px",
    top: rect.top - 35 + "px",
    background: "#333",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    zIndex: "9999999",
    pointerEvents: "none",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  });
  document.body.appendChild(div);
  setTimeout(() => div?.remove(), 3500);
}

function captureTranscript(): string {
  const intercomBody = document.querySelector(".intercom-conversation-body");
  if (intercomBody) return intercomBody.textContent ?? "";
  const zendeskLog = document.querySelector('[data-test-id="chat-log"]');
  if (zendeskLog) return zendeskLog.textContent ?? "";
  return document.body.innerText.slice(-3000);
}

const handleInput = debounce((_e: Event) => {
  const target = _e.target as HTMLElement;
  if (!target.matches("input, textarea") && !target.isContentEditable) return;

  const transcript = captureTranscript();
  if (!transcript) return;

  try {
    chrome.runtime.sendMessage(
      {
        type: "CHAT_EVENT",
        transcript,
        provider: detectProvider(),
        pageUrl: window.location.href,
      },
      () => chrome.runtime.lastError
    );
  } catch {
    // Extension context invalidated
  }
}, DEBOUNCE_MS);

function setText(text: string): void {
  const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
  if (!el) return;
  el.focus();

  if ((el as HTMLElement).isContentEditable) {
    (el as HTMLElement).textContent = text;
    el.dispatchEvent(new InputEvent("input", { bubbles: true }));
  } else {
    const proto = Object.getPrototypeOf(el);
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc?.set) desc.set.call(el, text);
    else el.value = text;
    el.dispatchEvent(new InputEvent("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function trySend(): void {
  const el = document.activeElement;
  if (!el) return;
  el.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, bubbles: true })
  );
  el.dispatchEvent(
    new KeyboardEvent("keyup", { key: "Enter", keyCode: 13, bubbles: true })
  );
  const container = (el as HTMLElement).closest("form") ?? (el as HTMLElement).parentElement;
  if (container) {
    const btn = container.querySelector<HTMLButtonElement>(
      'button[type="submit"], button[aria-label*="Send"]'
    );
    if (btn) btn.click();
  }
}

document.addEventListener("input", handleInput, { capture: true });
document.addEventListener("focus", handleInput as EventListener, { capture: true });

chrome.runtime.onMessage.addListener((msg: InsertMessage) => {
  if (msg.type === "INSERT_TEXT" || msg.type === "INSERT_AND_SEND") {
    showGhostText("Drafting...");
    setTimeout(() => {
      setText(msg.text);
      if (msg.type === "INSERT_AND_SEND") setTimeout(() => trySend(), 300);
    }, 500);
  }
});

console.log("Support Bot: TypeScript Hybrid Script Loaded");
