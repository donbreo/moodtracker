import type { JournalEntry, JournalStore } from "../../types/journal";
import { assertValidJournalEntry } from "../validation";

export const STORAGE_KEY = "mood-journal:v1";

export class LocalStorageJournalStore implements JournalStore {
  constructor(private readonly storage: Storage = window.localStorage) {}

  async save(entry: JournalEntry): Promise<void> {
    assertValidJournalEntry(entry);
    const entries = await this.getAll();
    const next = entries.filter((item) => item.date !== entry.date);
    next.push(entry);
    this.write(next);
  }

  async get(date: string): Promise<JournalEntry | null> {
    return (await this.getAll()).find((entry) => entry.date === date) ?? null;
  }

  async getAll(): Promise<JournalEntry[]> {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Saved journal data is not a valid collection.");
    const entries = parsed as JournalEntry[];
    entries.forEach(assertValidJournalEntry);
    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }

  async delete(date: string): Promise<void> {
    this.write((await this.getAll()).filter((entry) => entry.date !== date));
  }

  async replaceAll(entries: JournalEntry[]): Promise<void> {
    entries.forEach(assertValidJournalEntry);
    const unique = new Map(entries.map((entry) => [entry.date, entry]));
    this.write([...unique.values()]);
  }

  private write(entries: JournalEntry[]): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
}

export function exportEntries(entries: JournalEntry[]): string {
  entries.forEach(assertValidJournalEntry);
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), entries }, null, 2);
}

export function parseEntriesImport(raw: string): JournalEntry[] {
  const parsed: unknown = JSON.parse(raw);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("entries" in parsed) ||
    !Array.isArray(parsed.entries)
  ) {
    throw new Error("Import file must contain an entries array.");
  }
  const entries = parsed.entries as JournalEntry[];
  entries.forEach(assertValidJournalEntry);
  return entries;
}
