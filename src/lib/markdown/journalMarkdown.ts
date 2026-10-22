import yaml from "js-yaml";
import type { JournalEntry } from "../../types/journal";
import { createDefaultEntry } from "../defaults";
import { assertValidJournalEntry } from "../validation";

type EntryMetadata = Omit<JournalEntry, "journal">;

export function serializeJournalEntry(entry: JournalEntry): string {
  assertValidJournalEntry(entry);
  const { journal, ...metadata } = entry;
  const frontmatter = yaml.dump(metadata, {
    noRefs: true,
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
  });
  return `---\n${frontmatter}---\n\n# Journal\n\n${journal}`;
}

export function parseJournalEntry(markdown: string): JournalEntry {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error("Journal is missing valid YAML frontmatter.");

  const parsed: unknown = yaml.load(match[1]);
  if (typeof parsed !== "object" || parsed === null || !("date" in parsed)) {
    throw new Error("Journal frontmatter must contain a date.");
  }

  const metadata = parsed as Partial<EntryMetadata> & { date: string };
  const defaults = createDefaultEntry(metadata.date);
  const body = match[2]
    .replace(/^\s*# Journal\s*(?:\r?\n)?/, "")
    .replace(/^\r?\n/, "");
  const entry: JournalEntry = {
    ...defaults,
    ...metadata,
    mood: { ...defaults.mood, ...metadata.mood },
    cognition: { ...defaults.cognition, ...metadata.cognition },
    physical: { ...defaults.physical, ...metadata.physical },
    social: { ...defaults.social, ...metadata.social },
    coping: { ...defaults.coping, ...metadata.coping },
    sleep: { ...defaults.sleep, ...metadata.sleep },
    context: { ...defaults.context, ...metadata.context },
    events: { ...defaults.events, ...metadata.events },
    journal: body,
  };
  assertValidJournalEntry(entry);
  return entry;
}
