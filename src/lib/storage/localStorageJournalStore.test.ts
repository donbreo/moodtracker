import { beforeEach, describe, expect, it } from "vitest";
import { createDefaultEntry } from "../defaults";
import {
  exportEntries,
  LocalStorageJournalStore,
  parseEntriesImport,
  STORAGE_KEY,
} from "./localStorageJournalStore";

describe("LocalStorageJournalStore", () => {
  let store: LocalStorageJournalStore;

  beforeEach(() => {
    localStorage.clear();
    store = new LocalStorageJournalStore(localStorage);
  });

  it("saves, edits, retrieves, and deletes entries by date", async () => {
    const entry = createDefaultEntry("2026-10-22");
    await store.save(entry);
    entry.mood.overall = 9;
    await store.save(entry);
    expect((await store.get("2026-10-22"))?.mood.overall).toBe(9);
    expect(await store.getAll()).toHaveLength(1);
    await store.delete("2026-10-22");
    expect(await store.getAll()).toEqual([]);
  });

  it("stores multiple days newest first", async () => {
    await store.save(createDefaultEntry("2026-10-21"));
    await store.save(createDefaultEntry("2026-10-22"));
    expect((await store.getAll()).map((entry) => entry.date)).toEqual(["2026-10-22", "2026-10-21"]);
  });

  it("round-trips the portable export format", () => {
    const entries = [createDefaultEntry("2026-10-22")];
    expect(parseEntriesImport(exportEntries(entries))).toEqual(entries);
  });

  it("does not overwrite storage with invalid imports", () => {
    localStorage.setItem(STORAGE_KEY, "existing");
    expect(() => parseEntriesImport('{"entries":[{"date":"bad"}]}')).toThrow();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("existing");
  });
});
