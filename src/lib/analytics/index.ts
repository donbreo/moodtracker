import type { JournalEntry } from "../../types/journal";

export interface TrendPoint {
  date: string;
  mood: number;
  stress: number;
  energy: number;
  focus: number;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function entriesInLastDays(
  entries: JournalEntry[],
  days: number,
  throughDate: string,
): JournalEntry[] {
  const end = new Date(`${throughDate}T00:00:00Z`).getTime();
  const start = end - (days - 1) * 86_400_000;
  return entries.filter((entry) => {
    const time = new Date(`${entry.date}T00:00:00Z`).getTime();
    return time >= start && time <= end;
  });
}

export const calculateAverageMood = (entries: JournalEntry[]) =>
  average(entries.map((entry) => entry.mood.overall));
export const calculateAverageStress = (entries: JournalEntry[]) =>
  average(entries.map((entry) => entry.mood.stress));
export const calculateAverageEnergy = (entries: JournalEntry[]) =>
  average(entries.map((entry) => entry.cognition.energy));
export const calculateAverageFocus = (entries: JournalEntry[]) =>
  average(entries.map((entry) => entry.cognition.focus));

export function calculateMoodTrend(entries: JournalEntry[]): TrendPoint[] {
  return [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({
      date: entry.date,
      mood: entry.mood.overall,
      stress: entry.mood.stress,
      energy: entry.cognition.energy,
      focus: entry.cognition.focus,
    }));
}

export function calculateCompletionRate(entries: JournalEntry[], days: number): number {
  if (days <= 0) return 0;
  return Math.min(100, (new Set(entries.map((entry) => entry.date)).size / days) * 100);
}
