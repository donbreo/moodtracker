import type { JournalEntry } from "../types/journal";
import { toLocalIsoDate } from "./date";

export function createDefaultEntry(date = toLocalIsoDate()): JournalEntry {
  return {
    date,
    mood: {
      overall: 5,
      positive_affect: 5,
      negative_affect: 5,
      stress: 5,
      anxiety: 5,
      irritability: 5,
      loneliness: 5,
      calmness: 5,
    },
    cognition: { energy: 5, focus: 5, motivation: 5, mental_fatigue: 5 },
    physical: { wellbeing: 5, pain: 0, tiredness: 5 },
    social: { connection: 5, satisfaction: 5 },
    coping: { challenge_handling: 5 },
    sleep: { duration_hours: 8, quality: 5, restedness: 5 },
    context: {
      day_type: "workday",
      activity: "work",
      location: "home",
      social_context: "alone",
    },
    events: { best: "", worst: "", other: "", impact: 0 },
    journal: "",
  };
}
