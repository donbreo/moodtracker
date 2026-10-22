# AGENTS.md

## Project Overview

Build a local-first personal mood and journaling web application that will later become the UI foundation for a browser extension.

The application collects a short daily subjective wellbeing check-in, stores structured data locally (option to import and export data), provides basic trend analysis, and keeps the free-form journal separate from structured metadata.

The long-term architecture should support:

1. Reading mood/context metadata from webpages.
2. Writing metadata into daily Markdown files.
3. Reading metadata from Markdown files.
4. Displaying journal metadata as a browser-page overlay.
5. Analysing longitudinal mood patterns.

Markdown should eventually be the canonical source of truth.

---

## Technology

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- A lightweight charting library such as Recharts
- Browser `localStorage` for V1 persistence
- YAML frontmatter for future Markdown serialization

Do not introduce a backend, authentication system, database, cloud sync, or AI functionality in V1.

---

## Product Principles

### Local-first

The application should work entirely without an account or network connection.

User journal data is personal and should remain local unless the user explicitly adds synchronization later.

### Low friction

A daily check-in should take approximately 1–2 minutes.

Prefer sliders, segmented controls, toggles, and short text inputs over long questionnaires.

### Research-informed, not clinical

This is a personal self-tracking tool, not a diagnostic or medical application.

Do not label scores as diagnoses or make clinical claims.

### Structured data + free-form journaling

Keep quantitative metadata separate from the journal body.

Structured metadata should be machine-readable.

The journal should remain human-readable Markdown.

---

## Repository Structure

Use a structure similar to:

```text
src/
├── components/
│   ├── mood/
│   ├── cognition/
│   ├── physical/
│   ├── social/
│   ├── sleep/
│   ├── context/
│   ├── events/
│   └── journal/
├── pages/
├── hooks/
├── lib/
│   ├── analytics/
│   ├── markdown/
│   └── storage/
├── types/
└── App.tsx
```

Keep domain logic out of UI components whenever practical.

---

## Core Data Model

Use a strongly typed TypeScript model.

```ts
interface JournalEntry {
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
```

Keep this model stable. If the model changes, update serialization, parsing, storage, analytics, and tests together.

---

## Daily Check-in

The check-in should contain:

### Emotional State

All 1–10:

- Overall mood
- Positive affect
- Negative affect
- Stress
- Anxiety
- Irritability
- Loneliness
- Calmness

### Cognitive State

All 1–10:

- Energy
- Focus
- Motivation
- Mental fatigue

### Physical State

- Physical wellbeing: 1–10
- Pain: 0–10
- Tiredness: 1–10

### Social State

- Social connection: 1–10
- Social satisfaction: 1–10

### Coping

- Ability to handle today's challenges: 1–10

### Sleep

- Duration in hours
- Sleep quality: 1–10
- Restedness: 1–10

### Context

Day type:

- Workday
- Weekend
- Holiday
- Sick day
- Other

Main activity:

- Work
- Study
- Exercise
- Eating
- Commuting
- Socializing
- Relaxing
- Entertainment
- Browsing
- Other

Location:

- Home
- Work
- Outdoors
- Transport
- Other

Social context:

- Alone
- Partner
- Family
- Friends
- Colleagues
- Other

### Events

Collect:

- Best thing that happened
- Worst thing that happened
- Anything else important
- Optional mood impact: -5 to +5

### Journal

Provide a large free-form Markdown-compatible text area.

Do not mix journal text into the structured metric controls.

---

## UI Guidelines

The UI should be:

- Minimal
- Calm
- Responsive
- Mobile-friendly
- Desktop-friendly
- Keyboard accessible
- Touch-friendly
- Fast to load

Avoid:

- Excessive animations
- Gamification
- Streak pressure
- Aggressive notifications
- Excessive gradients
- Decorative UI that interferes with journaling
- Clinical-looking dashboards

Use clear section headings and progressive visual hierarchy.

Every numeric slider should display its current value.

---

## Dashboard

After saving an entry, display:

- Today's mood
- Today's energy
- Today's stress
- Today's focus
- 7-day average mood
- 7-day average stress
- 7-day average energy
- 7-day average focus
- Number of completed check-ins
- Simple trend charts

If there is insufficient data, show a useful empty state instead of inventing values.

Analytics must use only available data.

---

## Analytics

Create pure functions for calculations.

Examples:

```ts
calculateAverageMood(entries)
calculateAverageStress(entries)
calculateAverageEnergy(entries)
calculateAverageFocus(entries)
calculateMoodTrend(entries)
calculateCompletionRate(entries)
```

Keep analytics deterministic and independently testable.

Do not claim causal relationships.

For example, the UI may say:

> "Mood was lower on days with less sleep."

It should not automatically say:

> "Poor sleep caused your mood to decrease."

---

## Markdown Architecture

Create a dedicated Markdown adapter.

Required functions:

```ts
serializeJournalEntry(entry: JournalEntry): string

parseJournalEntry(markdown: string): JournalEntry
```

The intended format is YAML frontmatter followed by Markdown:

```md
---
date: 2026-10-22
mood:
  overall: 7
  positive_affect: 8
  negative_affect: 3
  stress: 4
  anxiety: 2
  irritability: 2
  loneliness: 3
  calmness: 7
cognition:
  energy: 5
  focus: 8
  motivation: 6
  mental_fatigue: 4
physical:
  wellbeing: 8
  pain: 1
  tiredness: 4
social:
  connection: 7
  satisfaction: 7
coping:
  challenge_handling: 8
sleep:
  duration_hours: 6.5
  quality: 6
  restedness: 5
context:
  day_type: workday
  activity: work
  location: work
  social_context: colleagues
events:
  best: "..."
  worst: "..."
  other: "..."
  impact: -2
---

# Journal

Normal free-form journal text goes here.
```

The serializer must preserve the journal body.

The parser must gracefully handle missing optional metadata.

---

## Persistence

For V1:

```text
JournalEntry
    ↓
JSON serialization
    ↓
localStorage
```

Use a versioned storage key, for example:

```text
mood-journal:v1
```

Do not scatter direct `localStorage` calls throughout React components.

Create a storage abstraction such as:

```ts
saveJournalEntry(entry)
getJournalEntry(date)
getJournalEntries()
deleteJournalEntry(date)
```

This abstraction will later be replaceable with a Markdown filesystem adapter.

---

## Browser Extension Compatibility

The architecture should anticipate a future WebExtension.

Do not tightly couple the current application to browser-extension APIs.

Create interfaces around external data access.

For example:

```ts
interface JournalStore {
  save(entry: JournalEntry): Promise<void>;
  get(date: string): Promise<JournalEntry | null>;
  getAll(): Promise<JournalEntry[]>;
}
```

V1 can implement:

```ts
LocalStorageJournalStore
```

Future versions can implement:

```ts
MarkdownJournalStore
```

or communicate with a native host.

Similarly, webpage metadata extraction should eventually be represented as a separate layer:

```ts
interface MetadataExtractor {
  extract(): Partial<JournalEntry>;
}
```

---

## Validation

Validate user input before saving.

Rules:

- Mood metrics: 1–10
- Pain: 0–10
- Event impact: -5 to +5
- Sleep duration: reasonable non-negative number
- Date must be valid ISO date
- Required structured fields should have sensible defaults or explicit incomplete states

Do not silently convert invalid user input into arbitrary values.

---

## Accessibility

Follow basic WCAG practices.

Requirements:

- Every input has an accessible label.
- Sliders are keyboard accessible.
- Do not rely solely on color to communicate state.
- Maintain sufficient text contrast.
- Buttons have clear labels.
- Focus states must be visible.
- Mobile controls should have sufficiently large hit areas.

---

## Testing

Write unit tests for:

- Markdown serialization
- Markdown parsing
- Analytics functions
- Validation
- Date handling
- Local storage adapter

At minimum test:

1. Complete journal entry round-trip:
   `entry → markdown → entry`
2. Missing optional metadata
3. Empty journal body
4. Multiline journal text
5. Special Markdown characters
6. Invalid numeric values
7. Multiple days of journal data
8. Empty analytics dataset
9. One-entry analytics dataset

---

## Error Handling

Never silently discard journal data.

If saving fails:

- Show an error.
- Keep the user's form data intact.
- Allow retry.

If Markdown parsing fails:

- Report that the journal could not be parsed.
- Do not overwrite the source data.

---

## Development Workflow

Before implementing a feature:

1. Inspect the existing code.
2. Identify the relevant domain/model layer.
3. Reuse existing abstractions.
4. Avoid duplicating state or business logic.
5. Implement the smallest coherent change.
6. Run type checking.
7. Run tests.
8. Run the production build.

Do not make unrelated refactors while implementing features.

---

## Code Quality

Prefer:

- Small components
- Pure functions
- Strong TypeScript types
- Explicit interfaces
- Descriptive names
- Early validation
- Single-responsibility modules

Avoid:

- `any` unless unavoidable
- Global mutable state
- Business logic inside JSX
- Duplicated calculations
- Magic numbers
- Direct filesystem assumptions in browser code
- Hardcoded website selectors in core application logic

---

## Future Roadmap

Do not implement these in V1, but preserve architectural boundaries for them:

### V2 — Markdown persistence

Read/write actual daily Markdown files.

### V3 — Browser extension

Build a WebExtension that:

- Reads metadata from configured DOM selectors.
- Reads today's Markdown metadata.
- Writes updated metadata.
- Displays metadata as a page overlay.

### V4 — Automatic contextual data

Potential sources:

- Browser activity
- Time of day
- Calendar context
- Exercise data
- Sleep data
- Weather
- Screen time

Automatic data should be clearly distinguished from subjective self-reported data.

### V5 — Longitudinal analysis

Potential analysis:

- Mood vs sleep
- Mood vs exercise
- Mood vs work duration
- Mood vs social interaction
- Stress vs focus
- Energy vs sleep
- Day-of-week effects
- Time-of-day effects
- Event impact
- Lagged relationships between variables

### V6 — Personal analytics assistant

Allow an LLM to answer questions about the journal.

Examples:

- "What factors are most associated with low mood?"
- "What tends to happen before high-stress days?"
- "Compare my workdays and weekends."
- "Show me my mood trend over the last 90 days."
- "What patterns changed this month?"

LLM output should distinguish between correlation, observation, and causation.

---

## Important Privacy Principle

Treat journal data as sensitive personal information.

The default architecture should be local-first.

Do not transmit journal content or mood data to external services without an explicit user action.

Any future AI integration should clearly identify:

- What data is being sent
- Where it is being sent
- Why it is being sent
- Whether it is stored remotely

---

## Definition of Done

A V1 implementation is complete when:

- The daily check-in can be completed end-to-end.
- All specified metrics are represented.
- Data persists across page reloads.
- A saved entry can be edited.
- Multiple dates can be stored.
- The dashboard displays historical averages.
- Trend charts work with available data.
- Markdown serialization and parsing are implemented and tested.
- The journal body remains separate from structured metadata.
- The application builds successfully.
- No TypeScript errors remain.
- No critical console errors remain.
- The architecture can later support a Markdown-backed browser extension without rewriting the UI.