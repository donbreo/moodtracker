import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  calculateAverageEnergy,
  calculateAverageFocus,
  calculateAverageMood,
  calculateAverageStress,
  calculateMoodTrend,
  entriesInLastDays,
} from "../lib/analytics";
import type { JournalEntry } from "../types/journal";

interface DashboardProps {
  entries: JournalEntry[];
  selectedEntry: JournalEntry | null;
  throughDate: string;
}

function displayAverage(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}

export function Dashboard({ entries, selectedEntry, throughDate }: DashboardProps) {
  const recentEntries = entriesInLastDays(entries, 7, throughDate);
  const trend = calculateMoodTrend(recentEntries).map((point) => ({
    ...point,
    label: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", timeZone: "UTC" }).format(
      new Date(`${point.date}T00:00:00Z`),
    ),
  }));
  const averages = [
    ["Mood", calculateAverageMood(recentEntries)],
    ["Stress", calculateAverageStress(recentEntries)],
    ["Energy", calculateAverageEnergy(recentEntries)],
    ["Focus", calculateAverageFocus(recentEntries)],
  ] as const;

  return (
    <section aria-labelledby="dashboard-title" className="mb-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow">Your overview</p>
          <h2 id="dashboard-title" className="mt-1 font-serif text-2xl font-semibold text-ink">
            A quiet look at your week
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          {entries.length} completed {entries.length === 1 ? "check-in" : "check-ins"}
        </p>
      </div>

      {selectedEntry && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Mood", selectedEntry.mood.overall],
            ["Energy", selectedEntry.cognition.energy],
            ["Stress", selectedEntry.mood.stress],
            ["Focus", selectedEntry.cognition.focus],
          ].map(([label, value]) => (
            <div className="summary-tile" key={label}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
              <p className="mt-2 font-serif text-3xl font-semibold text-ink">
                {value}<span className="text-base font-normal text-slate-400">/10</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.6fr]">
        <div className="card !p-5">
          <h3 className="text-sm font-semibold text-ink">7-day averages</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {averages.map(([label, value]) => (
              <div className="rounded-xl bg-sage-50 p-3" key={label}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-xl font-semibold text-sage-700">{displayAverage(value)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card min-h-64 !p-5">
          <h3 className="text-sm font-semibold text-ink">Mood trend</h3>
          {trend.length < 2 ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-sage-300 bg-sage-50/50 px-6 text-center text-sm leading-6 text-slate-500">
              Save check-ins on at least two days to see your mood trend.
            </div>
          ) : (
            <div className="mt-3 h-52" aria-label="Seven-day mood trend chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 8, left: -26, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#61836a" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#61836a" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7e2" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis domain={[1, 10]} ticks={[1, 5, 10]} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#4c6b55"
                    strokeWidth={2.5}
                    fill="url(#moodFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
