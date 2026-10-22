import { describe, expect, it } from "vitest";
import { createDefaultEntry } from "../defaults";
import {
  calculateAverageMood,
  calculateCompletionRate,
  calculateMoodTrend,
  entriesInLastDays,
} from ".";

describe("analytics", () => {
  it("returns no average for an empty dataset", () => {
    expect(calculateAverageMood([])).toBeNull();
    expect(calculateMoodTrend([])).toEqual([]);
  });

  it("handles a one-entry dataset", () => {
    const entry = createDefaultEntry("2026-10-22");
    entry.mood.overall = 8;
    expect(calculateAverageMood([entry])).toBe(8);
    expect(calculateMoodTrend([entry])).toHaveLength(1);
  });

  it("calculates multiple days in a bounded seven-day window", () => {
    const old = createDefaultEntry("2026-10-14");
    const recent = createDefaultEntry("2026-10-18");
    const today = createDefaultEntry("2026-10-22");
    recent.mood.overall = 6;
    today.mood.overall = 8;
    const entries = entriesInLastDays([old, today, recent], 7, "2026-10-22");
    expect(entries).toHaveLength(2);
    expect(calculateAverageMood(entries)).toBe(7);
  });

  it("deduplicates dates for completion rate", () => {
    const entry = createDefaultEntry("2026-10-22");
    expect(calculateCompletionRate([entry, entry], 7)).toBeCloseTo(100 / 7);
  });
});
