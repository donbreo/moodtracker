export interface JournalEntry {
  date: string;
  mood: {
    overall: number;
    positive_affect: number;
    negative_affect: number;
    stress: number;
    anxiety: number;
    irritability: number;
    loneliness: number;
    calmness: number;
  };
  cognition: {
    energy: number;
    focus: number;
    motivation: number;
    mental_fatigue: number;
  };
  physical: {
    wellbeing: number;
    pain: number;
    tiredness: number;
  };
  social: {
    connection: number;
    satisfaction: number;
  };
  coping: {
    challenge_handling: number;
  };
  sleep: {
    duration_hours: number;
    quality: number;
    restedness: number;
  };
  context: {
    day_type: string;
    activity: string;
    location: string;
    social_context: string;
  };
  events: {
    best: string;
    worst: string;
    other: string;
    impact: number;
  };
  journal: string;
}

export type MetricGroup = "mood" | "cognition" | "physical" | "social" | "coping" | "sleep";

export interface JournalStore {
  save(entry: JournalEntry): Promise<void>;
  get(date: string): Promise<JournalEntry | null>;
  getAll(): Promise<JournalEntry[]>;
  delete(date: string): Promise<void>;
  replaceAll(entries: JournalEntry[]): Promise<void>;
}
