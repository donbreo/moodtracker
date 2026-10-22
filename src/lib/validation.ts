import type { JournalEntry } from "../types/journal";
import { isValidIsoDate } from "./date";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const METRIC_PATHS: Array<[string, number]> = [
  ["mood.overall", 1],
  ["mood.positive_affect", 1],
  ["mood.negative_affect", 1],
  ["mood.stress", 1],
  ["mood.anxiety", 1],
  ["mood.irritability", 1],
  ["mood.loneliness", 1],
  ["mood.calmness", 1],
  ["cognition.energy", 1],
  ["cognition.focus", 1],
  ["cognition.motivation", 1],
  ["cognition.mental_fatigue", 1],
  ["physical.wellbeing", 1],
  ["physical.pain", 0],
  ["physical.tiredness", 1],
  ["social.connection", 1],
  ["social.satisfaction", 1],
  ["coping.challenge_handling", 1],
  ["sleep.quality", 1],
  ["sleep.restedness", 1],
];

function readPath(entry: JournalEntry, path: string): number {
  const [group, field] = path.split(".");
  return (entry[group as keyof JournalEntry] as unknown as Record<string, number>)[field];
}

export function validateJournalEntry(entry: JournalEntry): ValidationResult {
  const errors: string[] = [];
  if (!isValidIsoDate(entry.date)) errors.push("Date must be a valid ISO date.");

  for (const [path, minimum] of METRIC_PATHS) {
    const value = readPath(entry, path);
    if (!Number.isFinite(value) || value < minimum || value > 10) {
      errors.push(`${path} must be between ${minimum} and 10.`);
    }
  }

  if (
    !Number.isFinite(entry.sleep.duration_hours) ||
    entry.sleep.duration_hours < 0 ||
    entry.sleep.duration_hours > 24
  ) {
    errors.push("Sleep duration must be between 0 and 24 hours.");
  }
  if (
    !Number.isFinite(entry.events.impact) ||
    entry.events.impact < -5 ||
    entry.events.impact > 5
  ) {
    errors.push("Event impact must be between -5 and 5.");
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidJournalEntry(entry: JournalEntry): void {
  const result = validateJournalEntry(entry);
  if (!result.valid) throw new Error(result.errors.join(" "));
}
