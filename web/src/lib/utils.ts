export const EMPTY_VALUE = "-";

export function splitList(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatDateTime(isoString: string): { date: string; time: string } {
  if (!isoString) return { date: "", time: "" };
  const dateObj = new Date(isoString);
  if (Number.isNaN(dateObj.getTime())) return { date: isoString, time: "" };
  const date = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
  return { date, time };
}

export function safeText(value: string | undefined | null, fallback = EMPTY_VALUE): string {
  if (!value || !value.trim()) return fallback;
  return value;
}

export function createTimelineLabel(title: string, detail: string): string {
  return detail ? `${title}: ${detail}` : title;
}
