import { describe, expect, it } from "vitest";
import { isValidIsoDate, toLocalIsoDate } from "./date";

describe("date helpers", () => {
  it("formats a local date without UTC shifting", () => {
    expect(toLocalIsoDate(new Date(2026, 9, 22, 23, 30))).toBe("2026-10-22");
  });

  it("validates ISO dates exactly", () => {
    expect(isValidIsoDate("2024-02-29")).toBe(true);
    expect(isValidIsoDate("2025-02-29")).toBe(false);
    expect(isValidIsoDate("10/22/2026")).toBe(false);
  });
});
