import { describe, expect, it } from "vitest";
import { createDefaultEntry } from "../defaults";
import { parseJournalEntry, serializeJournalEntry } from "./journalMarkdown";

describe("journal Markdown adapter", () => {
  it("round-trips a complete entry with multiline and special Markdown", () => {
    const entry = createDefaultEntry("2026-10-22");
    entry.mood.overall = 8;
    entry.events.best = 'A "quoted" moment: yes';
    entry.journal = "First paragraph.\n\n## Notes\n\n- calm\n- **present**";

    expect(parseJournalEntry(serializeJournalEntry(entry))).toEqual(entry);
  });

  it("supports an empty journal body", () => {
    const entry = createDefaultEntry("2026-10-22");
    entry.journal = "";
    expect(parseJournalEntry(serializeJournalEntry(entry)).journal).toBe("");
  });

  it("fills missing optional metadata with defaults", () => {
    const markdown = `---
date: 2026-10-22
mood:
  overall: 7
---

# Journal

Hello`;
    const parsed = parseJournalEntry(markdown);
    expect(parsed.mood.overall).toBe(7);
    expect(parsed.mood.stress).toBe(5);
    expect(parsed.events.best).toBe("");
    expect(parsed.journal).toBe("Hello");
  });

  it("reports malformed source instead of inventing data", () => {
    expect(() => parseJournalEntry("not frontmatter")).toThrow("frontmatter");
  });
});
