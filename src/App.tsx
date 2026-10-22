import { useEffect, useMemo, useRef, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { MetricSlider } from "./components/MetricSlider";
import { SectionCard } from "./components/SectionCard";
import { formatLongDate, toLocalIsoDate } from "./lib/date";
import { createDefaultEntry } from "./lib/defaults";
import {
  exportEntries,
  LocalStorageJournalStore,
  parseEntriesImport,
} from "./lib/storage/localStorageJournalStore";
import { validateJournalEntry } from "./lib/validation";
import type { JournalEntry } from "./types/journal";

const dayTypes = ["workday", "weekend", "holiday", "sick day", "other"];
const activities = [
  "work", "study", "exercise", "eating", "commuting",
  "socializing", "relaxing", "entertainment", "browsing", "other",
];
const locations = ["home", "work", "outdoors", "transport", "other"];
const socialContexts = ["alone", "partner", "family", "friends", "colleagues", "other"];
const REVIEWABLE_FIELDS = 24;

type StructuredGroup = Exclude<keyof JournalEntry, "date" | "journal">;
type Status = { kind: "idle" | "success" | "error"; message: string };

function titleCase(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function downloadBackup(entries: JournalEntry[]) {
  const blob = new Blob([exportEntries(entries)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `stillday-journal-${toLocalIsoDate()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <select className="input capitalize" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{titleCase(option)}</option>)}
      </select>
    </label>
  );
}

function App() {
  const store = useMemo(() => new LocalStorageJournalStore(), []);
  const [selectedDate, setSelectedDate] = useState(toLocalIsoDate);
  const [entry, setEntry] = useState(() => createDefaultEntry(selectedDate));
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    store.getAll()
      .then((savedEntries) => {
        if (!active) return;
        setEntries(savedEntries);
        const saved = savedEntries.find((item) => item.date === selectedDate);
        setEntry(saved ?? createDefaultEntry(selectedDate));
        setReviewed(saved ? new Set(Array.from({ length: REVIEWABLE_FIELDS }, (_, index) => String(index))) : new Set());
      })
      .catch((error: unknown) => {
        if (active) setStatus({ kind: "error", message: error instanceof Error ? error.message : "Could not load saved data." });
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [selectedDate, store]);

  const touch = (field: string) => {
    setReviewed((current) => new Set(current).add(field));
    if (status.kind !== "idle") setStatus({ kind: "idle", message: "" });
  };

  const updateField = (
    group: StructuredGroup,
    field: string,
    value: string | number,
  ) => {
    setEntry((current) => ({
      ...current,
      [group]: { ...current[group], [field]: value },
    }));
    touch(`${group}.${field}`);
  };

  const updateJournal = (field: "journal" | "date", value: string) => {
    setEntry((current) => ({ ...current, [field]: value }));
    touch(field);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setStatus({ kind: "idle", message: "" });
  };

  const handleSave = async () => {
    const validation = validateJournalEntry(entry);
    if (!validation.valid) {
      setStatus({ kind: "error", message: validation.errors[0] });
      return;
    }
    setSaving(true);
    try {
      await store.save(entry);
      const savedEntries = await store.getAll();
      setEntries(savedEntries);
      setReviewed(new Set(Array.from({ length: REVIEWABLE_FIELDS }, (_, index) => String(index))));
      setStatus({ kind: "success", message: "Saved locally. A portable backup was downloaded too." });
      downloadBackup(savedEntries);
    } catch (error: unknown) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Save failed. Your form has been kept intact." });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    try {
      downloadBackup(entries);
      setStatus({ kind: "success", message: "Your journal backup is ready." });
    } catch (error: unknown) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Export failed." });
    }
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const imported = parseEntriesImport(await file.text());
      await store.replaceAll(imported);
      const savedEntries = await store.getAll();
      setEntries(savedEntries);
      const selected = savedEntries.find((item) => item.date === selectedDate);
      setEntry(selected ?? createDefaultEntry(selectedDate));
      setStatus({ kind: "success", message: `Imported ${imported.length} check-in${imported.length === 1 ? "" : "s"}.` });
    } catch (error: unknown) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Import failed. Existing data was not changed." });
    } finally {
      if (importInput.current) importInput.current.value = "";
    }
  };

  const savedForDate = entries.find((item) => item.date === selectedDate) ?? null;
  const progress = Math.min(100, Math.round((reviewed.size / REVIEWABLE_FIELDS) * 100));

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Opening your journal…</div>;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#" className="font-serif text-xl font-semibold text-ink">Stillday</a>
          <div className="flex items-center gap-2">
            <input
              ref={importInput}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => void handleImport(event.target.files?.[0])}
              aria-label="Import journal backup"
            />
            <button type="button" className="button-secondary !min-h-10 !px-3" onClick={() => importInput.current?.click()}>
              Import
            </button>
            <button type="button" className="button-secondary !min-h-10 !px-3" onClick={handleExport} disabled={entries.length === 0}>
              Export
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-6 sm:pt-12">
        <section className="mb-10 grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow">Private · local · yours</p>
            <h1 className="mt-2 max-w-2xl font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Daily check-in
            </h1>
            <p className="mt-3 text-base text-slate-500">{formatLongDate(selectedDate)}</p>
          </div>
          <label className="w-full md:w-48">
            <span className="field-label">Entry date</span>
            <input
              className="input"
              type="date"
              value={selectedDate}
              max={toLocalIsoDate()}
              onChange={(event) => handleDateChange(event.target.value)}
            />
          </label>
        </section>

        {entries.length > 0 && <Dashboard entries={entries} selectedEntry={savedForDate} throughDate={selectedDate} />}

        <div className="mb-6 rounded-2xl border border-sage-100 bg-white px-5 py-4 shadow-card">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-ink">{savedForDate ? "Check-in complete" : "Check-in reviewed"}</span>
            <span className="font-semibold text-sage-700">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sage-100">
            <div className="h-full rounded-full bg-sage-600 transition-[width]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">Progress grows as you review or adjust each part of the check-in.</p>
        </div>

        <form onSubmit={(event) => { event.preventDefault(); void handleSave(); }} className="space-y-5">
          <SectionCard number="1" title="Emotional state" description="How are you feeling right now? There are no right answers.">
            <div className="grid gap-3 md:grid-cols-2">
              <MetricSlider label="Overall mood" value={entry.mood.overall} onChange={(value) => updateField("mood", "overall", value)} />
              <MetricSlider label="Positive affect" value={entry.mood.positive_affect} onChange={(value) => updateField("mood", "positive_affect", value)} />
              <MetricSlider label="Negative affect" value={entry.mood.negative_affect} onChange={(value) => updateField("mood", "negative_affect", value)} />
              <MetricSlider label="Stress" value={entry.mood.stress} onChange={(value) => updateField("mood", "stress", value)} />
              <MetricSlider label="Anxiety" value={entry.mood.anxiety} onChange={(value) => updateField("mood", "anxiety", value)} />
              <MetricSlider label="Irritability" value={entry.mood.irritability} onChange={(value) => updateField("mood", "irritability", value)} />
              <MetricSlider label="Loneliness" value={entry.mood.loneliness} onChange={(value) => updateField("mood", "loneliness", value)} />
              <MetricSlider label="Calmness" value={entry.mood.calmness} onChange={(value) => updateField("mood", "calmness", value)} />
            </div>
          </SectionCard>

          <SectionCard number="2" title="Cognitive state" description="A quick snapshot of your attention and mental energy.">
            <div className="grid gap-3 md:grid-cols-2">
              <MetricSlider label="Energy" value={entry.cognition.energy} onChange={(value) => updateField("cognition", "energy", value)} />
              <MetricSlider label="Focus" value={entry.cognition.focus} onChange={(value) => updateField("cognition", "focus", value)} />
              <MetricSlider label="Motivation" value={entry.cognition.motivation} onChange={(value) => updateField("cognition", "motivation", value)} />
              <MetricSlider label="Mental fatigue" value={entry.cognition.mental_fatigue} onChange={(value) => updateField("cognition", "mental_fatigue", value)} />
            </div>
          </SectionCard>

          <SectionCard number="3" title="Physical state" description="Notice how your body feels without judgment.">
            <div className="grid gap-3 md:grid-cols-3">
              <MetricSlider label="Physical wellbeing" value={entry.physical.wellbeing} onChange={(value) => updateField("physical", "wellbeing", value)} />
              <MetricSlider label="Pain" min={0} value={entry.physical.pain} onChange={(value) => updateField("physical", "pain", value)} />
              <MetricSlider label="Tiredness" value={entry.physical.tiredness} onChange={(value) => updateField("physical", "tiredness", value)} />
            </div>
          </SectionCard>

          <SectionCard number="4" title="Social & coping" description="Reflect on connection and how today’s challenges felt.">
            <div className="grid gap-3 md:grid-cols-3">
              <MetricSlider label="Social connection" value={entry.social.connection} onChange={(value) => updateField("social", "connection", value)} />
              <MetricSlider label="Social satisfaction" value={entry.social.satisfaction} onChange={(value) => updateField("social", "satisfaction", value)} />
              <MetricSlider label="Challenge handling" value={entry.coping.challenge_handling} onChange={(value) => updateField("coping", "challenge_handling", value)} />
            </div>
          </SectionCard>

          <SectionCard number="5" title="Sleep" description="Think about your most recent sleep period.">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="metric">
                <span className="font-medium text-ink">Duration in hours</span>
                <input
                  className="input mt-4"
                  type="number"
                  min="0"
                  max="24"
                  step="0.25"
                  value={entry.sleep.duration_hours}
                  onChange={(event) => updateField("sleep", "duration_hours", Number(event.target.value))}
                />
              </label>
              <MetricSlider label="Sleep quality" value={entry.sleep.quality} onChange={(value) => updateField("sleep", "quality", value)} />
              <MetricSlider label="Restedness" value={entry.sleep.restedness} onChange={(value) => updateField("sleep", "restedness", value)} />
            </div>
          </SectionCard>

          <SectionCard number="6" title="Daily context" description="A little context makes your patterns more meaningful over time.">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Day type" value={entry.context.day_type} options={dayTypes} onChange={(value) => updateField("context", "day_type", value)} />
              <SelectField label="Main activity" value={entry.context.activity} options={activities} onChange={(value) => updateField("context", "activity", value)} />
              <SelectField label="Location" value={entry.context.location} options={locations} onChange={(value) => updateField("context", "location", value)} />
              <SelectField label="Social context" value={entry.context.social_context} options={socialContexts} onChange={(value) => updateField("context", "social_context", value)} />
            </div>
          </SectionCard>

          <SectionCard number="7" title="Important events" description="Optional moments that gave shape to the day.">
            <div className="grid gap-4">
              {[
                ["best", "Best thing that happened today"],
                ["worst", "Worst thing that happened today"],
                ["other", "Anything else important"],
              ].map(([field, label]) => (
                <label key={field}>
                  <span className="field-label">{label}</span>
                  <input
                    className="input"
                    type="text"
                    value={entry.events[field as "best" | "worst" | "other"]}
                    onChange={(event) => updateField("events", field, event.target.value)}
                    placeholder="Optional"
                  />
                </label>
              ))}
              <MetricSlider label="Overall event impact" min={-5} max={5} value={entry.events.impact} hint="Negative to positive" onChange={(value) => updateField("events", "impact", value)} />
            </div>
          </SectionCard>

          <SectionCard number="8" title="Journal" description="Your words stay separate from the structured check-in and support Markdown.">
            <label>
              <span className="sr-only">Journal entry</span>
              <textarea
                className="input min-h-64 resize-y leading-7"
                value={entry.journal}
                onChange={(event) => updateJournal("journal", event.target.value)}
                placeholder="What’s on your mind? Markdown is welcome…"
              />
            </label>
          </SectionCard>

          {status.kind !== "idle" && (
            <div
              role={status.kind === "error" ? "alert" : "status"}
              className={`rounded-xl border px-4 py-3 text-sm ${
                status.kind === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-sage-300 bg-sage-50 text-sage-700"
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="sticky bottom-4 z-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-sage-100 bg-white/95 p-4 shadow-card backdrop-blur sm:flex-row">
            <p className="text-center text-sm text-slate-500 sm:text-left">
              Stored only in this browser. Saving also downloads a portable backup.
            </p>
            <button type="submit" className="button-primary w-full sm:w-auto" disabled={saving}>
              {saving ? "Saving…" : savedForDate ? "Update check-in" : "Save check-in"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default App;
