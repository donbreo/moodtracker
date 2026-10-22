import { describe, expect, it } from "vitest";
import { createDefaultEntry } from "./defaults";
import { validateJournalEntry } from "./validation";

describe("journal validation", () => {
  it("accepts a valid entry", () => {
    expect(validateJournalEntry(createDefaultEntry("2026-10-22")).valid).toBe(true);
  });

  it("rejects invalid numeric values", () => {
    const entry = createDefaultEntry("2026-10-22");
    entry.mood.overall = 11;
    entry.physical.pain = -1;
    entry.sleep.duration_hours = 25;
    const result = validateJournalEntry(entry);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(3);
  });

  it("rejects impossible calendar dates", () => {
    expect(validateJournalEntry(createDefaultEntry("2026-02-30")).valid).toBe(false);
  });
});
