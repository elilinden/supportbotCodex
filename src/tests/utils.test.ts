import { describe, expect, it } from "vitest";
import {
  EMPTY_VALUE,
  splitList,
  formatDateTime,
  safeText,
  createTimelineLabel
} from "@/lib/utils";

describe("splitList", () => {
  it("splits by commas", () => {
    expect(splitList("apple, banana, cherry")).toEqual(["apple", "banana", "cherry"]);
  });

  it("splits by newlines", () => {
    expect(splitList("apple\nbanana\ncherry")).toEqual(["apple", "banana", "cherry"]);
  });

  it("splits by mixed commas and newlines", () => {
    expect(splitList("apple, banana\ncherry")).toEqual(["apple", "banana", "cherry"]);
  });

  it("trims whitespace from items", () => {
    expect(splitList("  apple ,  banana  , cherry  ")).toEqual(["apple", "banana", "cherry"]);
  });

  it("filters out empty items", () => {
    expect(splitList("apple,,banana,,,cherry")).toEqual(["apple", "banana", "cherry"]);
  });

  it("returns empty array for empty string", () => {
    expect(splitList("")).toEqual([]);
  });

  it("returns empty array for undefined (cast as any)", () => {
    expect(splitList(undefined as unknown as string)).toEqual([]);
  });

  it("returns a single-element array when there are no delimiters", () => {
    expect(splitList("apple")).toEqual(["apple"]);
  });
});

describe("formatDateTime", () => {
  it("returns formatted date and time for a valid ISO string", () => {
    const result = formatDateTime("2024-06-15T14:30:00Z");
    expect(result.date).toBeTruthy();
    expect(result.time).toBeTruthy();
    // Should contain the year
    expect(result.date).toContain("2024");
  });

  it("returns date containing month abbreviation for a valid ISO string", () => {
    const result = formatDateTime("2024-01-05T09:00:00Z");
    expect(result.date).toBeTruthy();
    // Should contain a recognizable date
    expect(result.date).toMatch(/Jan/);
  });

  it("returns empty strings for empty input", () => {
    const result = formatDateTime("");
    expect(result.date).toBe("");
    expect(result.time).toBe("");
  });

  it("returns the original string as date for an invalid date string", () => {
    const result = formatDateTime("not-a-date");
    expect(result.date).toBe("not-a-date");
    expect(result.time).toBe("");
  });

  it("returns empty strings for undefined (cast as any)", () => {
    const result = formatDateTime(undefined as unknown as string);
    expect(result.date).toBe("");
    expect(result.time).toBe("");
  });
});

describe("safeText", () => {
  it("returns the value when it is a non-empty string", () => {
    expect(safeText("hello")).toBe("hello");
  });

  it("returns the fallback for an empty string", () => {
    expect(safeText("")).toBe(EMPTY_VALUE);
  });

  it("returns the fallback for a whitespace-only string", () => {
    expect(safeText("   ")).toBe(EMPTY_VALUE);
  });

  it("returns the fallback for undefined", () => {
    expect(safeText(undefined)).toBe(EMPTY_VALUE);
  });

  it("returns the fallback for null", () => {
    expect(safeText(null)).toBe(EMPTY_VALUE);
  });

  it("returns a custom fallback when provided", () => {
    expect(safeText("", "N/A")).toBe("N/A");
  });

  it("returns EMPTY_VALUE as '-'", () => {
    expect(EMPTY_VALUE).toBe("-");
  });
});

describe("createTimelineLabel", () => {
  it("returns 'title: detail' when detail is provided", () => {
    expect(createTimelineLabel("Incident", "at the park")).toBe("Incident: at the park");
  });

  it("returns just the title when detail is an empty string", () => {
    expect(createTimelineLabel("Incident", "")).toBe("Incident");
  });

  it("returns title with detail when detail has content", () => {
    expect(createTimelineLabel("Event", "details here")).toBe("Event: details here");
  });
});
