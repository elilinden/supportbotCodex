/** Shared types for the Chrome extension */

export interface ChatEvent {
  type: "CHAT_EVENT";
  transcript: string;
  provider: "zendesk" | "intercom" | "generic";
  pageUrl: string;
}

export interface InsertMessage {
  type: "INSERT_TEXT" | "INSERT_AND_SEND";
  text: string;
}

export type ServerAction = "DRAFT" | "WAITING" | "NEEDS_USER" | "ERROR";

export interface DraftResult {
  action: "DRAFT";
  draft: string;
  meta?: { capturedAt: string };
}

export interface WaitingResult {
  action: "WAITING";
}

export interface NeedsUserResult {
  action: "NEEDS_USER";
  question: string;
}

export interface ErrorResult {
  action: "ERROR";
  error: string;
}

export type ServerResult = DraftResult | WaitingResult | NeedsUserResult | ErrorResult;

export interface InsertResult {
  ok: boolean;
  reason?: string;
  insertedInto?: {
    href: string;
    tag: string;
    id: string | null;
    className: string | null;
  };
  results?: Array<{ ok: boolean; reason?: string; href?: string }>;
}
